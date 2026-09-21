"""Fetch, diff, and merge Pepipedia monographs into src/lib/data/library.json.

Called by helper.sh, which sets ROOT, WORK, and LIB.
"""

import glob
import hashlib
import json
import os
import sys
import time
import urllib.parse
import urllib.request

WORK = os.environ["WORK"]
LIB = os.environ["LIB"]
RAW = os.path.join(WORK, "raw")
TODO = os.path.join(WORK, "todo.json")
PARAPHRASED = os.path.join(WORK, "paraphrased.json")
API = "https://www.pepipedia.com/api"

# Pepipedia's mechanism text for these describes a different compound.
# Keep them blank until upstream fixes it (the page shows a note instead).
MISMATCHED_MECHANISM = {"ct-388", "efinopegdutide", "slu-pp-332"}

# Pepipedia's 17 categories folded into the site's nine systems.
SYSTEMS = {
    "neurological-cognitive": "brain",
    "pain-and-analgesia": "brain",
    "digestive": "digestive",
    "gastrointestinal-and-hepatic": "digestive",
    "metabolism-and-weight-management": "metabolic",
    "weight-management": "metabolic",
    "dermatological": "skin",
    "immune-system": "immune",
    "musculoskeletal": "musculoskeletal",
    "bone-and-musculoskeletal": "musculoskeletal",
    "reproductive": "reproductive",
    "cardiovascular": "cardiovascular",
    "cardiovascular-and-renal": "cardiovascular",
    "blood-and-hematology": "cardiovascular",
    "cancer-and-oncology": "oncology-imaging",
    "infectious-disease": "oncology-imaging",
    "diagnostic-and-imaging": "oncology-imaging",
}

