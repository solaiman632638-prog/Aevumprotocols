import {
  compounds,
  getCompound,
  sites,
  symptoms,
  riskProfile,
  toUnit,
  urgentSymptoms,
  type CompoundModel,
  type RiskProfile,
  type SiteId,
} from "./catalog";
import type { DayState, Driver, Reaction, UserContext } from "../today/types";

/**
 * Peptide regimen analysis, written to reduce unnecessary exposure.
 *
 * Three rules shape everything here:
 * 1. No amount is ever called safe. For compounds without established human
 *    dosing, schedules are reference data, never a recommendation.
 * 2. Escalation is never suggested unless the compound has clinical dosing and
 *    the user's own history and side effects allow it.
 * 3. Adding nothing, simplifying, and pausing are first-class outcomes.
 */

export type GuidanceStatus =
  | "start"
  | "keep"
  | "step-up"
  | "hold"
  | "step-down"
  | "above-researched"
  | "break"
  | "stop"
  | "reference";

export type Guidance = {
  slug: string;
  name: string;
  status: GuidanceStatus;
  headline: string;
  detail: string;
  current: string;
  /** Reference exposure from research, shown separately from any recommendation. */
  reference: string;
  evidence: CompoundModel["evidence"];
  risk: RiskProfile;
  why: Driver[];
};

export type Interaction = {
  level: "warning" | "caution" | "info";
  title: string;
  detail: string;
  compounds: string[];
};

export type Simplification = {
  title: string;
  detail: string;
  recommendation: string;
  compounds: string[];
};

export type RegimenReview = {
  active: number;
  complexity: "Lower" | "Moderate" | "Higher";
  overlap: "Low" | "Moderate" | "High";
  combinationEvidence: "Some" | "Limited" | "None identified";
  longestRun: number;
  recentChanges: number;
  escalations: string[];
  recommendation: string;
  why: string[];
};

export type AdditionReview = {
  slug: string;
  name: string;
  overlap: "Low" | "Moderate" | "High";
  combinationEvidence: "Some" | "Limited" | "None identified";
  addedComplexity: "Low" | "Moderate" | "High";
  risk: RiskProfile;
  /** Compounds for the same goals with better evidence and fewer known hazards. */
  betterEvidenced: { slug: string; name: string; tier: string }[];
  recommendation: string;
  reasons: string[];
};

export type SiteSummary = {
  usage: Partial<Record<SiteId, { lastDate: string; count: number }>>;
  suggestion: SiteId;
  repeats: { site: SiteId; compound: string; lastDate: string }[];
};

export type PeptideReport = {
  urgent: { labels: string[]; date: string } | null;
  review: RegimenReview | null;
  guidance: Guidance[];
  interactions: Interaction[];
  simplifications: Simplification[];
  sites: SiteSummary;
  withheld?: string;
};

type Dose = { date: string; amount: number; site?: SiteId };

const DAY = 86_400_000;
const days = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / DAY);
const fmt = (value: number) => String(Math.round(value * 1000) / 1000);
const same = (a: number, b: number) => Math.abs(a - b) <= Math.max(a, b) * 0.02;

