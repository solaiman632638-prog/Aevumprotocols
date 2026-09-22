/**
 * Structured dosing model for the compounds on the protocol pages, used by
 * the peptide check-in. Every number here restates the published protocol
 * (see guides.json); nothing is derived from a user's health metrics.
 */

export type DoseClass =
  | "glp1"
  | "amylin"
  | "glucagon"
  | "ghrh"
  | "ghrp"
  | "igf"
  | "melanocortin"
  | "copper"
  | "healing"
  | "growth-signal"
  | "nootropic"
  | "sleep"
  | "mitochondrial"
  | "immune"
  | "metabolic"
  | "antioxidant";

export type Frequency = "daily" | "weekly" | "several-weekly" | "as-needed";

export type CompoundModel = {
  slug: string;
  name: string;
  /** Unit people usually measure in; amounts are stored in this unit. */
  unit: "mg" | "mcg";
  frequency: Frequency;
  /** Typical amount per dose, in `unit`. */
  range: [number, number];
  /** Upper bound the protocol names; guidance never suggests above it. */
  max: number;
  /** Titration ladder per dose, in `unit`, and weeks to hold each step. */
  titration?: { steps: number[]; weeksPerStep: number };
  /** Protocol run length before a break, in days. */
  cycleDays?: number;
  classes: DoseClass[];
  /** Blends: fraction of each dose that is each component. */
  components?: Record<string, number>;
  route: "subcutaneous" | "subcutaneous-or-im";
};

const m = (model: CompoundModel) => model;

