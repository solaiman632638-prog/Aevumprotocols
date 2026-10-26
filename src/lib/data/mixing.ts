import { guides } from "@/lib/data/guides";
import { library } from "@/lib/data/library";

/**
 * Same-syringe compatibility for every compound on the site: the injectable
 * protocols plus every Pepipedia monograph in the library.
 * There is almost no published stability data for mixing research peptides,
 * so most of this is community practice or drug class. Anything no rule covers
 * stays "unknown" rather than guessed.
 */
export type MixStatus = "blend" | "mixed" | "separate" | "never" | "unknown";

export const mixStatuses: { slug: MixStatus; name: string; color: string }[] = [
  { slug: "blend", name: "Sold pre-blended", color: "var(--color-recovery)" },
  { slug: "mixed", name: "Commonly mixed (anecdotal)", color: "var(--color-sleep)" },
  { slug: "separate", name: "Usually kept separate (anecdotal)", color: "var(--color-strain)" },
  { slug: "never", name: "Do not mix", color: "var(--color-warn)" },
  { slug: "unknown", name: "No entry", color: "var(--color-dim)" },
];

/** Worst first, so a group takes the status of its weakest pair. */
const severity: MixStatus[] = ["never", "separate", "unknown", "mixed", "blend"];

export type MixPeptide = { slug: string; name: string };

/** Blend vials; their parts are listed on their own. */
const blends = new Set(["glow", "klow", "wolverine-stack", "cjc-1295", "semax-selank-blend"]);

/** Library slugs that duplicate a protocol under another slug. */
const libraryDuplicates = new Set(["igf-1-des-1-3"]);

const injectableGuides = guides.filter((guide) => /subcutaneous|intramuscular/i.test(guide.route) && !blends.has(guide.slug));
const guideSlugs = new Set(injectableGuides.map((guide) => guide.slug));

/** Every single compound, A–Z. Blend vials are out; their parts are in. */
export const mixPeptides: MixPeptide[] = [
  ...injectableGuides.map((guide) => ({ slug: guide.slug, name: guide.name })),
  ...library
    .filter((entry) => !guideSlugs.has(entry.slug) && !blends.has(entry.slug) && !libraryDuplicates.has(entry.slug))
    .map((entry) => ({ slug: entry.slug, name: entry.name })),
].sort((a, b) => a.name.localeCompare(b.name));

type Entry = { status: MixStatus; note: string };

const glow = ["bpc-157", "tb-500", "ghk-cu"];
const klow = [...glow, "kpv"];

const pairs: [string, string, Entry][] = [
  ...pairsWithin(klow).map(([a, b]): [string, string, Entry] => [
    a,
    b,
    { status: "blend", note: glow.includes(a) && glow.includes(b) ? "Both are in the GLOW and KLOW blend vials." : "Both are in the KLOW blend vial." },
  ]),
  ["bpc-157", "tb-500", { status: "blend", note: "Sold together as the Wolverine vial, and in GLOW and KLOW." }],
  ["cjc-1295-no-dac", "ipamorelin", { status: "blend", note: "Sold together as the CJC-1295 / Ipamorelin vial." }],
  ["tesamorelin", "ipamorelin", { status: "mixed", note: "Often drawn into one evening injection; no formal stability data." }],
  ["semaglutide", "cagrilintide", { status: "separate", note: "Trialled as CagriSema, a purpose-made co-formulation. Mixing two separate vials is untested." }],
  ["glutathione", "ghk-cu", { status: "never", note: "Glutathione reduces and binds copper, breaking down GHK-Cu." }],
];

function pairsWithin(slugs: string[]): [string, string][] {
  return slugs.flatMap((a, index) => slugs.slice(index + 1).map((b): [string, string] => [a, b]));
}

const key = (a: string, b: string) => [a, b].sort().join("|");
const table = new Map(pairs.map(([a, b, entry]) => [key(a, b), entry]));

const glp1 = new Set([
  "tirzepatide", "retatrutide", "semaglutide", "mazdutide", "survodutide", "cagrilintide",
  "dapiglutide", "dulaglutide", "ecnoglutide", "efinopegdutide", "exenatide", "liraglutide",
  "maridebart-cafraglutide", "pemvidutide", "pramlintide", "ct-388", "vk-2735",
]);
const ghrh = new Set(["tesamorelin", "sermorelin", "cjc-1295-no-dac", "cjc-1295-dac", "growth-hormone-releasing-hormone"]);
const ghrp = new Set(["ipamorelin", "ghrp-2", "ghrp-6", "hexarelin"]);
const igf = new Set(["igf-1-lr3", "igf-1-des", "mgf-mechano-growth-factor", "peg-mgf"]);
const melanocortin = new Set(["melanotan-1", "melanotan-2", "pt-141", "setmelanotide"]);

