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
  /**
   * How well the dosing is established.
   * clinical: an approved label or regulator-reviewed schedule.
   * trial: published human trials, no approval for this use.
   * community: research chemical; no established human dosing.
   */
  evidence: "clinical" | "trial" | "community";
  /** Whether human data exists for combining it with other compounds. */
  combinationEvidence?: "some" | "limited" | "none";
  /** Blends: fraction of each dose that is each component. */
  components?: Record<string, number>;
  route: "subcutaneous" | "subcutaneous-or-im";
};

const m = (model: CompoundModel) => model;

export const compounds: CompoundModel[] = [
  // GLP-1 and metabolic
  m({ slug: "retatrutide", name: "Retatrutide", unit: "mg", frequency: "weekly", range: [2, 12], max: 12, titration: { steps: [2, 4, 6, 9, 12], weeksPerStep: 4 }, evidence: "trial", classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "tirzepatide", name: "Tirzepatide", unit: "mg", frequency: "weekly", range: [2.5, 15], max: 15, titration: { steps: [2.5, 5, 7.5, 10, 12.5, 15], weeksPerStep: 4 }, evidence: "clinical", classes: ["glp1"], route: "subcutaneous" }),
  m({ slug: "semaglutide", name: "Semaglutide", unit: "mg", frequency: "weekly", range: [0.25, 2.4], max: 2.4, titration: { steps: [0.25, 0.5, 1, 1.7, 2.4], weeksPerStep: 4 }, evidence: "clinical", combinationEvidence: "some", classes: ["glp1"], route: "subcutaneous" }),
  m({ slug: "mazdutide", name: "Mazdutide", unit: "mg", frequency: "weekly", range: [1.5, 6], max: 6, titration: { steps: [1.5, 3, 4.5, 6], weeksPerStep: 4 }, evidence: "clinical", classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "survodutide", name: "Survodutide", unit: "mg", frequency: "weekly", range: [0.3, 4.8], max: 4.8, titration: { steps: [0.3, 0.6, 1.2, 1.8, 2.4, 3.6, 4.8], weeksPerStep: 4 }, evidence: "trial", classes: ["glp1", "glucagon"], route: "subcutaneous" }),
  m({ slug: "cagrilintide", name: "Cagrilintide", unit: "mg", frequency: "weekly", range: [0.25, 2.4], max: 2.4, titration: { steps: [0.25, 0.5, 1, 1.7, 2.4], weeksPerStep: 4 }, evidence: "trial", combinationEvidence: "some", classes: ["amylin"], route: "subcutaneous" }),
  m({ slug: "aod-9604", name: "AOD-9604", unit: "mcg", frequency: "daily", range: [300, 300], max: 300, evidence: "community", classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "5-amino-1mq", name: "5-Amino-1MQ", unit: "mg", frequency: "daily", range: [2.5, 5], max: 5, cycleDays: 56, titration: { steps: [2.5, 5], weeksPerStep: 1 }, evidence: "community", classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "slu-pp-332", name: "SLU-PP-332", unit: "mg", frequency: "daily", range: [0.5, 1], max: 1, cycleDays: 56, evidence: "community", classes: ["metabolic"], route: "subcutaneous" }),
  m({ slug: "l-carnitine", name: "L-Carnitine", unit: "mg", frequency: "daily", range: [200, 600], max: 600, evidence: "community", classes: ["metabolic"], route: "subcutaneous-or-im" }),

  // Healing and recovery
  m({ slug: "bpc-157", name: "BPC-157", unit: "mcg", frequency: "daily", range: [250, 500], max: 500, cycleDays: 56, titration: { steps: [250, 500], weeksPerStep: 2 }, evidence: "community", classes: ["healing", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "tb-500", name: "TB-500", unit: "mg", frequency: "several-weekly", range: [2, 2.5], max: 2.5, cycleDays: 84, evidence: "community", classes: ["healing", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "wolverine-stack", name: "BPC-157 + TB-500 blend", unit: "mg", frequency: "daily", range: [0.5, 2], max: 2, cycleDays: 84, evidence: "community", combinationEvidence: "limited", classes: ["healing", "growth-signal"], components: { "bpc-157": 0.5, "tb-500": 0.5 }, route: "subcutaneous" }),
  m({ slug: "kpv", name: "KPV", unit: "mcg", frequency: "daily", range: [200, 500], max: 500, cycleDays: 28, evidence: "community", classes: ["healing"], route: "subcutaneous" }),
  m({ slug: "thymosin-alpha-1", name: "Thymosin Alpha-1", unit: "mg", frequency: "several-weekly", range: [1.5, 1.6], max: 1.6, evidence: "trial", classes: ["immune"], route: "subcutaneous" }),
  m({ slug: "ll-37", name: "LL-37", unit: "mcg", frequency: "several-weekly", range: [100, 500], max: 500, cycleDays: 14, evidence: "community", classes: ["immune"], route: "subcutaneous" }),

  // Growth hormone axis
  m({ slug: "tesamorelin", name: "Tesamorelin", unit: "mg", frequency: "daily", range: [1, 2], max: 2, evidence: "clinical", classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "sermorelin", name: "Sermorelin", unit: "mcg", frequency: "daily", range: [200, 300], max: 300, cycleDays: 84, evidence: "clinical", classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ipamorelin", name: "Ipamorelin", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, titration: { steps: [100, 200, 300], weeksPerStep: 1 }, evidence: "community", classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "cjc-1295-no-dac", name: "CJC-1295 (No DAC)", unit: "mcg", frequency: "daily", range: [100, 200], max: 200, cycleDays: 84, evidence: "community", classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "cjc-1295", name: "CJC-1295 / Ipamorelin blend", unit: "mcg", frequency: "daily", range: [200, 600], max: 600, cycleDays: 84, titration: { steps: [200, 400, 600], weeksPerStep: 2 }, evidence: "community", combinationEvidence: "limited", classes: ["ghrh", "ghrp", "growth-signal"], components: { "cjc-1295-no-dac": 0.5, ipamorelin: 0.5 }, route: "subcutaneous" }),
  m({ slug: "cjc-1295-dac", name: "CJC-1295 (With DAC)", unit: "mg", frequency: "weekly", range: [1, 2], max: 2, cycleDays: 84, evidence: "community", classes: ["ghrh", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ghrp-2", name: "GHRP-2", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, evidence: "community", classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "ghrp-6", name: "GHRP-6", unit: "mcg", frequency: "daily", range: [100, 300], max: 300, cycleDays: 84, evidence: "community", classes: ["ghrp", "growth-signal"], route: "subcutaneous" }),
  m({ slug: "kisspeptin-10", name: "Kisspeptin-10", unit: "mcg", frequency: "daily", range: [100, 200], max: 200, cycleDays: 28, evidence: "community", classes: ["growth-signal"], route: "subcutaneous" }),
  m({ slug: "igf-1-des", name: "IGF-1 DES", unit: "mcg", frequency: "daily", range: [50, 150], max: 150, cycleDays: 28, evidence: "community", classes: ["igf", "growth-signal"], route: "subcutaneous-or-im" }),
  m({ slug: "igf-1-lr3", name: "IGF-1 LR3", unit: "mcg", frequency: "daily", range: [20, 40], max: 50, cycleDays: 42, titration: { steps: [20, 40], weeksPerStep: 2 }, evidence: "community", classes: ["igf", "growth-signal"], route: "subcutaneous-or-im" }),

  // Skin, tanning, and sexual health
  m({ slug: "ghk-cu", name: "GHK-Cu", unit: "mg", frequency: "daily", range: [1, 2], max: 2, cycleDays: 30, evidence: "community", classes: ["copper"], route: "subcutaneous" }),
  m({ slug: "glow", name: "GLOW blend", unit: "mg", frequency: "daily", range: [1.4, 3.5], max: 3.5, cycleDays: 84, evidence: "community", combinationEvidence: "limited", classes: ["copper", "healing", "growth-signal"], components: { "ghk-cu": 5 / 7, "bpc-157": 1 / 7, "tb-500": 1 / 7 }, route: "subcutaneous" }),
  m({ slug: "klow", name: "KLOW blend", unit: "mg", frequency: "daily", range: [1.6, 4], max: 4, cycleDays: 84, evidence: "community", combinationEvidence: "limited", classes: ["copper", "healing", "growth-signal"], components: { "ghk-cu": 5 / 8, "bpc-157": 1 / 8, "tb-500": 1 / 8, kpv: 1 / 8 }, route: "subcutaneous" }),
  m({ slug: "melanotan-2", name: "Melanotan-2", unit: "mg", frequency: "several-weekly", range: [0.25, 1], max: 1, evidence: "community", classes: ["melanocortin"], route: "subcutaneous" }),
  m({ slug: "melanotan-1", name: "Melanotan-1", unit: "mg", frequency: "several-weekly", range: [0.25, 0.25], max: 0.25, evidence: "trial", classes: ["melanocortin"], route: "subcutaneous" }),
  m({ slug: "pt-141", name: "PT-141", unit: "mg", frequency: "as-needed", range: [1, 2], max: 2, evidence: "clinical", classes: ["melanocortin"], route: "subcutaneous" }),

  // Longevity and cellular
  m({ slug: "mots-c", name: "MOTS-c", unit: "mg", frequency: "several-weekly", range: [1, 5], max: 5, cycleDays: 56, evidence: "community", classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "ss-31", name: "SS-31", unit: "mg", frequency: "several-weekly", range: [5, 10], max: 10, cycleDays: 42, evidence: "trial", classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "epitalon", name: "Epitalon", unit: "mg", frequency: "daily", range: [5, 10], max: 10, cycleDays: 20, evidence: "community", classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "nad-plus", name: "NAD+", unit: "mg", frequency: "several-weekly", range: [20, 100], max: 100, titration: { steps: [20, 50, 100], weeksPerStep: 1 }, cycleDays: 42, evidence: "community", classes: ["mitochondrial"], route: "subcutaneous" }),
  m({ slug: "glutathione", name: "Glutathione", unit: "mg", frequency: "several-weekly", range: [200, 600], max: 600, evidence: "trial", classes: ["antioxidant"], route: "subcutaneous-or-im" }),

  // Brain and sleep
  m({ slug: "semax", name: "Semax", unit: "mcg", frequency: "daily", range: [300, 600], max: 600, cycleDays: 10, evidence: "trial", classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "selank", name: "Selank", unit: "mcg", frequency: "daily", range: [200, 400], max: 400, cycleDays: 14, evidence: "trial", classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "semax-selank-blend", name: "Semax + Selank blend", unit: "mcg", frequency: "daily", range: [400, 1000], max: 1000, cycleDays: 10, evidence: "community", combinationEvidence: "limited", classes: ["nootropic"], components: { semax: 0.5, selank: 0.5 }, route: "subcutaneous" }),
  m({ slug: "pinealon", name: "Pinealon", unit: "mg", frequency: "daily", range: [1, 1.5], max: 1.5, cycleDays: 20, evidence: "community", classes: ["nootropic"], route: "subcutaneous" }),
  m({ slug: "dsip", name: "DSIP", unit: "mcg", frequency: "as-needed", range: [100, 200], max: 200, cycleDays: 14, evidence: "community", classes: ["sleep"], route: "subcutaneous" }),
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
  | "thigh-front-left"
  | "thigh-front-right"
  | "deltoid-left"
  | "deltoid-right"
  | "arm-outer-left"
  | "arm-outer-right"
  | "triceps-left"
  | "triceps-right"
  | "glute-left"
  | "glute-right"
  | "hip-left"
  | "hip-right"
  | "lowback-left"
  | "lowback-right";

/**
 * Injection sites, positioned in the 240 × 520 body outline.
 *
 * Only sites that are actually used for subcutaneous or intramuscular
 * injection are here. Muscles people sometimes inject for size — biceps,
 * pecs, calves, traps — are drawn on the diagram but are not offered:
 * they sit over nerves and vessels, and nothing in this register calls for
 * them. `subq` marks the sites rotation is suggested from.
 */
export const sites: {
  id: SiteId;
  label: string;
  /** The muscle or landmark, for people who want the anatomical name. */
  detail: string;
  view: "front" | "back";
  x: number;
  y: number;
  /** Half-width and half-height of the usable area, not just a point. */
  rx: number;
  ry: number;
  im: boolean;
  subq: boolean;
}[] = [
  // Front
  { id: "deltoid-right", label: "Right shoulder", detail: "Deltoid", view: "front", x: 82, y: 110, rx: 12, ry: 14, im: true, subq: false },
  { id: "deltoid-left", label: "Left shoulder", detail: "Deltoid", view: "front", x: 158, y: 110, rx: 12, ry: 14, im: true, subq: false },
  { id: "arm-outer-right", label: "Right upper arm", detail: "Fat over the outer arm", view: "front", x: 68, y: 162, rx: 9, ry: 17, im: false, subq: true },
  { id: "arm-outer-left", label: "Left upper arm", detail: "Fat over the outer arm", view: "front", x: 172, y: 162, rx: 9, ry: 17, im: false, subq: true },
  { id: "abdomen-upper-right", label: "Belly, upper right", detail: "Two finger-widths clear of the navel", view: "front", x: 106, y: 178, rx: 12, ry: 13, im: false, subq: true },
  { id: "abdomen-upper-left", label: "Belly, upper left", detail: "Two finger-widths clear of the navel", view: "front", x: 134, y: 178, rx: 12, ry: 13, im: false, subq: true },
  { id: "abdomen-lower-right", label: "Belly, lower right", detail: "Two finger-widths clear of the navel", view: "front", x: 106, y: 212, rx: 12, ry: 13, im: false, subq: true },
  { id: "abdomen-lower-left", label: "Belly, lower left", detail: "Two finger-widths clear of the navel", view: "front", x: 134, y: 212, rx: 12, ry: 13, im: false, subq: true },
  { id: "flank-right", label: "Right love handle", detail: "Fat over the oblique", view: "front", x: 88, y: 198, rx: 8, ry: 16, im: false, subq: true },
  { id: "flank-left", label: "Left love handle", detail: "Fat over the oblique", view: "front", x: 152, y: 198, rx: 8, ry: 16, im: false, subq: true },
  { id: "thigh-right", label: "Right outer thigh", detail: "Vastus lateralis", view: "front", x: 94, y: 322, rx: 8, ry: 28, im: true, subq: true },
  { id: "thigh-left", label: "Left outer thigh", detail: "Vastus lateralis", view: "front", x: 146, y: 322, rx: 8, ry: 28, im: true, subq: true },
  { id: "thigh-front-right", label: "Right front thigh", detail: "Rectus femoris", view: "front", x: 110, y: 316, rx: 8, ry: 26, im: true, subq: true },
  { id: "thigh-front-left", label: "Left front thigh", detail: "Rectus femoris", view: "front", x: 130, y: 316, rx: 8, ry: 26, im: true, subq: true },
  // Back
  { id: "triceps-left", label: "Back of left arm", detail: "Fat over the triceps", view: "back", x: 68, y: 165, rx: 9, ry: 18, im: false, subq: true },
  { id: "triceps-right", label: "Back of right arm", detail: "Fat over the triceps", view: "back", x: 172, y: 165, rx: 9, ry: 18, im: false, subq: true },
  { id: "lowback-left", label: "Left lower back", detail: "Fat above the hip bone", view: "back", x: 104, y: 228, rx: 11, ry: 13, im: false, subq: true },
  { id: "lowback-right", label: "Right lower back", detail: "Fat above the hip bone", view: "back", x: 136, y: 228, rx: 11, ry: 13, im: false, subq: true },
  { id: "hip-left", label: "Left hip", detail: "Ventrogluteal", view: "back", x: 80, y: 264, rx: 10, ry: 13, im: true, subq: false },
  { id: "hip-right", label: "Right hip", detail: "Ventrogluteal", view: "back", x: 160, y: 264, rx: 10, ry: 13, im: true, subq: false },
  { id: "glute-left", label: "Left glute", detail: "Upper outer quarter only", view: "back", x: 106, y: 286, rx: 14, ry: 15, im: true, subq: true },
  { id: "glute-right", label: "Right glute", detail: "Upper outer quarter only", view: "back", x: 134, y: 286, rx: 14, ry: 15, im: true, subq: true },
];

export function siteDetail(id: SiteId): string {
  return sites.find((site) => site.id === id)?.detail ?? "";
}

export function siteLabel(id: SiteId): string {
  return sites.find((site) => site.id === id)?.label ?? id;
}

// ── Side effects ─────────────────────────────────────────────────────────

/** Red flags: these stop regimen guidance and send the user to medical care. */
export const urgentSymptoms = [
  { id: "chest-pain", label: "Chest pain or pressure" },
  { id: "breathing", label: "Severe shortness of breath" },
  { id: "fainting", label: "Fainting or near-fainting" },
  { id: "allergy", label: "Swelling of face or throat, or a spreading rash" },
  { id: "neuro", label: "Weakness, slurred speech, or confusion" },
  { id: "abdominal", label: "Severe or persistent abdominal pain" },
  { id: "vision", label: "Sudden vision change" },
] as const;

export type UrgentSymptomId = (typeof urgentSymptoms)[number]["id"];

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

// ── Risk ranking ─────────────────────────────────────────────────────────

export type RiskTier = "Best evidenced" | "Reasonable evidence" | "Limited evidence" | "Most uncertain";

export type RiskProfile = {
  /** Lower is better evidenced with fewer known hazards. */
  score: number;
  tier: RiskTier;
  reasons: string[];
};

const HAZARDS: { cls: string; weight: number; reason: string }[] = [
  { cls: "igf", weight: 3, reason: "Lowers blood sugar; hypoglycaemia risk" },
  { cls: "melanocortin", weight: 2, reason: "Nausea, flushing, blood-pressure effects; can darken moles" },
  { cls: "glp1", weight: 2, reason: "GI effects, gallbladder risk, thyroid C-cell warning in the class" },
  { cls: "growth-signal", weight: 2, reason: "Promotes growth signalling; unsuitable with a cancer history" },
  { cls: "copper", weight: 1, reason: "Copper load and injection-site irritation" },
];

/**
 * Ranks a compound by how well its human evidence is established and which
 * hazards are known. It is an evidence ranking, not a safety guarantee: a
 * low score means less uncertainty, not that a compound is safe.
 */
export function riskProfile(model: CompoundModel): RiskProfile {
  const reasons: string[] = [];
  let score = 0;

  if (model.evidence === "clinical") {
    reasons.push("Approved human dosing exists");
  } else if (model.evidence === "trial") {
    score += 3;
    reasons.push("Human trials only, no approved use");
    } else {
    score += 5;
    reasons.push("No established human dosing");
  }

  const combination = model.combinationEvidence ?? "limited";
  if (combination === "limited") score += 1;
  if (combination === "none") {
    score += 2;
    reasons.push("No human data on combining it with other compounds");
  }

  for (const hazard of HAZARDS) {
    if (model.classes.includes(hazard.cls as never)) {
      score += hazard.weight;
      reasons.push(hazard.reason);
    }
  }

  if (model.components) {
    score += 1;
    reasons.push("A blend: several actives in a fixed ratio you cannot adjust");
  }
  if (!model.cycleDays && model.evidence === "community") {
    score += 1;
    reasons.push("No researched run length to bound continuous use");
  }

  const tier: RiskTier = score <= 2 ? "Best evidenced" : score <= 5 ? "Reasonable evidence" : score <= 8 ? "Limited evidence" : "Most uncertain";
  return { score, tier, reasons };
}

// ── Pairings ─────────────────────────────────────────────────────────────

/**
 * Combinations people actually run, with what the human evidence covers and,
 * just as importantly, what it does not. `strength` describes the evidence for
 * the *pair*, never whether either compound is safe:
 *   trial       — randomised human trials compared the pair against each alone
 *   human-acute — human data, but only on a short-term marker
 *   none        — commonly stacked, no human data for the combination
 */
export type PairingStrength = "trial" | "human-acute" | "none";

export type Pairing = {
  title: string;
  /** Slugs on each side of the pair. */
  a: string[];
  b: string[];
  strength: PairingStrength;
  /** Why they are combined at all. */
  mechanism: string;
  /** What human data exists, stated precisely. */
  shows: string;
  /** What that data does not establish. */
  limits: string;
  source: string;
};

export const pairings: Pairing[] = [
  {
    title: "GLP-1 with an amylin analogue",
    a: ["semaglutide", "tirzepatide", "mazdutide", "survodutide", "retatrutide"],
    b: ["cagrilintide"],
    strength: "trial",
    mechanism:
      "Two separate appetite pathways: a GLP-1 receptor agonist and an amylin analogue, given on the same weekly schedule.",
    shows:
      "Over 68 weeks the pair lost 20.4% of body weight, against 14.9% for semaglutide alone and 11.5% for cagrilintide alone, in 3,417 adults.",
    limits:
      "Each-drug-alone comparison was secondary, not the powered endpoint, and the result reads as additive rather than synergistic. No cardiovascular outcome data for the pair, and 79.6% had gastrointestinal side effects.",
    source: "Garvey et al., New England Journal of Medicine 2025;393:635–47 (REDEFINE 1).",
  },
  {
    title: "A GHRH analogue with a GHRP",
    a: ["tesamorelin", "sermorelin", "cjc-1295-no-dac", "cjc-1295-dac"],
    b: ["ipamorelin", "ghrp-2", "ghrp-6"],
    strength: "human-acute",
    mechanism:
      "They work on different receptors — the GHRH analogue at the pituitary, the GHRP largely at the hypothalamus — so together they release more growth hormone than either does on its own.",
    shows:
      "Given as single IV doses to healthy adults, the pair released more growth hormone than both doses added together. The combination is a guideline-validated test of growth hormone reserve.",
    limits:
      "That is a two-hour diagnostic result at IV doses. No controlled trial has tested injecting them together over time for fat loss, muscle or strength. The only longer-run human data is an uncontrolled review of 14 men already on testosterone, which measured IGF-1 and nothing else.",
    source:
      "Popovic et al., Journal of Clinical Endocrinology & Metabolism 1995;80:942–7. GH Research Society consensus, European Journal of Endocrinology 2007;157:695–700.",
  },
  {
    title: "BPC-157 with TB-500",
    a: ["bpc-157"],
    b: ["tb-500"],
    strength: "none",
    mechanism: "The most common healing stack, run on the theory that the two repair pathways complement each other.",
    shows:
      "Nothing in humans. One retrospective series of knee injections included patients on the pair but reported no comparison against either alone.",
    limits:
      "There is no randomised or controlled human trial of the combination, or of either compound, for tendon, ligament, muscle or cartilage healing. Efficacy evidence is animal-only. BPC-157 sits in FDA Category 2 and is banned by WADA.",
    source: "Mayfield et al., American Journal of Sports Medicine 2026;54:223–9 (review).",
  },
];

/** Pairings that touch a compound, with the slugs making up the other half. */
export function pairingsFor(model: CompoundModel): { pairing: Pairing; partners: string[] }[] {
  const mine = [model.slug, ...Object.keys(model.components ?? {})];
  const found: { pairing: Pairing; partners: string[] }[] = [];
  for (const pairing of pairings) {
    const onA = mine.some((slug) => pairing.a.includes(slug));
    const onB = mine.some((slug) => pairing.b.includes(slug));
    if (onA && onB) found.push({ pairing, partners: [] }); // a blend covers both halves
    else if (onA) found.push({ pairing, partners: pairing.b });
    else if (onB) found.push({ pairing, partners: pairing.a });
  }
  return found;
}

/** Named compounds, best evidenced and least hazardous first. */
export function rankedCompounds(slugs: string[]): CompoundModel[] {
  return slugs
    .map((slug) => getCompound(slug))
    .filter((model): model is CompoundModel => Boolean(model))
    .sort((a, b) => riskProfile(a).score - riskProfile(b).score);
}

const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Every day",
  "several-weekly": "Several days a week",
  weekly: "Once a week",
  "as-needed": "Only when needed",
};

/** How often the protocol has it going in, in plain words. */
export function scheduleLabel(model: CompoundModel): string {
  return FREQUENCY_LABEL[model.frequency];
}

/**
 * Run length before a break. Never invented: compounds whose sources give no
 * cycle length say so rather than having one made up for them.
 */
export function cycleLabel(model: CompoundModel): string {
  if (!model.cycleDays) return "No cycle length established";
  const weeks = Math.round(model.cycleDays / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"}, then a break`;
}

/** Gap between doses in days, used to work out what is due. */
export function doseGapDays(model: CompoundModel): number | null {
  if (model.frequency === "daily") return 1;
  if (model.frequency === "several-weekly") return 2;
  if (model.frequency === "weekly") return 7;
  return null; // as-needed is never assumed
}