/** Every logged dose, grouped by compound and converted to its unit. */
function history(days_: DayState[]): Map<string, Dose[]> {
  const map = new Map<string, Dose[]>();
  for (const day of days_) {
    for (const dose of day.doses ?? []) {
      const model = getCompound(dose.compound);
      if (!model) continue;
      const list = map.get(model.slug) ?? [];
      list.push({ date: day.date, amount: toUnit(dose.amount, dose.unit, model.unit), site: dose.site });
      map.set(model.slug, list);
    }
  }
  for (const list of map.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return map;
}

function recentReactions(days_: DayState[], today: string, window: number): (Reaction & { date: string })[] {
  return days_
    .filter((day) => days(day.date, today) < window && days(day.date, today) >= 0)
    .flatMap((day) => (day.reactions ?? []).map((reaction) => ({ ...reaction, date: day.date })));
}

const gi = new Set<string>(symptoms.filter((s) => s.gi).map((s) => s.id));
const symptomLabel = (id: string) => symptoms.find((s) => s.id === id)?.label ?? id;

/** Reference exposure phrased so it never reads as a recommended dose. */
function referenceText(model: CompoundModel): string {
  const range = `${fmt(model.range[0])}–${fmt(model.range[1])} ${model.unit}`;
  if (model.evidence === "clinical") return `Approved dosing ${range}`;
  if (model.evidence === "trial") return `Trial exposure ${range}`;
  return `Reported research exposure ${range}`;
}

const uncertainty: Record<CompoundModel["evidence"], string> = {
  clinical: "Dosing comes from an approved label; your prescriber sets it.",
  trial: "Amounts come from trials, not an approved label. Aevum cannot verify any amount as safe.",
  community: "No established human dosing exists. Amounts are reported research exposure, not a safe dose.",
};

/** Start of the current run: walk back until a gap longer than two weeks. */
function runStart(doses: Dose[]): string {
  let start = doses[doses.length - 1].date;
  for (let i = doses.length - 2; i >= 0; i -= 1) {
    if (days(doses[i].date, start) > 14) break;
    start = doses[i].date;
  }
  return start;
}

/** First date of the unbroken stretch at the current amount. */
function atDoseSince(doses: Dose[]): string {
  const current = doses[doses.length - 1].amount;
  let since = doses[doses.length - 1].date;
  for (let i = doses.length - 2; i >= 0; i -= 1) {
    if (!same(doses[i].amount, current) || days(doses[i].date, since) > 14) break;
    since = doses[i].date;
  }
  return since;
}

/** Increases within the window, newest last. */
function increases(doses: Dose[], today: string, window: number): { date: string; from: number; to: number }[] {
  const out: { date: string; from: number; to: number }[] = [];
  for (let i = 1; i < doses.length; i += 1) {
    if (days(doses[i].date, today) > window) continue;
    if (doses[i].amount > doses[i - 1].amount * 1.02) {
      out.push({ date: doses[i].date, from: doses[i - 1].amount, to: doses[i].amount });
    }
  }
  return out;
}

function guidanceFor(
  model: CompoundModel,
  doses: Dose[],
  reactions: (Reaction & { date: string })[],
  today: string,
  context: UserContext,
): Guidance {
  const last = doses[doses.length - 1];
  const current = last.amount;
  const unit = model.unit;
  const risk = riskProfile(model);
  const base = {
    slug: model.slug,
    name: model.name,
    current: `${fmt(current)} ${unit}`,
    reference: referenceText(model),
    evidence: model.evidence,
    risk,
  };
  const start = runStart(doses);
  const onCycle = days(start, today) + 1;
  const since = atDoseSince(doses);
  const weeksAtDose = Math.floor((days(since, today) + 1) / 7);
  const why: Driver[] = [
    { label: "Last reported", value: `${fmt(current)} ${unit}`, effect: last.date },
    { label: referenceText(model), value: `max reported ${fmt(model.max)} ${unit}` },
    { label: "This run", value: `day ${onCycle}`, effect: model.cycleDays ? `research runs about ${model.cycleDays} days` : undefined },
    { label: "Evidence", value: model.evidence === "clinical" ? "Approved dosing" : model.evidence === "trial" ? "Human trials only" : "No established human dosing" },
    { label: "Evidence ranking", value: risk.tier, effect: risk.reasons[0] },
  ];

  if (context.conditions.includes("cancer") && model.classes.includes("growth-signal")) {
    return {
      ...base,
      status: "stop",
      headline: "Check with your oncologist before continuing",
      detail: "This compound promotes growth signalling. With a cancer history that decision belongs with your oncologist, not with Aevum.",
      why: [...why, { label: "Health history", value: "Cancer" }],
    };
  }
  if (context.conditions.includes("cardio") && model.classes.some((c) => c === "glp1" || c === "melanocortin")) {
    return {
      ...base,
      status: "hold",
      headline: "Get medical review before continuing",
      detail: "This compound can raise heart rate or blood pressure, and you have logged a heart or blood-pressure condition.",
      why: [...why, { label: "Health history", value: "Heart or blood pressure" }],
    };
  }

  const severe = reactions.filter((r) => r.severity === 3);
  if (severe.length > 0) {
    return {
      ...base,
      status: "stop",
      headline: "Pause and get medical advice",
      detail: `You logged a severe ${symptomLabel(severe[0].symptom).toLowerCase()}. Stop adding anything, and get medical care if it does not ease quickly.`,
      why: [...why, { label: "Severe side effect", value: symptomLabel(severe[0].symptom), effect: severe[0].date }],
    };
  }
  if (reactions.some((r) => r.symptom === "low-sugar") && model.classes.some((c) => c === "igf" || c === "glp1")) {
    return {
      ...base,
      status: "hold",
      headline: "Possible low blood sugar: do not increase",
      detail: "Shakiness, sweating, or dizziness on a compound that lowers blood sugar needs attention. Eat, check your glucose if you can, and get professional review before the next dose.",
      why: [...why, { label: "Side effect", value: "Shaky, sweaty, or dizzy" }],
    };
  }
  if (current > model.max * 1.02) {
    return {
      ...base,
      status: "above-researched",
      headline: `Above the highest reported exposure of ${fmt(model.max)} ${unit}`,
      detail: `Human data above this level is limited, so Aevum cannot assess the added risk. A risk-minimising step is to go back toward ${fmt(model.range[0])}–${fmt(model.range[1])} ${unit} and get professional review.`,
      why,
    };
  }
  if (model.cycleDays && onCycle > model.cycleDays) {
    return {
      ...base,
      status: "break",
      headline: "Continuous use is past the researched run length",
      detail: `You are on day ${onCycle}; research runs are about ${model.cycleDays} days. Long-term safety data past that is limited.`,
      why,
    };
  }

  const previous = doses.length > 1 ? doses[doses.length - 2] : undefined;
  if (previous && model.frequency === "weekly" && days(previous.date, last.date) < 5) {
    return {
      ...base,
      status: "hold",
      headline: "Doses closer together than the schedule",
      detail: `This is dosed weekly, but your last two were ${days(previous.date, last.date)} days apart. Closer spacing raises exposure without added benefit.`,
      why: [...why, { label: "Previous dose", value: previous.date }],
    };
  }
  if (previous && model.frequency === "as-needed" && days(previous.date, last.date) <= 1) {
    return {
      ...base,
      status: "hold",
      headline: "Not used on back-to-back days",
      detail: "This is used occasionally. Spacing doses out keeps exposure lower.",
      why: [...why, { label: "Previous dose", value: previous.date }],
    };
  }

  const moderateGi = reactions.filter((r) => r.severity >= 2 && gi.has(r.symptom));
  const moderateAny = reactions.filter((r) => r.severity >= 2);

  if (model.titration) {
    const { steps, weeksPerStep } = model.titration;
    const index = steps.reduce((found, step, i) => (current >= step * 0.98 ? i : found), -1);
    const why2: Driver[] = [
      ...why,
      { label: "At this amount", value: `${weeksAtDose} week${weeksAtDose === 1 ? "" : "s"}`, effect: `schedule holds each step ${weeksPerStep} week${weeksPerStep === 1 ? "" : "s"}` },
    ];

    if (moderateGi.length > 0) {
      const giDays = new Set(moderateGi.map((r) => r.date)).size;
      if (giDays >= 3 && index > 0) {
        return {
          ...base,
          status: "step-down",
          headline: `Consider going back to ${fmt(steps[index - 1])} ${unit}`,
          detail: "Side effects have lasted several days at this amount. Lowering exposure is the lower-risk direction; a smaller amount is often still effective.",
          why: [...why2, { label: "Stomach side effects", value: `${giDays} days this week`, effect: "moderate or worse" }],
        };
      }
      return {
        ...base,
        status: "hold",
        headline: "Do not increase while side effects are active",
        detail: "Give this amount time to settle before changing anything. Changing more than one thing at once makes the cause impossible to read.",
        why: [...why2, { label: "Side effect", value: symptomLabel(moderateGi[0].symptom), effect: "moderate" }],
      };
    }
    if (index < 0) {
      return { ...base, status: "reference", headline: `Below the reported starting amount of ${fmt(steps[0])} ${unit}`, detail: `${uncertainty[model.evidence]} Lower exposure is not a problem in itself.`, why: why2 };
    }
    const startedAbove = (() => {
      const first = doses.find((dose) => dose.date >= start);
      const firstIndex = first ? steps.reduce((found, step, i) => (first.amount >= step * 0.98 ? i : found), -1) : 0;
      return firstIndex > 0 && days(start, today) < weeksPerStep * 7;
    })();
    if (startedAbove) {
      return {
        ...base,
        status: "hold",
        headline: `Schedules start at ${fmt(steps[0])} ${unit}`,
        detail: "You began this run above the first step. Starting high is the main cause of side effects, and it removes the chance to find the lowest amount that works.",
        why: why2,
      };
    }
    if (index >= steps.length - 1) {
      return { ...base, status: "keep", headline: "At the top of the reported schedule", detail: `${uncertainty[model.evidence]} There is no higher step to assess.`, why: why2 };
    }
    if (model.evidence === "clinical" && weeksAtDose >= weeksPerStep && moderateAny.length === 0) {
      return {
        ...base,
        status: "step-up",
        headline: `Approved schedule's next step is ${fmt(steps[index + 1])} ${unit}`,
        detail: `You have held ${fmt(current)} ${unit} for ${weeksAtDose} weeks without logged side effects. Only move up if this amount has stopped working, and agree it with your prescriber. Staying where you are is a valid choice.`,
        why: why2,
      };
    }
    if (weeksAtDose >= weeksPerStep) {
      return {
        ...base,
        status: "reference",
        headline: "Aevum does not recommend increasing",
        detail: `For reference, the reported schedule's next step is ${fmt(steps[index + 1])} ${unit} after ${weeksPerStep} week${weeksPerStep === 1 ? "" : "s"}. ${uncertainty[model.evidence]} Increasing raises uncertainty, so the lower-risk choice is to hold and reassess.`,
        why: why2,
      };
    }
    return {
      ...base,
      status: "keep",
      headline: "Hold this amount",
      detail: `Week ${Math.min(weeksAtDose + 1, weeksPerStep)} of ${weeksPerStep} at this step. ${uncertainty[model.evidence]}`,
      why: why2,
    };
  }

  if (moderateAny.length > 0) {
    return {
      ...base,
      status: "hold",
      headline: "Do not increase",
      detail: `You logged ${symptomLabel(moderateAny[0].symptom).toLowerCase()}. Staying at or below this amount is the lower-risk direction until it settles.`,
      why: [...why, { label: "Side effect", value: symptomLabel(moderateAny[0].symptom), effect: "moderate" }],
    };
  }
  if (current < model.range[0] * 0.98) {
    return { ...base, status: "reference", headline: "Below the reported range", detail: `${uncertainty[model.evidence]} A lower amount is not a reason to increase on its own.`, why };
  }
  return { ...base, status: "keep", headline: "No change suggested", detail: `Within reported exposure. ${uncertainty[model.evidence]}`, why };
}

// ── Interactions ─────────────────────────────────────────────────────────

const GLUCOSE_MEDS = /insulin|glipizide|glyburide|glimepiride|sulfonylurea|metformin/i;

function interactions(active: CompoundModel[], lastDoses: Map<string, Dose[]>, context: UserContext): Interaction[] {
  const out: Interaction[] = [];
  const names = (list: CompoundModel[]) => list.map((c) => c.name);
  const withClass = (cls: string) => active.filter((c) => c.classes.includes(cls as never));

  const glp1 = withClass("glp1");
  if (glp1.length >= 2) {
    out.push({ level: "warning", title: "Two GLP-1 compounds at once", detail: "They act on the same pathway, so side effects stack and neither can be assessed on its own. Running one at a time is the lower-risk approach.", compounds: names(glp1) });
  }
  const amylin = withClass("amylin");
  if (amylin.length && glp1.length === 1 && glp1[0].slug === "semaglutide") {
    out.push({ level: "info", title: "Studied pairing", detail: "This pairing has been studied together. Change one at a time, same day, different sites.", compounds: names([...amylin, ...glp1]) });
  } else if (amylin.length && glp1.length) {
    out.push({ level: "caution", title: "Amylin plus GLP-1", detail: "Both cut appetite and slow the stomach. Human data for this particular combination is limited.", compounds: names([...amylin, ...glp1]) });
  }

  const melano = withClass("melanocortin");
  if (melano.length >= 2) {
    out.push({ level: "warning", title: "Melanocortin compounds together", detail: "Melanotan-1, Melanotan-2, and PT-141 act on the same receptors. Combining them adds exposure without adding a distinct effect.", compounds: names(melano) });
  }

  const ghrh = withClass("ghrh");
  if (ghrh.length >= 2) {
    out.push({ level: "warning", title: "Two GHRH compounds", detail: "Tesamorelin, sermorelin, and CJC-1295 do the same job. One is the lower-risk choice.", compounds: names(ghrh) });
  }
  const ghrp = withClass("ghrp");
  if (ghrp.length >= 2) {
    out.push({ level: "caution", title: "More than one GHRP", detail: "Ipamorelin, GHRP-2, and GHRP-6 overlap. Check whether a blend already contains one you also take separately.", compounds: names(ghrp) });
  }

  const igf = withClass("igf");
  if (igf.length >= 2) {
    out.push({ level: "warning", title: "Two IGF-1 variants", detail: "Both lower blood sugar and hit the same receptor. Running one at a time is the lower-risk approach.", compounds: names(igf) });
  }
  if (igf.length && (glp1.length || context.conditions.includes("diabetes") || GLUCOSE_MEDS.test(context.medications))) {
    out.push({ level: "warning", title: "Low blood sugar risk", detail: "IGF-1 lowers blood sugar, and so do GLP-1 compounds and diabetes medication. This combination needs clinician or pharmacist review.", compounds: names([...igf, ...glp1]) });
  }

  const exposure = new Map<string, string[]>();
  for (const compound of active) {
    const parts = compound.components ? Object.keys(compound.components) : [compound.slug];
    for (const part of parts) exposure.set(part, [...(exposure.get(part) ?? []), compound.name]);
  }
  for (const [part, sources] of exposure) {
    if (sources.length < 2) continue;
    const model = getCompound(part);
    if (!model) continue;
    let total = 0;
    for (const compound of active) {
      const last = lastDoses.get(compound.slug)?.at(-1);
      if (!last) continue;
      const share = compound.components ? compound.components[part] ?? 0 : compound.slug === part ? 1 : 0;
      total += toUnit(last.amount * share, compound.unit, model.unit);
    }
    const over = total > model.max * 1.02;
    out.push({
      level: over ? "warning" : "caution",
      title: `${model.name} from more than one source`,
      detail: `${sources.join(" and ")} both contain ${model.name}: about ${fmt(total)} ${model.unit} combined${over ? `, above the highest reported exposure of ${fmt(model.max)} ${model.unit}` : ""}. Duplicate exposure is rarely intended.`,
      compounds: sources,
    });
  }

  if (withClass("copper").length && active.length > 1) {
    out.push({ level: "info", title: "GHK-Cu in the syringe", detail: "Copper can react with other peptides. Do not mix GHK-Cu in one syringe with anything except BPC-157.", compounds: names(withClass("copper")) });
  }

  const growth = withClass("growth-signal");
  if (context.conditions.includes("cancer") && growth.length) {
    out.push({ level: "warning", title: "Cancer history", detail: "These compounds promote growth signalling. This needs your oncologist's review before it continues.", compounds: names(growth) });
  }
  if (context.conditions.includes("cardio") && (glp1.length || melano.length)) {
    out.push({ level: "warning", title: "Heart or blood-pressure condition", detail: "GLP-1 compounds raise heart rate and melanocortins can raise blood pressure. Get medical review.", compounds: names([...glp1, ...melano]) });
  }
  if (context.conditions.includes("pregnant") && active.length) {
    out.push({ level: "warning", title: "Pregnancy or nursing", detail: "None of these compounds has safety data for pregnancy or nursing. Stop and speak to your clinician.", compounds: names(active) });
  }
  if (context.medications.trim() && active.length) {
    out.push({
      level: "caution",
      title: "Prescription medication in the mix",
      detail: `You listed ${context.medications.trim()}. Interaction data between prescription drugs and research compounds is thin; a pharmacist or clinician review is worth more than anything Aevum can calculate.`,
      compounds: names(active),
    });
  }
  return out;
}

// ── Mechanism overlap, complexity, escalation ────────────────────────────

const SHARED_CLASSES = ["glp1", "ghrh", "ghrp", "igf", "melanocortin", "healing", "growth-signal", "mitochondrial", "nootropic", "metabolic"] as const;

function overlapPairs(active: CompoundModel[]): { a: CompoundModel; b: CompoundModel; shared: string[] }[] {
  const pairs: { a: CompoundModel; b: CompoundModel; shared: string[] }[] = [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const shared = SHARED_CLASSES.filter((cls) => active[i].classes.includes(cls) && active[j].classes.includes(cls));
      if (shared.length) pairs.push({ a: active[i], b: active[j], shared: [...shared] });
    }
  }
  return pairs;
}

