export const goals = [
  {
    id: "recovery",
    label: "Recovery",
    blurb: "Soft tissue, joints, getting back to training.",
  },
  {
    id: "fat-loss",
    label: "Body composition",
    blurb: "Fat loss and metabolic research, not a crash cut.",
  },
  {
    id: "muscle",
    label: "Growth hormone axis",
    blurb: "Evening GHRH / secretagogue work.",
  },
  {
    id: "skin",
    label: "Skin and hair",
    blurb: "Copper peptides and aesthetic blends.",
  },
  {
    id: "sleep",
    label: "Sleep",
    blurb: "Evening winding-down and sleep research.",
  },
  {
    id: "cognition",
    label: "Focus and mood",
    blurb: "Daytime nasal peptides used in cognitive research.",
  },
  {
    id: "longevity",
    label: "Cellular health",
    blurb: "Mitochondrial and cofactor research.",
  },
  {
    id: "libido",
    label: "Sexual function",
    blurb: "As-needed melanocortin research, not a daily peptide.",
  },
] as const;

export type GoalId = (typeof goals)[number]["id"];

export const riskLevels = [
  {
    id: "conservative",
    label: "Conservative",
    blurb: "One familiar compound, lowest cited amount, supplements first.",
  },
  {
    id: "moderate",
    label: "Moderate",
    blurb: "A short stack at standard research amounts.",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    blurb: "Catalog stacks and the upper cited range, still cycled.",
  },
] as const;

export type RiskLevel = (typeof riskLevels)[number]["id"];

export const ageBands = [
  { id: "under-21", label: "Under 21" },
  { id: "21-29", label: "21–29" },
  { id: "30-39", label: "30–39" },
  { id: "40-49", label: "40–49" },
  { id: "50-plus", label: "50+" },
] as const;

export type AgeBand = (typeof ageBands)[number]["id"];

export const experienceLevels = [
  { id: "none", label: "Never reconstituted a vial" },
  { id: "some", label: "A few cycles" },
  { id: "regular", label: "I already run worksheets" },
] as const;

export type Experience = (typeof experienceLevels)[number]["id"];

export const flags = [
  {
    id: "pregnant",
    label: "Pregnant, nursing, or trying to conceive",
  },
  {
    id: "cancer",
    label: "Current or recent cancer treatment",
  },
  {
    id: "cardio",
    label: "Known heart, blood-pressure, or clotting issues",
  },
] as const;

export type FlagId = (typeof flags)[number]["id"];

export type PlanProfile = {
  goals: GoalId[];
  risk: RiskLevel;
  ageBand: AgeBand;
  experience: Experience;
  flags: FlagId[];
};

export type PeptideRec = {
  slug: string;
  name: string;
  goal: GoalId;
  amount: string;
  frequency: string;
  doseMcg: number;
  vialMg: number;
  waterMl: number;
  why: string;
};

export type SupplementRec = {
  name: string;
  amount: string;
  timing: string;
  why: string;
};

export type PlanResult = {
  blocked: boolean;
  blockReason?: string;
  title: string;
  summary: string;
  peptides: PeptideRec[];
  supplements: SupplementRec[];
  holdWhen: string;
  notes: string[];
};