NO_BOX = {"", "not applicable - not fda approved", "no black box warning"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        return res.read()


def fetch():
    listing = json.loads(get(f"{API}/getAllPeptides"))
    slugs = [item["slug"] for item in listing]
    failed = []
    for slug in slugs:
        try:
            body = get(f"{API}/getPeptide?slug={urllib.parse.quote(slug)}")
            with open(os.path.join(RAW, f"{slug}.json"), "wb") as out:
                out.write(body)
        except Exception as error:  # noqa: BLE001 — report and keep going
            failed.append(f"{slug}: {error}")
        time.sleep(0.3)  # be polite to Pepipedia
    print(f"fetched {len(slugs) - len(failed)} of {len(slugs)} monographs into {RAW}")
    if failed:
        print("failed:\n  " + "\n  ".join(failed))
        sys.exit(1)


def raw_entries():
    entries = {}
    for path in sorted(glob.glob(os.path.join(RAW, "*.json"))):
        fields = json.load(open(path))["fields"]
        entries[fields["id-name"]] = fields
    if not entries:
        sys.exit(f"no raw data in {RAW}; run `helper.sh fetch` first")
    return entries


def source_hash(fields):
    text = "\x1f".join(
        [fields["description"], fields["mechanismOfAction"], fields["safetyProfile"]]
    )
    return hashlib.sha1(text.encode()).hexdigest()[:12]


def load_library():
    return {entry["slug"]: entry for entry in json.load(open(LIB))}


def diff():
    raw = raw_entries()
    lib = load_library()
    new = sorted(set(raw) - set(lib))
    removed = sorted(set(lib) - set(raw))
    changed = sorted(
        slug
        for slug in set(raw) & set(lib)
        if source_hash(raw[slug]) != lib[slug].get("sourceHash")
    )
    unmapped = sorted(
        {f["categorySlug"] for f in raw.values()} - set(SYSTEMS)
    )

    todo = [
        {
            "slug": slug,
            "name": raw[slug]["Peptide name"].strip(),
            "description": raw[slug]["description"],
            "mechanism": raw[slug]["mechanismOfAction"],
            "safety": raw[slug]["safetyProfile"],
        }
        for slug in new + changed
    ]
    json.dump(todo, open(TODO, "w"), indent=1, ensure_ascii=False)

    print(f"pepipedia: {len(raw)}   library: {len(lib)}")
    print(f"new ({len(new)}): {' '.join(new) or '—'}")
    print(f"prose changed ({len(changed)}): {' '.join(changed) or '—'}")
    print(f"removed upstream ({len(removed)}): {' '.join(removed) or '—'}")
    if unmapped:
        print(f"UNMAPPED categories (add to SYSTEMS in library.py): {' '.join(unmapped)}")
    print(f"{len(todo)} entries to paraphrase -> {TODO}")


def clean_list(items):
    """Rejoin items Pepipedia split inside parentheses; capitalise each."""
    out, buffer = [], ""
    for item in (part.strip() for part in items):
        if not item:
            continue
        buffer = f"{buffer}, {item}" if buffer else item
        if buffer.count("(") <= buffer.count(")"):
            out.append(buffer.rstrip(".").strip())
            buffer = ""
    if buffer:
        out.append(buffer.rstrip(".").strip())
    return [item[0].upper() + item[1:] for item in out]


def system_for(fields):
    # Pepipedia files GLP-1s under "Digestive"; its navbar label says metabolic.
    navbar = fields.get("Category for Navbar") or ""
    if "Weight" in navbar or "Metabolic" in navbar:
        return "metabolic"
    return SYSTEMS[fields["categorySlug"]]


def status_for(legal):
    value = legal.lower()
    if "research" in value or "unapproved new drug" in value:
        return "research"
    if "investigational" in value or value in ("not approved", "not fda approved"):
        return "investigational"
    if "fda approved" in value or "prescription" in value or value == "otc":
        return "approved"
    return "other"


def merge():
    raw = raw_entries()
    lib = load_library()
    paraphrased = {}
    if os.path.exists(PARAPHRASED):
        paraphrased = {e["slug"]: e for e in json.load(open(PARAPHRASED))}

    out, missing = [], []
    for slug, fields in raw.items():
        digest = source_hash(fields)
        if slug in paraphrased:
            prose = paraphrased[slug]
        elif slug in lib and lib[slug].get("sourceHash") == digest:
            prose = lib[slug]
        else:
            missing.append(slug)
            continue

        effects = fields["effects"]
        if isinstance(effects, str):
            effects = [part.strip() for part in effects.split("|")]
        box = (fields.get("blackBoxWarning") or "").strip()

        entry = {
            "slug": slug,
            "name": fields["Peptide name"].strip(),
            "synonyms": [name for name in fields["alternativeNames"] if name],
            "system": system_for(fields),
            "pepipediaCategory": fields["Category"],
            "effects": [effect for effect in effects if effect],
            "researchScore": fields["researchScore"],
            "popularity": fields["Popularity"],
            "legal": fields["legalStatusUS"],
            "status": status_for(fields["legalStatusUS"]),
            "approval": fields["humanApprovalStatus"],
            "evidence": fields["clinicalEvidence"],
            "primaryUse": fields.get("primaryUse") or "",
            "indication": fields["primaryIndication"],
            "origin": fields["origin"],
            "sideEffects": clean_list(fields["sideEffects"]),
            "summary": prose["summary"],
            "mechanism": "" if slug in MISMATCHED_MECHANISM else prose["mechanism"],
            "safety": prose["safety"],
            "isNew": bool(fields["isNew"]),
            "sourceHash": digest,
        }
        if box.lower() not in NO_BOX:
            entry["boxedWarning"] = box
        out.append(entry)

    if missing:
        sys.exit(
            "no paraphrase for: " + " ".join(sorted(missing))
            + f"\nadd them to {PARAPHRASED} and re-run merge"
        )

    out.sort(key=lambda entry: entry["slug"])
    with open(LIB, "w") as handle:
        json.dump(out, handle, indent=1, ensure_ascii=False)
        handle.write("\n")
    print(f"wrote {len(out)} entries to {LIB}")


if __name__ == "__main__":
    {"fetch": fetch, "diff": diff, "merge": merge}[sys.argv[1]]()