function regimenReview(
  active: CompoundModel[],
  all: Map<string, Dose[]>,
  days_: DayState[],
  today: string,
): RegimenReview | null {
  if (active.length === 0) return null;

  const pairs = overlapPairs(active);
  const overlap = pairs.length >= 3 ? "High" : pairs.length >= 1 ? "Moderate" : "Low";
  const community = active.filter((model) => model.evidence === "community").length;
  const comboKnown = active.filter((model) => model.combinationEvidence === "some").length;
  const combinationEvidence = active.length < 2 ? "Some" : comboKnown > 0 && pairs.length === 0 ? "Some" : pairs.length ? "Limited" : "None identified";

  const runs = active.map((model) => days(runStart(all.get(model.slug)!), today) + 1);
  const longestRun = Math.max(...runs);

  const escalations: string[] = [];
  for (const model of active) {
    const ups = increases(all.get(model.slug)!, today, 42);
    if (ups.length >= 2) {
      escalations.push(`${model.name} increased ${ups.length} times in the last six weeks (now ${fmt(ups.at(-1)!.to)} ${model.unit}).`);
    } else if (ups.length === 1 && days(ups[0].date, today) <= 14) {
      escalations.push(`${model.name} increased to ${fmt(ups[0].to)} ${model.unit} on ${ups[0].date}.`);
    }
  }

  const started = active.filter((model) => days(runStart(all.get(model.slug)!), today) <= 14).length;
  const recentChanges = escalations.length + started;

  let score = active.length >= 5 ? 3 : active.length >= 3 ? 2 : active.length >= 2 ? 1 : 0;
  if (overlap === "High") score += 2;
  else if (overlap === "Moderate") score += 1;
  if (community >= 3) score += 1;
  if (escalations.length) score += 1;
  if (longestRun > 90) score += 1;
  const complexity = score >= 5 ? "Higher" : score >= 3 ? "Moderate" : "Lower";

  const why: string[] = [`${active.length} compound${active.length === 1 ? "" : "s"} active in the last week.`];
  if (pairs.length) why.push(`${pairs.length} pair${pairs.length === 1 ? "" : "s"} share a mechanism.`);
  if (community) why.push(`${community} with no established human dosing.`);
  if (escalations.length) why.push(...escalations);
  if (started) why.push(`${started} started within the last two weeks.`);
  if (longestRun > 90) why.push(`Longest continuous run is ${longestRun} days; long-term data past that is limited.`);

  let recommendation: string;
  if (complexity === "Higher") {
    recommendation =
      "Aevum would not add anything here. The lower-risk direction is to hold exposure where it is, work out which compounds are actually doing something, and get professional review of the combination before any further change.";
  } else if (escalations.length) {
    recommendation =
      "Your reported exposure has gone up recently. Avoid further increases until you have watched your response and side effects at this level for a few weeks.";
  } else if (recentChanges > 1) {
    recommendation =
      "More than one thing changed recently, which makes it hard to tell what caused any effect. Change one thing at a time and give it time before the next change.";
  } else if (complexity === "Moderate") {
    recommendation =
      "Hold the regimen where it is rather than adding to it, and check whether each compound still has a clear purpose.";
  } else {
    recommendation =
      "Nothing here suggests a change is needed. Adding another compound is rarely the lower-risk option when the current one has not been assessed yet.";
  }

  return { active: active.length, complexity, overlap, combinationEvidence, longestRun, recentChanges, escalations, recommendation, why };
}

