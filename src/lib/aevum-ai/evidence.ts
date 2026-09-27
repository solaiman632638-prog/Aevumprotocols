import {
  compounds,
  cycleLabel,
  getCompound,
  pairings,
  riskProfile,
  scheduleLabel,
  symptoms,
  urgentSymptoms,
  type CompoundModel,
} from "@/lib/peptides/catalog";

/**
 * Retrieval over Aevum's own register. The model is never given database
 * access and never answers compound questions from memory: it only sees what
 * these functions return.
 */

export type CompoundProfile = {
  slug: string;
  name: string;
  evidence: CompoundModel["evidence"];
  evidenceQuality: string;
  tier: string;
  hazards: string[];
  referenceExposure: string;
  schedule: string;
  cycle: string;
  route: string;
  classes: string[];
  isBlend: boolean;
};

const EVIDENCE_QUALITY: Record<CompoundModel["evidence"], string> = {
  clinical: "Established",
  trial: "Moderate",
  community: "No reliable human evidence located",
};

/** Matches a free-text compound name against the register. */
export function findCompound(name: string): CompoundModel | undefined {
  const needle = name.trim().toLowerCase();
  if (!needle) return undefined;
  return (
    getCompound(needle) ??
    compounds.find((model) => model.name.toLowerCase() === needle) ??
    compounds.find((model) => model.name.toLowerCase().includes(needle)) ??
    compounds.find((model) => needle.includes(model.name.toLowerCase()))
  );
}

export function getCompoundProfile(name: string): CompoundProfile | null {
  const model = findCompound(name);
  if (!model) return null;
  const profile = riskProfile(model);
  return {
    slug: model.slug,
    name: model.name,
    evidence: model.evidence,
    evidenceQuality: EVIDENCE_QUALITY[model.evidence],
    tier: profile.tier,
    hazards: profile.reasons,
    referenceExposure:
      model.evidence === "clinical"
        ? `Approved dosing ${model.range[0]}–${model.range[1]} ${model.unit}`
        : `Reported research exposure ${model.range[0]}–${model.range[1]} ${model.unit}. No amount established as safe.`,
    schedule: scheduleLabel(model),
    cycle: cycleLabel(model),
    route: model.route,
    classes: model.classes,
    isBlend: Boolean(model.components),
  };
}

/** Reference regimens, labelled by where the numbers come from. */
export function getReferenceRegimens(name: string) {
  const model = findCompound(name);
  if (!model) return [];
  return [
    {
      sourceType: model.evidence === "clinical" ? "approved_label" : "clinical_trial",
      amount: `${model.range[0]}–${model.range[1]} ${model.unit}`,
      frequency: scheduleLabel(model),
      duration: cycleLabel(model),
      population: model.evidence === "clinical" ? "Approved indication population" : "Reported research use",
      sourceId: `aevum:${model.slug}`,
      note:
        model.evidence === "clinical"
          ? "Regulator-reviewed dosing. Describes the label, not a personal recommendation."
          : "Reported research exposure. Not an established or safe human dose.",
    },
  ];
}

/** Pairings that mention a compound, with the evidence for the pair. */
export function getPairings(name: string) {
  const model = findCompound(name);
  if (!model) return [];
  const mine = [model.slug, ...Object.keys(model.components ?? {})];
  return pairings
    .filter((pair) => mine.some((slug) => pair.a.includes(slug) || pair.b.includes(slug)))
    .map((pair) => ({
      title: pair.title,
      verdict: pair.verdict,
      strength: pair.strength,
      mechanism: pair.mechanism,
      shows: pair.shows,
      limits: pair.limits,
      source: pair.source,
    }));
}

/** The symptom vocabulary Aevum tracks, so the model uses the same words. */
export function symptomVocabulary() {
  return {
    tracked: symptoms.map((item) => item.label),
    urgent: urgentSymptoms.map((item) => item.label),
  };
}

/** Every compound name, for grounding and for the "not found" path. */
export function registerNames(): string[] {
  return compounds.map((model) => model.name);
}
