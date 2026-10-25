import { protocols } from "@/lib/data/protocols";

/**
 * Same-syringe compatibility for the injectable worksheets. There is almost no
 * published stability data for mixing research peptides, so most of this is
 * community practice. Anything not listed stays "unknown" rather than guessed.
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

const blends = new Set(["wolverine-stack", "klow"]);
const displayName: Record<string, string> = { "cjc-1295": "CJC-1295" };

/** Single-compound injectable worksheets; nasal sprays and blend vials are out. */
export const mixPeptides: MixPeptide[] = protocols
  .filter((protocol) => protocol.route.startsWith("Subcutaneous") && !blends.has(protocol.slug))
  .map((protocol) => ({ slug: protocol.slug, name: displayName[protocol.slug] ?? protocol.name }));

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
  ["cjc-1295", "ipamorelin", { status: "blend", note: "Sold together as the CJC-1295 / Ipamorelin vial." }],
  ["tesamorelin", "ipamorelin", { status: "mixed", note: "Often drawn into one evening injection; no formal stability data." }],
  ["tesamorelin", "cjc-1295", { status: "separate", note: "Two GHRH analogs. Not a pairing to stack, let alone mix." }],
  ["glutathione", "ghk-cu", { status: "never", note: "Glutathione reduces and binds copper, breaking down GHK-Cu." }],
];

function pairsWithin(slugs: string[]): [string, string][] {
  return slugs.flatMap((a, index) => slugs.slice(index + 1).map((b): [string, string] => [a, b]));
}

const key = (a: string, b: string) => [a, b].sort().join("|");
const table = new Map(pairs.map(([a, b, entry]) => [key(a, b), entry]));

const glp1 = new Set(["tirzepatide", "retatrutide", "semaglutide"]);

export function checkPair(a: string, b: string): Entry {
  const listed = table.get(key(a, b));
  if (listed) return listed;
  if (glp1.has(a) || glp1.has(b)) {
    return {
      status: "never",
      note: "Incretin drugs are buffered formulations. Their labels say never to mix them with insulin; nothing supports mixing with peptides either.",
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
  return { status: "unknown", note: "No compatibility data. Treat as separate injections." };
}

export function worstStatus(statuses: MixStatus[]): MixStatus {
  return severity.find((status) => statuses.includes(status)) ?? "unknown";
}