function simplifications(active: CompoundModel[], all: Map<string, Dose[]>, today: string, context: UserContext): Simplification[] {
  const out: Simplification[] = [];
  for (const pair of overlapPairs(active)) {
    out.push({
      title: `${pair.a.name} and ${pair.b.name} overlap`,
      detail: `Both act on ${pair.shared.join(" and ").replace("glp1", "GLP-1").replace("ghrh", "GH-releasing").replace("ghrp", "GH-releasing").replace("igf", "IGF")} pathways. Human evidence that running both adds benefit over one is limited.`,
      recommendation: "Consider whether both are necessary rather than keeping both by default. Dropping one also makes the other readable.",
      compounds: [pair.a.name, pair.b.name],
    });
  }
  for (const model of active) {
    const run = days(runStart(all.get(model.slug)!), today) + 1;
    if (model.cycleDays && run > model.cycleDays) {
      out.push({
        title: `${model.name} has run ${run} days`,
        detail: `Research runs are about ${model.cycleDays} days. Continuous use past that has limited safety data behind it.`,
        recommendation: "A break is the lower-risk option, and it shows you what changes without it.",
        compounds: [model.name],
      });
    }
  }
  const goalless = active.filter((model) => model.classes.includes("nootropic") || model.classes.includes("mitochondrial"));
  if (active.length >= 4 && goalless.length && context.goals.length) {
    out.push({
      title: "Not every compound maps to your goals",
      detail: `Your goals are ${context.goals.join(", ")}. With ${active.length} compounds running, some may be there from an earlier plan.`,
      recommendation: "Work out what each one is for. Anything without a clear answer is exposure without a purpose.",
      compounds: goalless.map((model) => model.name),
    });
  }
  return out;
}

