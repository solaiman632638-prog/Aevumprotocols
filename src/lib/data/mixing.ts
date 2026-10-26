import { guides } from "@/lib/data/guides";

/**
 * Same-syringe compatibility for every injectable peptide with a protocol.
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

/** Single-compound injectables, A–Z. Nasal sprays and blend vials are out. */
export const mixPeptides: MixPeptide[] = guides
  .filter((guide) => /subcutaneous|intramuscular/i.test(guide.route) && !blends.has(guide.slug))
  .map((guide) => ({ slug: guide.slug, name: guide.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

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

const glp1 = new Set(["tirzepatide", "retatrutide", "semaglutide", "mazdutide", "survodutide", "cagrilintide"]);
const ghrh = new Set(["tesamorelin", "sermorelin", "cjc-1295-no-dac", "cjc-1295-dac"]);
const ghrp = new Set(["ipamorelin", "ghrp-2", "ghrp-6"]);
const igf = new Set(["igf-1-lr3", "igf-1-des"]);
const melanocortin = new Set(["melanotan-1", "melanotan-2", "pt-141"]);
/** Need a co-solvent before bac water, so other peptides may not stay dissolved. */
const ownMixing = new Set(guides.filter((guide) => guide.ownMixing).map((guide) => guide.slug));

export function checkPair(a: string, b: string): Entry {
  const listed = table.get(key(a, b));
  if (listed) return listed;
  const either = (set: Set<string>) => set.has(a) || set.has(b);
  const both = (set: Set<string>) => set.has(a) && set.has(b);
  if (either(glp1)) {
    return {
      status: "never",
      note: "Incretin and amylin drugs are buffered formulations. Their labels say never to mix them with insulin; nothing supports mixing with peptides either.",
    };
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
