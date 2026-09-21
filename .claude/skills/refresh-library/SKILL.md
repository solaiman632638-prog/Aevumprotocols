---
name: refresh-library
description: Refresh the peptide library (src/lib/data/library.json) from Pepipedia — fetch every monograph, find new, changed, and removed entries, paraphrase only what changed, rebuild, and verify NovaEvum store links. Use when asked to update, sync, or refresh the library or Pepipedia data.
---

# Refresh the Pepipedia library

`src/lib/data/library.json` is a snapshot of every monograph on
https://www.pepipedia.com/peptides. Factual fields (status, approval, evidence,
side effects, scores, categories) come straight from Pepipedia. The prose
fields — `summary`, `mechanism`, `safety` — are **paraphrased**, never copied.
Each entry's `sourceHash` fingerprints the Pepipedia prose it was written from,
so only entries whose source changed need rewriting.

All steps go through `scripts/helper.sh` (run it from anywhere in the repo).

## 1. Fetch

```bash
.claude/skills/refresh-library/scripts/helper.sh fetch
```

Downloads all monographs from Pepipedia's public API (`/api/getAllPeptides`,
`/api/getPeptide?slug=`), throttled to ~3 requests/second. Takes about a
minute. If it reports failures, re-run once; if they persist, stop and tell
the user which slugs failed.

## 2. Diff

```bash
.claude/skills/refresh-library/scripts/helper.sh diff
```

Prints new, prose-changed, and removed slugs, and writes the entries needing
new prose to `$WORK/todo.json` (path is printed). Factual-field changes need no
action — merge picks them up automatically.

- **UNMAPPED categories** in the output: Pepipedia added a category. Add it to
  `SYSTEMS` in `scripts/library.py`, mapping to one of the nine site systems in
  `src/lib/data/library.ts` (`brain`, `digestive`, `metabolic`, `skin`,
  `immune`, `musculoskeletal`, `reproductive`, `cardiovascular`,
  `oncology-imaging`). Re-run diff.
- **Removed upstream**: merge drops them. If a removed slug has a NovaEvum
  worksheet (see `pepipediaSlug` in `src/lib/data/pepipedia.ts`), tell the
  user — the worksheet's "Library entry" link will disappear.
- **Nothing to paraphrase**: skip to step 4.

## 3. Paraphrase

For each entry in `todo.json`, write `{slug, summary, mechanism, safety}` into
`$WORK/paraphrased.json` (a JSON array). Rules:

- Paraphrase. Do not copy sentences or distinctive phrases.
- Keep facts accurate. Add nothing the source does not say.
- **Never add doses, amounts, or usage advice.** Pepipedia publishes none and
  the library carries none.
- `summary`: 2–3 sentences, ≤ ~60 words — what it is, origin, what it is
  studied or approved for, strength of evidence if stated.
- `mechanism`: 1–3 sentences, ≤ ~55 words.
- `safety`: 1–2 sentences, ≤ ~35 words.
- Voice: plain, terse, declarative, no hype. Match existing entries, e.g.
  `"A synthetic pentadecapeptide taken from a protective protein in gastric
  juice. Animal work points to angiogenesis, collagen, and gut-mucosa repair.
  Controlled human trials are absent."`
- Keep typography from the source (°, –, β, µ).
- If an entry's mechanism describes a different compound than its
  description, flag it to the user and add the slug to `MISMATCHED_MECHANISM`
  in `scripts/library.py` (the page then shows a note instead of wrong
  science). Likewise remove a slug from that set if Pepipedia has fixed it.

More than ~30 entries: split `todo.json` into chunks and hand them to
parallel subagents with these rules verbatim, then concatenate their output
into `paraphrased.json`. Validate: valid JSON, one object per todo slug.

## 4. Merge

```bash
.claude/skills/refresh-library/scripts/helper.sh merge
```

Rebuilds `library.json`: facts refreshed for every entry, prose taken from
`paraphrased.json` or kept from the existing entry when the source is
unchanged. It refuses to write if any entry lacks prose — fix the listed slugs
in `paraphrased.json` and re-run.

## 5. Verify

```bash
.claude/skills/refresh-library/scripts/helper.sh check-store
npm run lint && npm run build
```

`check-store` confirms every worksheet's NovaEvum product page
(`https://www.novaevum.ca/shop/<slug>`) answers 200. A failure means the
store renamed or removed a product — report it; do not change slugs without
asking.

Then spot-check with the production server: `/peptides` shows the "On
NovaEvum" group first, and a new or changed entry's page renders.

## 6. Report

Tell the user: counts (total, new, changed, removed), any mismatched or
unmapped entries, store-link failures, and build status. Update the snapshot
date in `README.md` (the line mentioning `/api/getAllPeptides`). Do not commit
unless asked.