/** What adding one more compound would mean for this regimen. */
export function evaluateAddition(slug: string, active: CompoundModel[], context: UserContext): AdditionReview | null {
  const candidate = getCompound(slug);
  if (!candidate) return null;

  const shared = active.filter((model) => model.classes.some((cls) => candidate.classes.includes(cls) && SHARED_CLASSES.includes(cls as never)));
  const overlap = shared.length >= 2 ? "High" : shared.length === 1 ? "Moderate" : "Low";
  const combinationEvidence = candidate.combinationEvidence === "some" && shared.length ? "Some" : shared.length ? "Limited" : "None identified";
  const total = active.length + 1;
  const addedComplexity = total >= 5 || overlap === "High" ? "High" : total >= 3 || overlap === "Moderate" ? "Moderate" : "Low";

  const reasons: string[] = [];
  if (shared.length) reasons.push(`Overlaps with ${shared.map((m) => m.name).join(" and ")} on the same pathway.`);
  if (candidate.evidence === "community") reasons.push("No established human dosing for this compound.");
  if (candidate.evidence === "trial") reasons.push("Human data comes from trials, not approved use.");
  if (active.length >= 3) reasons.push(`Your regimen would go to ${total} compounds, which makes cause and effect harder to read.`);
  if (context.medications.trim()) reasons.push(`You take ${context.medications.trim()}; interaction data with research compounds is thin.`);
  if (context.conditions.includes("cancer") && candidate.classes.includes("growth-signal")) reasons.push("Growth-signalling compound with a cancer history.");
  if (context.conditions.includes("cardio") && candidate.classes.some((c) => c === "glp1" || c === "melanocortin")) reasons.push("Can raise heart rate or blood pressure, and you logged a heart condition.");

  const against = shared.length > 0 || addedComplexity === "High" || active.length >= 3 || reasons.length >= 2;
  const recommendation = against
    ? `Aevum would not add ${candidate.name} now. ${shared.length ? "It covers ground your regimen already covers" : "It adds exposure"} while the evidence for the combination is ${combinationEvidence.toLowerCase()}. More compounds do not reliably produce better outcomes, and each one makes the others harder to assess.`
    : `If you do add ${candidate.name}, add it on its own, change nothing else, and give it enough time to judge before any further change. ${uncertainty[candidate.evidence]}`;

  const risk = riskProfile(candidate);
  const running = new Set(active.map((model) => model.slug));
  const betterEvidenced = compounds
    .filter((model) => !running.has(model.slug) && model.slug !== candidate.slug)
    .filter((model) => model.classes.some((cls) => candidate.classes.includes(cls)))
    .map((model) => ({ model, profile: riskProfile(model) }))
    .filter(({ profile }) => profile.score < risk.score)
    .sort((a, b) => a.profile.score - b.profile.score)
    .slice(0, 3)
    .map(({ model, profile }) => ({ slug: model.slug, name: model.name, tier: profile.tier }));

  return { slug: candidate.slug, name: candidate.name, overlap, combinationEvidence, addedComplexity, risk, betterEvidenced, recommendation, reasons };
}

