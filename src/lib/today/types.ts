import type { GoalId } from "@/lib/plan/types";
import type { SiteId, SymptomId } from "@/lib/peptides/catalog";

export const sexes = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
] as const;

export type Sex = (typeof sexes)[number]["id"];

export const tolerances = [
  { id: "conservative", label: "Conservative", blurb: "Lifestyle first. Compound pages only for well-studied options." },
  { id: "moderate", label: "Moderate", blurb: "Lifestyle and supplements, plus compound research for your goals." },
  { id: "open", label: "Open to research", blurb: "Show investigational compounds too, with their evidence gaps." },
] as const;

export type Tolerance = (typeof tolerances)[number]["id"];

export const conditions = [
  { id: "pregnant", label: "Pregnant, nursing, or trying to conceive" },
  { id: "cancer", label: "Current or recent cancer treatment" },
  { id: "cardio", label: "Heart, blood-pressure, or clotting condition" },
  { id: "kidney", label: "Kidney disease" },
  { id: "diabetes", label: "Diabetes or on glucose-lowering medication" },
] as const;

export type ConditionId = (typeof conditions)[number]["id"];

/** Who the user is. Stored on this device only. */
export type UserContext = {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  trainingDays: number;
  goals: GoalId[];
  tolerance: Tolerance;
  conditions: ConditionId[];
  medications: string;
  supplements: string;
  allergies: string;
  units: "metric" | "imperial";
};

/**
 * One day of state, from a wearable or a manual check-in. Every field is
 * optional: the engine scores what it has and says what it is missing.
 */
export type DayState = {
  date: string;
  source: "wearable" | "manual";
  /** ISO timestamp of the last local edit; sync keeps the newer copy. */
  updatedAt?: string;
  /** Wearable-computed recovery, 0–100, when the device supplies one. */
  recovery?: number;
  hrv?: number;
  rhr?: number;
  respRate?: number;
  sleepHours?: number;
  /** 1 (poor) – 5 (great). Manual only. */
  sleepQuality?: number;
  /** Day strain, 0–21 scale. */
  strain?: number;
  /** Manual stand-in for yesterday's strain, 0–21 scale. */
  yesterdayLoad?: number;
  weightKg?: number;
  /** 1 (drained) – 5 (fresh). Manual only. */
  energy?: number;
  /** 1 (none) – 5 (very sore). Manual only. */
  soreness?: number;
  /** 1 (calm) – 5 (very stressed). Manual only. */
  stress?: number;
  /** Peptides taken that day. */
  doses?: DoseEntry[];
  /** Side effects noticed that day. */
  reactions?: Reaction[];
};

export type DoseEntry = {
  id: string;
  /** Compound slug from the peptide catalog. */
  compound: string;
  amount: number;
  unit: "mg" | "mcg";
  site?: SiteId;
};

export type Reaction = {
  symptom: SymptomId;
  /** 1 mild, 2 moderate, 3 severe. */
  severity: 1 | 2 | 3;
};

export type Level = "Low" | "Moderate" | "High";

/** A single fact that moved a score or triggered a recommendation. */
export type Driver = {
  label: string;
  value: string;
  effect?: string;
};

export type Score = {
  label: string;
  value: string;
  /** 0–100 for meters; omitted for categorical scores. */
  numeric?: number;
  /** Short line under the value. */
  detail?: string;
  tone: "good" | "neutral" | "caution" | "missing";
  why: Driver[];
};

export type Recommendation = {
  id: string;
  category: "lifestyle" | "supplement";
  title: string;
  value: string;
  detail: string;
  why: Driver[];
  caution?: string;
};

export type CompoundCard = {
  slug: string;
  name: string;
  goal: string;
  status: string;
  evidence: string;
  researchScore: number;
  approval: string;
  benefits: string;
  risks: string[];
  boxedWarning?: string;
  cautions: string[];
  questions: string[];
  worksheet?: string;
  why: Driver[];
};

export type DailyReport = {
  date: string;
  source: DayState["source"];
  baselineDays: number;
  scores: Score[];
  lifestyle: Recommendation[];
  supplements: Recommendation[];
  compounds: CompoundCard[];
  compoundsWithheld?: string;
  notes: string[];
};