export const compounds: CompoundModel[] = [
  // GLP-1 and metabolic
  m({ slug: "retatrutide", name: "Retatrutide", unit: "mg", frequency: "weekly", range: [2, 12], max: 12, titration: { steps: [2, 4, 6, 9, 12], weeksPerStep: 4 }, classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "tirzepatide", name: "Tirzepatide", unit: "mg", frequency: "weekly", range: [2.5, 15], max: 15, titration: { steps: [2.5, 5, 7.5, 10, 12.5, 15], weeksPerStep: 4 }, classes: ["glp1"], route: "subcutaneous" }),
  m({ slug: "semaglutide", name: "Semaglutide", unit: "mg", frequency: "weekly", range: [0.25, 2.4], max: 2.4, titration: { steps: [0.25, 0.5, 1, 1.7, 2.4], weeksPerStep: 4 }, classes: ["glp1"], route: "subcutaneous" }),
  m({ slug: "mazdutide", name: "Mazdutide", unit: "mg", frequency: "weekly", range: [1.5, 6], max: 6, titration: { steps: [1.5, 3, 4.5, 6], weeksPerStep: 4 }, classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "survodutide", name: "Survodutide", unit: "mg", frequency: "weekly", range: [0.3, 4.8], max: 4.8, titration: { steps: [0.3, 0.6, 1.2, 1.8, 2.4, 3.6, 4.8], weeksPerStep: 4 }, classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "cagrilintide", name: "Cagrilintide", unit: "mg", frequency: "weekly", range: [0.25, 2.4], max: 2.4, titration: { steps: [0.25, 0.5, 1, 1.7, 2.4], weeksPerStep: 4 }, classes: ["amylin"], route: "subcutaneous" }),
  m({ slug: "aod-9604", name: "AOD-9604", unit: "mcg", frequency: "daily", range: [300, 300], max: 300, classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "5-amino-1mq", name: "5-Amino-1MQ", unit: "mg", frequency: "daily", range: [2.5, 5], max: 5, cycleDays: 56, titration: { steps: [2.5, 5], weeksPerStep: 1 }, classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "slu-pp-332", name: "SLU-PP-332", unit: "mg", frequency: "daily", range: [0.5, 1], max: 1, cycleDays: 56, classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "l-carnitine", name: "L-Carnitine", unit: "mg", frequency: "daily", range: [200, 600], max: 600, classes: ["metabolic"], route: "subcutaneous-or-im" }),

  // Healing and recovery
  m({ slug: "bpc-157", name: "BPC-157", unit: "mcg", frequency: "daily", range: [250, 500], max: 500, cycleDays: 56, titration: { steps: [250, 500], weeksPerStep: 2 }, classes: ["healing", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "tb-500", name: "TB-500", unit: "mg", frequency: "several-weekly", range: [2, 2.5], max: 2.5, cycleDays: 84, classes: ["healing", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "wolverine-stack", name: "BPC-157 + TB-500 blend", unit: "mg", frequency: "daily", range: [0.5, 2], max: 2, cycleDays: 84, classes: ["healing", "growth-signal"], components: { "bpc-157": 0.5, "tb-500": 0.5 }, route: "subcutaneous" }),
  m({ slug: "kpv", name: "KPV", unit: "mcg", frequency: "daily", range: [200, 500], max: 500, cycleDays: 28, classes: ["healing"], route: "subcutaneous" }),
  m({ slug: "thymosin-alpha-1", name: "Thymosin Alpha-1", unit: "mg", frequency: "several-weekly", range: [1.5, 1.6], max: 1.6, classes: ["immune"], route: "subcutaneous" }),
  m({ slug: "ll-37", name: "LL-37", unit: "mcg", frequency: "several-weekly", range: [100, 500], max: 500, cycleDays: 14, classes: ["immune"], route: "subcutaneous" }),

  // Growth hormone axis
  m({ slug: "tesamorelin", name: "Tesamorelin", unit: "mg", frequency: "daily", range: [1, 2], max: 2, classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "sermorelin", name: "Sermorelin", unit: "mcg", frequency: "daily", range: [200, 300], max: 300, cycleDays: 84, classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ipamorelin", name: "Ipamorelin", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, titration: { steps: [100, 200, 300], weeksPerStep: 1 }, classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "cjc-1295-no-dac", name: "CJC-1295 (No DAC)", unit: "mcg", frequency: "daily", range: [100, 200], max: 200, cycleDays: 84, classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "cjc-1295", name: "CJC-1295 / Ipamorelin blend", unit: "mcg", frequency: "daily", range: [200, 600], max: 600, cycleDays: 84, titration: { steps: [200, 400, 600], weeksPerStep: 2 }, classes: ["ghrh", "ghrp", "growth-signal"], components: { "cjc-1295-no-dac": 0.5, ipamorelin: 0.5 }, route: "subcutaneous" }),
  m({ slug: "cjc-1295-dac", name: "CJC-1295 (With DAC)", unit: "mg", frequency: "weekly", range: [1, 2], max: 2, cycleDays: 84, classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ghrp-2", name: "GHRP-2", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ghrp-6", name: "GHRP-6", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "kisspeptin-10", name: "Kisspeptin-10", unit: "mcg", frequency: "daily", range: [100, 200], max: 200, cycleDays: 28, classes: ["growth-signal"], route: "subcutaneous" }),
  m({ slug: "igf-1-des", name: "IGF-1 DES", unit: "mcg", frequency: "daily", range: [50, 150], max: 150, cycleDays: 28, classes: ["igf", "growth-signal"], route: "subcutaneous-or-im" }),
  m({ slug: "igf-1-lr3", name: "IGF-1 LR3", unit: "mcg", frequency: "daily", range: [20, 40], max: 50, cycleDays: 42, titration: { steps: [20, 40], weeksPerStep: 2 }, classes: ["igf", "growth-signal"], route: "subcutaneous-or-im" }),

  // Skin, tanning, and sexual health
  m({ slug: "ghk-cu", name: "GHK-Cu", unit: "mg", frequency: "daily", range: [1, 2], max: 2, cycleDays: 30, classes: ["copper"], route: "subcutaneous" }),
  m({ slug: "glow", name: "GLOW blend", unit: "mg", frequency: "daily", range: [1.4, 3.5], max: 3.5, cycleDays: 84, classes: ["copper", "healing", "growth-signal"], components: { "ghk-cu": 5 / 7, "bpc-157": 1 / 7, "tb-500": 1 / 7 }, route: "subcutaneous" }),
  m({ slug: "klow", name: "KLOW blend", unit: "mg", frequency: "daily", range: [1.6, 4], max: 4, cycleDays: 84, classes: ["copper", "healing", "growth-signal"], components: { "ghk-cu": 5 / 8, "bpc-157": 1 / 8, "tb-500": 1 / 8, kpv: 1 / 8 }, route: "subcutaneous" }),
  m({ slug: "melanotan-2", name: "Melanotan-2", unit: "mg", frequency: "several-weekly", range: [0.25, 1], max: 1, classes: ["melanocortin"], route: "subcutaneous" }),
  m({ slug: "melanotan-1", name: "Melanotan-1", unit: "mg", frequency: "several-weekly", range: [0.25, 0.25], max: 0.25, classes: ["melanocortin"], route: "subcutaneous" }),
  m({ slug: "pt-141", name: "PT-141", unit: "mg", frequency: "as-needed", range: [1, 2], max: 2, classes: ["melanocortin"], route: "subcutaneous" }),

  // Longevity and cellular
  m({ slug: "mots-c", name: "MOTS-c", unit: "mg", frequency: "several-weekly", range: [1, 5], max: 5, cycleDays: 56, classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "ss-31", name: "SS-31", unit: "mg", frequency: "several-weekly", range: [5, 10], max: 10, cycleDays: 42, classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "epitalon", name: "Epitalon", unit: "mg", frequency: "daily", range: [5, 10], max: 10, cycleDays: 20, classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "nad-plus", name: "NAD+", unit: "mg", frequency: "several-weekly", range: [20, 100], max: 100, titration: { steps: [20, 50, 100], weeksPerStep: 1 }, cycleDays: 42, classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "glutathione", name: "Glutathione", unit: "mg", frequency: "several-weekly", range: [200, 600], max: 600, classes: ["antioxidant"], route: "subcutaneous-or-im" }),

  // Brain and sleep
  m({ slug: "semax", name: "Semax", unit: "mcg", frequency: "daily", range: [300, 600], max: 600, cycleDays: 10, classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "selank", name: "Selank", unit: "mcg", frequency: "daily", range: [200, 400], max: 400, cycleDays: 14, classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "semax-selank-blend", name: "Semax + Selank blend", unit: "mcg", frequency: "daily", range: [400, 1000], max: 1000, cycleDays: 10, classes: ["nootropic"], components: { semax: 0.5, selank: 0.5 }, route: "subcutaneous" }),
  m({ slug: "pinealon", name: "Pinealon", unit: "mg", frequency: "daily", range: [1, 1.5], max: 1.5, cycleDays: 20, classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "dsip", name: "DSIP", unit: "mcg", frequency: "as-needed", range: [100, 200], max: 200, cycleDays: 14, classes: ["sleep"], route: "subcutaneous" }),
];

const bySlug = new Map(compounds.map((compound) => [compound.slug, compound]));

export function getCompound(slug: string): CompoundModel | undefined {
  return bySlug.get(slug);
}

/** Convert an amount to the compound's own unit. */
export function toUnit(amount: number, from: "mg" | "mcg", to: "mg" | "mcg"): number {
  if (from === to) return amount;
  return from === "mg" ? amount * 1000 : amount / 1000;
}

// ── Injection sites ──────────────────────────────────────────────────────

export type SiteId =
  | "abdomen-upper-left"
  | "abdomen-upper-right"
  | "abdomen-lower-left"
  | "abdomen-lower-right"
  | "flank-left"
  | "flank-right"
  | "thigh-left"
  | "thigh-right"
  | "deltoid-left"
  | "deltoid-right"
  | "triceps-left"
  | "triceps-right"
  | "glute-left"
  | "glute-right";

/** Sites on the body map. x/y are in the 200 × 440 outline's coordinates. */
export const sites: { id: SiteId; label: string; view: "front" | "back"; x: number; y: number; im: boolean }[] = [
  { id: "deltoid-right", label: "Right shoulder", view: "front", x: 58, y: 106, im: true },
  { id: "deltoid-left", label: "Left shoulder", view: "front", x: 142, y: 106, im: true },
  { id: "abdomen-upper-right", label: "Belly, upper right", view: "front", x: 84, y: 176, im: false },
  { id: "abdomen-upper-left", label: "Belly, upper left", view: "front", x: 116, y: 176, im: false },
  { id: "abdomen-lower-right", label: "Belly, lower right", view: "front", x: 84, y: 208, im: false },
  { id: "abdomen-lower-left", label: "Belly, lower left", view: "front", x: 116, y: 208, im: false },
  { id: "flank-right", label: "Right love handle", view: "front", x: 66, y: 196, im: false },
  { id: "flank-left", label: "Left love handle", view: "front", x: 134, y: 196, im: false },
  { id: "thigh-right", label: "Right thigh", view: "front", x: 80, y: 290, im: true },
  { id: "thigh-left", label: "Left thigh", view: "front", x: 120, y: 290, im: true },
  { id: "triceps-left", label: "Back of left arm", view: "back", x: 52, y: 140, im: false },
  { id: "triceps-right", label: "Back of right arm", view: "back", x: 148, y: 140, im: false },
  { id: "glute-left", label: "Left glute", view: "back", x: 82, y: 236, im: true },
  { id: "glute-right", label: "Right glute", view: "back", x: 118, y: 236, im: true },
];

export function siteLabel(id: SiteId): string {
  return sites.find((site) => site.id === id)?.label ?? id;
}

// ── Side effects ─────────────────────────────────────────────────────────

export const symptoms = [
  { id: "nausea", label: "Nausea or vomiting", gi: true },
  { id: "appetite", label: "Very low appetite", gi: true },
  { id: "bowel", label: "Constipation or diarrhea", gi: true },
  { id: "site", label: "Injection-site reaction", gi: false },
  { id: "flushing", label: "Flushing", gi: false },
  { id: "headache", label: "Headache", gi: false },
  { id: "fatigue", label: "Unusual fatigue", gi: false },
  { id: "low-sugar", label: "Shaky, sweaty, or dizzy", gi: false },
  { id: "heart", label: "Racing or pounding heart", gi: false },
  { id: "swelling", label: "Water retention or joint ache", gi: false },
] as const;

export type SymptomId = (typeof symptoms)[number]["id"];