// ── Sites ────────────────────────────────────────────────────────────────

function siteSummary(days_: DayState[], today: string): SiteSummary {
  const usage: SiteSummary["usage"] = {};
  const repeats: SiteSummary["repeats"] = [];
  const sorted = [...days_].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sorted) {
    for (const dose of day.doses ?? []) {
      if (!dose.site) continue;
      const previous = usage[dose.site];
      if (day.date === today && previous && previous.lastDate !== today && days(previous.lastDate, today) <= 2) {
        repeats.push({ site: dose.site, compound: getCompound(dose.compound)?.name ?? dose.compound, lastDate: previous.lastDate });
      }
      usage[dose.site] = { lastDate: day.date, count: (previous?.count ?? 0) + 1 };
    }
  }
  const subcutaneous = sites.filter((site) => !site.im || site.id.startsWith("thigh"));
  const suggestion = [...subcutaneous].sort((a, b) => (usage[a.id]?.lastDate ?? "").localeCompare(usage[b.id]?.lastDate ?? ""))[0].id;
  return { usage, suggestion, repeats };
}

// ── Report ───────────────────────────────────────────────────────────────

export function peptideReport(context: UserContext, history_: DayState[], today: string): PeptideReport | null {
  const all = history(history_);
  const sites_ = siteSummary(history_, today);

  const urgentDay = [...history_]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((day) => days(day.date, today) <= 3 && days(day.date, today) >= 0)
    .findLast((day) => (day.urgent ?? []).length > 0);
  const urgent = urgentDay
    ? {
        date: urgentDay.date,
        labels: (urgentDay.urgent ?? []).map((id) => urgentSymptoms.find((s) => s.id === id)?.label ?? id),
      }
    : null;

  if (all.size === 0) return urgent ? { urgent, review: null, guidance: [], interactions: [], simplifications: [], sites: sites_ } : null;

  const active = compounds.filter((model) => {
    const last = all.get(model.slug)?.at(-1);
    if (!last) return false;
    const window = model.frequency === "weekly" ? 10 : 7;
    return days(last.date, today) < window;
  });
  const reactions = recentReactions(history_, today, 7);
  const withheld =
    context.age < 21
      ? "Regimen guidance is not shown under 21."
      : context.conditions.includes("pregnant")
        ? "Regimen guidance is not shown during pregnancy or nursing. Speak to your clinician."
        : undefined;

  // A red flag stops all regimen guidance.
  if (urgent) {
    return { urgent, review: null, guidance: [], interactions: [], simplifications: [], sites: sites_, withheld };
  }

  const found = interactions(active, all, context);
  const flagged = new Set(found.filter((item) => item.level === "warning").flatMap((item) => item.compounds));
  const guidance = withheld
    ? []
    : active.map((model) => {
        const item = guidanceFor(model, all.get(model.slug)!, reactions, today, context);
        if (item.status !== "step-up" || !flagged.has(model.name)) return item;
        return {
          ...item,
          status: "hold" as const,
          headline: "Sort out the warning above first",
          detail: "This compound is part of a combination warning. Resolve that before any change to its amount.",
          why: [...item.why, { label: "Blocked by", value: "Combination warning" }],
        };
      });

  return {
    urgent: null,
    review: withheld ? null : regimenReview(active, all, history_, today),
    // Best evidenced and fewest known hazards first; anything needing action leads.
    guidance: guidance.toSorted((a, b) => {
      const urgentRank = (status: GuidanceStatus) => (status === "stop" ? 0 : status === "above-researched" ? 1 : 2);
      return urgentRank(a.status) - urgentRank(b.status) || a.risk.score - b.risk.score;
    }),
    interactions: found,
    simplifications: withheld ? [] : simplifications(active, all, today, context),
    sites: sites_,
    withheld,
  };
}

/** Compounds someone might consider adding, for the "considering adding" picker. */
export function addableCompounds(active: CompoundModel[]): CompoundModel[] {
  const running = new Set(active.map((model) => model.slug));
  return compounds.filter((model) => !running.has(model.slug));
}

export function activeCompounds(history_: DayState[], today: string): CompoundModel[] {
  const all = history(history_);
  return compounds.filter((model) => {
    const last = all.get(model.slug)?.at(-1);
    if (!last) return false;
    const window = model.frequency === "weekly" ? 10 : 7;
    return days(last.date, today) < window;
  });
}
