export const categories = [
  { slug: "glp-1-metabolic", name: "GLP-1 & metabolic" },
  { slug: "healing-recovery", name: "Healing & recovery" },
  { slug: "growth-hormone", name: "Growth hormone" },
  { slug: "skin-hair-aesthetics", name: "Skin, hair & aesthetics" },
  { slug: "longevity-cellular", name: "Longevity & cellular" },
  { slug: "brain-cognitive", name: "Brain & cognitive" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export type DoseRow = {
  label: string;
  amount: string;
  frequency: string;
  notes?: string;
};

export type Protocol = {
  slug: string;
  name: string;
  synonyms: string[];
  category: CategorySlug;
  summary: string;
  vialMg: number;
  vialLabel?: string;
  typicalWaterMl: number;
  doseMcg: number;
  route: string;
  form: "lyophilized" | "blend" | "intranasal";
  reconstitution: string;
  schedule: string;
  cycle: string;
  doses: DoseRow[];
  storageLyophilized: string;
  storageReconstituted: string;
  notes: string[];
  related: string[];
  pepipediaSlug?: string;
  primaryUse?: string;
  mechanism?: string;
  safety?: string;
  legal?: string;
  approval?: string;
  evidence?: string;
  effects?: string[];
  researchScore?: number;
  sideEffects?: string[];
};

export type Stack = {
  slug: string;
  name: string;
  compounds: string[];
  intent: string;
  schedule: string;
  notes: string[];
};