/** Compounds that never go in a syringe, by how they are taken. */
const notInjected = new Map<string, string>([
  ...["orforglipron", "oral-amycretin", "mk-677", "larazotide-acetate", "linaclotide", "plecanatide", "odevixibat", "dihexa", "trofinetide", "voclosporin"].map((slug): [string, string] => [slug, "taken by mouth"]),
  ...["semax", "selank", "n-acetyl-semax-amidate", "n-acetyl-selank-amidate"].map((slug): [string, string] => [slug, "used as a nasal spray"]),
  ...[
    "ahk-cu", "argireline", "decapeptide-12", "ghk-basic", "keratin-peptides", "matrixyl", "nonapeptide-1", "pal-ahk", "pal-ghk",
    "palmitoyl-dipeptide-6", "palmitoyl-hexapeptide-12", "palmitoyl-pentapeptide-4", "pentapeptide-18", "snap-8", "syn-ake",
    "syn-coll", "tripeptide-29", "vialox-pentapeptide-3v",
  ].map((slug): [string, string] => [slug, "applied to the skin"]),
  ...["afamelanotide", "goserelin"].map((slug): [string, string] => [slug, "given as an implant"]),
]);

/** Approved drugs with no protocol here: given by prescription, to their own label. */
const prescription = new Set(library.filter((entry) => entry.status === "approved" && !guideSlugs.has(entry.slug)).map((entry) => entry.slug));
const nameOf = new Map(mixPeptides.map((peptide) => [peptide.slug, peptide.name]));
/** Need a co-solvent before bac water, so other peptides may not stay dissolved. */
const ownMixing = new Set(guides.filter((guide) => guide.ownMixing).map((guide) => guide.slug));

export function checkPair(a: string, b: string): Entry {
  const listed = table.get(key(a, b));
  if (listed) return listed;
  const either = (set: Set<string>) => set.has(a) || set.has(b);
  const both = (set: Set<string>) => set.has(a) && set.has(b);
  const oral = notInjected.has(a) ? a : notInjected.has(b) ? b : null;
  if (oral) {
    return { status: "never", note: `${nameOf.get(oral)} is ${notInjected.get(oral)}, not drawn into a syringe.` };
  }
  if (either(glp1)) {
    return {
      status: "never",
      note: "Incretin and amylin drugs are buffered formulations. Their labels say never to mix them with insulin; nothing supports mixing with peptides either.",
    };
  }
  const drug = prescription.has(a) ? a : prescription.has(b) ? b : null;
  if (drug) {
    return { status: "never", note: `${nameOf.get(drug)} is a prescription or clinic drug made to its own label. Do not mix it with anything.` };
  }
  if (a === "ghk-cu" || b === "ghk-cu") {
    return { status: "separate", note: "Free copper can oxidize or bind other peptides outside the tested blends." };
  }
  if (a === "nad-plus" || b === "nad-plus") {
    return { status: "separate", note: "Usually injected alone and slowly; it stings and takes volume." };
  }
  if (a === "glutathione" || b === "glutathione") {
    return { status: "separate", note: "A reducing agent that can disturb peptides with disulfide bonds." };
  }
  if (a === "l-carnitine" || b === "l-carnitine") {
    return { status: "separate", note: "A ready-made, high-volume solution, usually injected on its own." };
  }
  if (either(ownMixing)) {
    return { status: "separate", note: "Dissolved with its own co-solvent; other peptides may not stay in solution with it." };
  }
  if (either(igf)) {
    return { status: "separate", note: "IGF-1 peptides are usually injected alone, often intramuscularly around training." };
  }
  if (both(ghrh)) {
    return { status: "separate", note: "Two GHRH analogs. Not a pairing to stack, let alone mix." };
  }
  if (both(ghrp)) {
    return { status: "separate", note: "Two GHRPs on the same receptor. Not a pairing to stack, let alone mix." };
  }
  if ((ghrh.has(a) && ghrp.has(b)) || (ghrp.has(a) && ghrh.has(b))) {
    if (a === "cjc-1295-dac" || b === "cjc-1295-dac") {
      return { status: "separate", note: "CJC-1295 with DAC is weekly; GHRPs are daily. The schedules do not line up." };
    }
    return { status: "mixed", note: "A GHRH + GHRP pair is often drawn into one injection; no formal stability data." };
  }
  if (both(melanocortin)) {
    return { status: "separate", note: "Both act on melanocortin receptors. Not a pairing to stack, let alone mix." };
  }
  return { status: "unknown", note: "No compatibility data. Treat as separate injections." };
}

export function worstStatus(statuses: MixStatus[]): MixStatus {
  return severity.find((status) => statuses.includes(status)) ?? "unknown";
}
