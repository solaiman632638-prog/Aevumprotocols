import { goals as goalOptions, type GoalId } from "@/lib/plan/types";
import type {
  CompoundCard,
  DailyReport,
  DayState,
  Driver,
  Level,
  Recommendation,
  Score,
  UserContext,
} from "@/lib/today/types";

/**
 * Daily analysis: wearable or manual day states + user context in, scores
 * and recommendations out. Pure — no storage, no network.
 *
 * Rule that never bends: wearable data characterises the user's state and
 * drives lifestyle and supplement suggestions. It never selects a compound or
 * an amount. Compound cards come from the user's goals and are educational.
 */

/** Library fields the compound cards need, passed in by the server page. */
export type CompoundSource = {
  slug: string;
  name: string;
  legal: string;
  status: "approved" | "investigational" | "research" | "other";
  approval: string;
  evidence: string;
  researchScore: number;
  primaryUse: string;
  effects: string[];
  sideEffects: string[];
  boxedWarning?: string;
  worksheet?: string;
};

/** Compounds worth reading about per goal, strongest literature first. */
export const compoundsByGoal: Record<GoalId, string[]> = {
  recovery: ["bpc-157", "tb-500"],
  "fat-loss": ["semaglutide", "tirzepatide", "retatrutide", "mots-c"],
  muscle: ["tesamorelin", "ipamorelin", "cjc-1295"],
  skin: ["ghk-cu", "ahk-cu"],
  sleep: ["dsip"],
  cognition: ["semax", "selank"],
  longevity: ["mots-c", "nad-nmn-nr-complex", "ss-31", "epitalon"],
  libido: ["pt-141", "kisspeptin-10"],
};

const BASELINE_MIN_DAYS = 3;
const BASELINE_WINDOW = 14;

const GROWTH_AXIS = new Set(["tesamorelin", "ipamorelin", "cjc-1295", "bpc-157", "tb-500"]);
const GLP1 = new Set(["semaglutide", "tirzepatide", "retatrutide"]);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number, step: number) => Math.round(value / step) * step;
const signed = (value: number) => `${value >= 0 ? "+" : "−"}${Math.abs(Math.round(value))}`;
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const LB_PER_KG = 2.20462;

function weight(kg: number, context: UserContext): string {
  return context.units === "imperial" ? `${(kg * LB_PER_KG).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
}

function goalLabel(goal: GoalId): string {
  return goalOptions.find((option) => option.id === goal)?.label ?? goal;
}

type Baseline = { hrv?: number; rhr?: number; respRate?: number; days: number };

function baselineFrom(prior: DayState[]): Baseline {
  const window = prior.slice(-BASELINE_WINDOW);
  const pick = (key: "hrv" | "rhr" | "respRate") => {
    const values = window.map((day) => day[key]).filter((v): v is number => v != null);
    return values.length >= BASELINE_MIN_DAYS ? mean(values) : undefined;
  };
  return { hrv: pick("hrv"), rhr: pick("rhr"), respRate: pick("respRate"), days: window.length };
}

function sleepNeed(context: UserContext): number {
  return context.age < 18 ? 9 : 8;
}

// ── Scores ───────────────────────────────────────────────────────────────

function recoveryScore(today: DayState, base: Baseline, context: UserContext): Score {
  if (today.recovery != null) {
    const why: Driver[] = [{ label: "Device recovery score", value: `${today.recovery}%` }];
    if (today.hrv != null) why.push({ label: "HRV", value: `${today.hrv} ms`, effect: base.hrv ? `baseline ${Math.round(base.hrv)} ms` : undefined });
    if (today.rhr != null) why.push({ label: "Resting HR", value: `${today.rhr} bpm`, effect: base.rhr ? `baseline ${Math.round(base.rhr)} bpm` : undefined });
    return scoreFromNumber("Recovery", today.recovery, why);
  }

  // Weighted average of whatever components exist, each on 0–100.
  const parts: { label: string; value: string; score: number; weight: number }[] = [];
  if (today.hrv != null && base.hrv) {
    const pct = (today.hrv - base.hrv) / base.hrv;
    parts.push({ label: "HRV vs baseline", value: `${today.hrv} vs ${Math.round(base.hrv)} ms`, score: clamp(50 + pct * 200, 0, 100), weight: 0.3 });
  }
  if (today.rhr != null && base.rhr) {
    const diff = today.rhr - base.rhr;
    parts.push({ label: "Resting HR vs baseline", value: `${today.rhr} vs ${Math.round(base.rhr)} bpm`, score: clamp(50 - diff * 7, 0, 100), weight: 0.2 });
  }
  if (today.sleepHours != null) {
    const need = sleepNeed(context);
    parts.push({ label: "Sleep vs need", value: `${today.sleepHours.toFixed(1)} of ${need} h`, score: clamp((today.sleepHours / need) * 100, 0, 100), weight: 0.25 });
  }
  const feel = [
    today.sleepQuality,
    today.energy,
    today.soreness != null ? 6 - today.soreness : undefined,
    today.stress != null ? 6 - today.stress : undefined,
  ].filter((v): v is number => v != null);
  if (feel.length) {
    const labels = [
      today.sleepQuality != null ? `sleep ${today.sleepQuality}` : null,
      today.energy != null ? `energy ${today.energy}` : null,
      today.soreness != null ? `soreness ${today.soreness}` : null,
      today.stress != null ? `stress ${today.stress}` : null,
    ].filter(Boolean);
    parts.push({ label: "How you feel", value: `${labels.join(", ")} (of 5)`, score: ((mean(feel) - 1) / 4) * 100, weight: 0.25 });
  }

  if (parts.length === 0) return missing("Recovery", "Log sleep, energy, or heart-rate data to score recovery.");
  const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
  const score = parts.reduce((sum, part) => sum + part.score * part.weight, 0) / totalWeight;
  const why: Driver[] = parts.map((part) => ({
    label: part.label,
    value: part.value,
    effect: `${Math.round(part.score)} × ${Math.round((part.weight / totalWeight) * 100)}%`,
  }));
  return scoreFromNumber("Recovery", Math.round(score), why);
}

function sleepScore(today: DayState, context: UserContext): Score {
  if (today.sleepHours == null) return missing("Sleep", "No sleep duration logged for last night.");
  const need = sleepNeed(context);
  const why: Driver[] = [{ label: "Slept", value: `${today.sleepHours.toFixed(1)} h`, effect: `need ≈ ${need} h` }];
  let score: number;
  if (today.sleepQuality != null) {
    score = (today.sleepHours / need) * 85 + (today.sleepQuality - 3) * 7.5;
    why.push({ label: "Sleep quality", value: `${today.sleepQuality} / 5` });
  } else {
    score = (today.sleepHours / need) * 100;
  }
  return scoreFromNumber("Sleep", Math.round(clamp(score, 0, 100)), why);
}

function cardioStress(today: DayState, base: Baseline): Score & { level?: Level } {
  const why: Driver[] = [];
  let points = 0;
  let measured = false;

  if (today.rhr != null && base.rhr) {
    measured = true;
    const diff = today.rhr - base.rhr;
    const add = diff >= 5 ? 2 : diff >= 3 ? 1 : 0;
    points += add;
    why.push({ label: "Resting HR vs baseline", value: `${signed(diff)} bpm`, effect: add ? `+${add} stress` : "normal" });
  }
  if (today.hrv != null && base.hrv) {
    measured = true;
    const drop = (base.hrv - today.hrv) / base.hrv;
    const add = drop >= 0.2 ? 2 : drop >= 0.1 ? 1 : 0;
    points += add;
    why.push({ label: "HRV vs baseline", value: `${signed(-drop * 100)}%`, effect: add ? `+${add} stress` : "normal" });
  }
  if (today.respRate != null && base.respRate) {
    measured = true;
    const diff = today.respRate - base.respRate;
    const add = diff >= 1 ? 1 : 0;
    points += add;
    why.push({ label: "Respiratory rate vs baseline", value: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)} /min`, effect: add ? "+1 stress" : "normal" });
  }

  if (!measured) {
    const days = base.days;
    const detail =
      today.rhr == null && today.hrv == null
        ? "Needs resting heart rate or HRV. Connect a wearable or add them to your check-in."
        : `Building your baseline: ${days} of ${BASELINE_MIN_DAYS} days logged.`;
    return missing("Cardiovascular stress", detail);
  }

  const level: Level = points >= 3 ? "High" : points >= 1 ? "Moderate" : "Low";
  return {
    label: "Cardiovascular stress",
    value: level,
    level,
    tone: level === "Low" ? "good" : level === "Moderate" ? "neutral" : "caution",
    why,
  };
}

function readiness(recovery: Score, cardio: Score & { level?: Level }, today: DayState, yesterday?: DayState): Score & { level?: Level } {
  if (recovery.numeric == null) return missing("Training readiness", "Readiness follows recovery. Log a check-in first.");
  const why: Driver[] = [{ label: "Recovery", value: `${recovery.numeric}/100` }];
  let rank = recovery.numeric >= 67 ? 2 : recovery.numeric >= 34 ? 1 : 0;

  const down = () => {
    rank -= 1;
    return rank >= 0 ? "one level down" : "already lowest";
  };
  if (cardio.level === "High") {
    why.push({ label: "Cardiovascular stress", value: "High", effect: down() });
  }
  if ((today.soreness ?? 0) >= 4) {
    why.push({ label: "Soreness", value: `${today.soreness} / 5`, effect: down() });
  }
  const priorLoad = today.yesterdayLoad ?? yesterday?.strain;
  if ((priorLoad ?? 0) >= 16) {
    why.push({ label: "Yesterday's load", value: `${priorLoad?.toFixed(1)}`, effect: down() });
  }

  const level: Level = (["Low", "Moderate", "High"] as const)[clamp(rank, 0, 2)];
  return { label: "Training readiness", value: level, level, tone: level === "High" ? "good" : level === "Moderate" ? "neutral" : "caution", why };
}

function weightTrend(days: DayState[]): { perWeek: number; span: number } | null {
  const points = days.filter((day) => day.weightKg != null).slice(-BASELINE_WINDOW);
  if (points.length < 2) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const span = (Date.parse(last.date) - Date.parse(first.date)) / 86_400_000;
  if (span < 3) return null;
  return { perWeek: ((last.weightKg! - first.weightKg!) / span) * 7, span };
}

function goalAlignment(days: DayState[], context: UserContext): Score {
  const primary = context.goals[0];
  if (!primary) return missing("Goal alignment", "Pick a goal in your profile.");
  const why: Driver[] = [{ label: "Primary goal", value: goalLabel(primary) }];
  if (context.goals.length > 1) why.push({ label: "Also", value: context.goals.slice(1).map(goalLabel).join(", ") });

  if (primary !== "fat-loss") {
    return { label: "Goal alignment", value: goalLabel(primary), tone: "neutral", why };
  }

  why.push({ label: "Current → target", value: `${weight(context.weightKg, context)} → ${weight(context.targetWeightKg, context)}` });
  const trend = weightTrend(days);
  if (!trend) {
    why.push({ label: "Weight trend", value: "Log weight on 2+ days, 3+ days apart" });
    return { label: "Goal alignment", value: goalLabel(primary), detail: "Log weight to track the trend", tone: "neutral", why };
  }
  const stalled = trend.perWeek >= 0;
  const tooFast = trend.perWeek < -1.0;
  why.push({
    label: "Weight trend",
    value: `${trend.perWeek >= 0 ? "+" : ""}${weight(trend.perWeek, context)}/week over ${Math.round(trend.span)} days`,
    effect: stalled ? "not moving toward target" : tooFast ? `faster than ~${weight(1, context)}/week` : "on track",
  });
  return {
    label: "Goal alignment",
    value: stalled ? "Not moving" : tooFast ? "Losing too fast" : "On track",
    detail: goalLabel(primary),
    tone: stalled || tooFast ? "caution" : "good",
    why,
  };
}

function scoreFromNumber(label: string, value: number, why: Driver[]): Score {
  return {
    label,
    value: `${value}/100`,
    numeric: value,
    tone: value >= 67 ? "good" : value >= 34 ? "neutral" : "caution",
    why,
  };
}

function missing(label: string, detail: string): Score {
  return { label, value: "Not enough data", tone: "missing", why: [{ label: "Missing", value: detail }] };
}

// ── Lifestyle ────────────────────────────────────────────────────────────

function bmr(context: UserContext): number {
  const base = 10 * context.weightKg + 6.25 * context.heightCm - 5 * context.age;
  return context.sex === "male" ? base + 5 : base - 161;
}

function activityFactor(trainingDays: number): number {
  if (trainingDays <= 1) return 1.2;
  if (trainingDays <= 3) return 1.375;
  if (trainingDays <= 5) return 1.55;
  return 1.725;
}

function lifestyle(context: UserContext, today: DayState, days: DayState[], ready: Score & { level?: Level }, sleep: Score): Recommendation[] {
  const recs: Recommendation[] = [];
  const primary = context.goals[0];
  const cutting = context.goals.includes("fat-loss") && context.targetWeightKg < context.weightKg;
  const kidney = context.conditions.includes("kidney");
  const heart = context.conditions.includes("cardio");

  // Protein
  const factor = context.goals.includes("fat-loss") ? 2.0 : context.goals.some((g) => g === "muscle" || g === "recovery") ? 1.8 : context.trainingDays >= 3 ? 1.4 : 1.2;
  const proteinBase = cutting ? context.targetWeightKg : context.weightKg;
  recs.push({
    id: "protein",
    category: "lifestyle",
    title: "Protein target",
    value: `${round(proteinBase * factor, 5)} g`,
    detail: "Spread across 3–4 meals of roughly 30–50 g.",
    why: [
      { label: cutting ? "Target weight" : "Body weight", value: weight(proteinBase, context), effect: cutting ? "target used while cutting" : undefined },
      { label: "Goal", value: primary ? goalLabel(primary) : "—", effect: `${factor} g per kg` },
      { label: "Training days", value: `${context.trainingDays} / week` },
    ],
    caution: kidney ? "Kidney disease: agree a protein target with your clinician before raising intake." : undefined,
  });

  // Calories
  const maintenance = bmr(context) * activityFactor(context.trainingDays);
  const floor = context.sex === "male" ? 1500 : 1200;
  let calories = maintenance;
  let calorieNote = "Maintenance.";
  const pregnant = context.conditions.includes("pregnant");
  if (pregnant || context.age < 18) {
    calorieNote = pregnant ? "Maintenance only. Pregnancy and nursing needs are set with a clinician." : "Maintenance only under 18.";
  } else if (cutting) {
    calories = Math.max(maintenance * 0.8, bmr(context), floor);
    calorieNote = "About 20% under maintenance, never below resting needs.";
  } else if (context.goals.includes("muscle")) {
    calories = maintenance * 1.1;
    calorieNote = "About 10% over maintenance for muscle gain.";
  }
  recs.push({
    id: "calories",
    category: "lifestyle",
    title: "Calories",
    value: `${round(calories, 50).toLocaleString()} kcal`,
    detail: calorieNote,
    why: [
      { label: "Resting estimate (Mifflin–St Jeor)", value: `${round(bmr(context), 10)} kcal`, effect: `${context.age} y, ${context.heightCm} cm, ${weight(context.weightKg, context)}` },
      { label: "Activity", value: `${context.trainingDays} training days`, effect: `× ${activityFactor(context.trainingDays)}` },
      { label: "Goal", value: primary ? goalLabel(primary) : "—" },
    ],
  });

  // Hydration
  let litres = (context.weightKg * 35) / 1000;
  const hydrationWhy: Driver[] = [{ label: "Body weight", value: weight(context.weightKg, context), effect: "35 mL per kg" }];
  const strain = today.strain ?? today.yesterdayLoad ?? days.at(-2)?.strain;
  if (strain != null && strain >= 10) {
    const add = strain >= 14 ? 0.75 : 0.4;
    litres += add;
    hydrationWhy.push({ label: "Strain", value: strain.toFixed(1), effect: `+${add} L` });
  }
  recs.push({
    id: "hydration",
    category: "lifestyle",
    title: "Hydration",
    value: `${litres.toFixed(1)} L`,
    detail: "Includes water from food and drinks. Add more in heat.",
    why: hydrationWhy,
    caution: kidney || heart ? "Heart or kidney condition: fluid targets should come from your clinician." : undefined,
  });

  // Training
  const training: Record<Level, [string, string]> = {
    Low: ["Recovery day", "Walk, mobility, or easy zone 1–2 cardio for 30 minutes or less. Skip max efforts."],
    Moderate: ["Moderate intensity", "Train as planned but stop sets 2–3 reps shy of failure. Keep cardio conversational."],
    High: ["Go hard if planned", "A good day for your toughest planned session. Readiness is not a reason to add volume you did not plan."],
  };
  const [trainTitle, trainDetail] = ready.level ? training[ready.level] : ["Train by feel", "Log a check-in to get a readiness call."];
  recs.push({ id: "training", category: "lifestyle", title: "Training", value: trainTitle, detail: trainDetail, why: ready.why });

  // Sleep target
  const need = sleepNeed(context);
  const recent = days.slice(-3).map((day) => day.sleepHours).filter((v): v is number => v != null);
  const debt = recent.length ? need - mean(recent) : 0;
  const target = debt > 0.5 ? need + 0.5 : need;
  recs.push({
    id: "sleep",
    category: "lifestyle",
    title: "Sleep target",
    value: `${target} hours`,
    detail: debt > 0.5 ? "Half an hour extra tonight to pay down recent sleep debt." : "Keep a consistent wake time.",
    why: [
      { label: "Baseline need", value: `${need} h`, effect: context.age < 18 ? "under 18" : "adult" },
      ...(recent.length ? [{ label: `Last ${recent.length} nights`, value: `${mean(recent).toFixed(1)} h average`, effect: debt > 0.5 ? `${debt.toFixed(1)} h short` : "on target" }] : []),
      ...(sleep.numeric != null ? [{ label: "Sleep score", value: `${sleep.numeric}/100` }] : []),
    ],
  });

  return recs;
}

// ── Supplements ──────────────────────────────────────────────────────────

const BLOOD_THINNERS = /warfarin|coumadin|apixaban|eliquis|rivaroxaban|xarelto|dabigatran|clopidogrel|plavix|blood thinner|anticoagulant/i;

function supplements(context: UserContext, today: DayState, days: DayState[], sleep: Score, cardio: Score & { level?: Level }): Recommendation[] {
  const recs: Recommendation[] = [];
  const taking = context.supplements.toLowerCase();
  const kidney = context.conditions.includes("kidney");
  const alreadyOn = (...names: string[]) => names.some((name) => taking.includes(name));
  const push = (rec: Recommendation, aliases: string[]) => {
    if (alreadyOn(...aliases)) {
      recs.push({ ...rec, value: "Already taking", detail: "On your list. Nothing in today's data suggests changing it.", why: [...rec.why, { label: "Your supplements", value: "Listed" }] });
    } else {
      recs.push(rec);
    }
  };

  const training = context.goals.some((g) => g === "muscle" || g === "recovery" || g === "fat-loss");
  if (training && context.trainingDays >= 2) {
    push(
      {
        id: "creatine",
        category: "supplement",
        title: "Creatine monohydrate",
        value: kidney ? "Ask your clinician first" : "3–5 g daily",
        detail: "The most studied sports supplement. Timing does not matter; consistency does.",
        why: [
          { label: "Goals", value: context.goals.map(goalLabel).join(", ") },
          { label: "Training days", value: `${context.trainingDays} / week` },
        ],
        caution: kidney ? "Kidney disease: creatine raises creatinine and needs clinician sign-off." : undefined,
      },
      ["creatine"],
    );
  }

  const soreness = today.soreness ?? 0;
  const stress = today.stress ?? 0;
  if ((sleep.numeric != null && sleep.numeric < 70) || soreness >= 4 || stress >= 4) {
    const why: Driver[] = [];
    if (sleep.numeric != null && sleep.numeric < 70) why.push({ label: "Sleep score", value: `${sleep.numeric}/100`, effect: "below 70" });
    if (soreness >= 4) why.push({ label: "Soreness", value: `${soreness} / 5` });
    if (stress >= 4) why.push({ label: "Stress", value: `${stress} / 5` });
    push(
      {
        id: "magnesium",
        category: "supplement",
        title: "Magnesium",
        value: "Review intake",
        detail: "Check food first: greens, legumes, nuts, seeds. Glycinate is a common evening form.",
        why,
        caution: kidney
          ? "Kidney disease: magnesium can build up. Do not supplement without your clinician."
          : "Separate from some antibiotics and osteoporosis drugs by a few hours; ask a pharmacist.",
      },
      ["magnesium"],
    );
  }

  const strain = today.strain ?? today.yesterdayLoad ?? days.at(-2)?.strain ?? 0;
  if (strain >= 14 || context.trainingDays >= 5) {
    push(
      {
        id: "electrolytes",
        category: "supplement",
        title: "Electrolytes",
        value: "On long or sweaty sessions",
        detail: "Sodium matters most. Plain water covers short sessions.",
        why: [
          ...(strain >= 14 ? [{ label: "Strain", value: strain.toFixed(1), effect: "14 or higher" }] : []),
          ...(context.trainingDays >= 5 ? [{ label: "Training days", value: `${context.trainingDays} / week` }] : []),
        ],
        caution: context.conditions.includes("cardio") ? "Blood-pressure or heart condition: check sodium with your clinician." : undefined,
      },
      ["electrolyte", "lmnt", "salt"],
    );
  }

  push(
    {
      id: "vitamin-d",
      category: "supplement",
      title: "Vitamin D",
      value: "Test before you dose",
      detail: "A blood test (25-OH D) tells you whether you need it and how much.",
      why: [{ label: "Everyone", value: "Low levels are common and easy to check" }],
    },
    ["vitamin d", "vit d", "d3"],
  );

  const omegaWhy: Driver[] = [];
  if (context.goals.includes("recovery")) omegaWhy.push({ label: "Goal", value: "Recovery" });
  if (context.goals.includes("longevity")) omegaWhy.push({ label: "Goal", value: "Cellular health" });
  if (cardio.level && cardio.level !== "Low") omegaWhy.push({ label: "Cardiovascular stress", value: cardio.level });
  if (omegaWhy.length) {
    const cautions: string[] = [];
    if (BLOOD_THINNERS.test(context.medications)) cautions.push("You listed a blood thinner: fish oil can add to bleeding risk.");
    if (/fish|shellfish/i.test(context.allergies)) cautions.push("You listed a fish or shellfish allergy: look at algae-based omega-3.");
    push(
      {
        id: "omega-3",
        category: "supplement",
        title: "Omega-3 (EPA/DHA)",
        value: "Review intake",
        detail: "Two servings of oily fish a week, or a supplement if you eat none.",
        why: omegaWhy,
        caution: cautions.join(" ") || undefined,
      },
      ["omega", "fish oil", "epa", "dha"],
    );
  }

  return recs;
}

// ── Compounds (educational) ──────────────────────────────────────────────

const BP_MEDS = /lisinopril|losartan|amlodipine|metoprolol|valsartan|hydrochlorothiazide|blood pressure/i;
const GLUCOSE_MEDS = /insulin|glipizide|glyburide|glimepiride|sulfonylurea|metformin/i;

function compounds(context: UserContext, pool: CompoundSource[]): { cards: CompoundCard[]; withheld?: string; notes: string[] } {
  if (context.age < 21) return { cards: [], withheld: "Compound research is hidden under 21.", notes: [] };
  if (context.conditions.includes("pregnant")) {
    return { cards: [], withheld: "Pregnancy, nursing, or trying to conceive: no compound on this site has safety data for that. Speak to your clinician.", notes: [] };
  }

  const bySlug = new Map(pool.map((entry) => [entry.slug, entry]));
  const minScore = context.tolerance === "conservative" ? 70 : context.tolerance === "moderate" ? 50 : 0;
  const notes: string[] = [];
  const cancer = context.conditions.includes("cancer");
  const heart = context.conditions.includes("cardio");
  if (cancer) notes.push("Cancer history: growth-signalling compounds (GH axis, BPC-157, TB-500) are not shown.");
  if (heart) notes.push("Heart or blood-pressure condition: GLP-1 agonists and PT-141 are not shown.");

  const seen = new Set<string>();
  const cards: CompoundCard[] = [];
  for (const goal of context.goals) {
    const picks = compoundsByGoal[goal]
      .map((slug) => bySlug.get(slug))
      .filter((entry): entry is CompoundSource => Boolean(entry))
      .filter((entry) => !seen.has(entry.slug))
      .filter((entry) => entry.status === "approved" || entry.researchScore >= minScore)
      .filter((entry) => !(context.tolerance !== "open" && entry.status === "investigational" && entry.researchScore < 60))
      .filter((entry) => !(cancer && GROWTH_AXIS.has(entry.slug)))
      .filter((entry) => !(heart && (GLP1.has(entry.slug) || entry.slug === "pt-141")))
      .sort((a, b) => b.researchScore - a.researchScore)
      .slice(0, 2);

    for (const entry of picks) {
      seen.add(entry.slug);
      cards.push(card(entry, goal, context));
    }
  }
  return { cards, notes };
}

function card(entry: CompoundSource, goal: GoalId, context: UserContext): CompoundCard {
  const cautions: string[] = [];
  const meds = context.medications.trim();
  if (GLP1.has(entry.slug) && (context.conditions.includes("diabetes") || GLUCOSE_MEDS.test(meds))) {
    cautions.push("With insulin or other glucose-lowering drugs, GLP-1 agonists can push blood sugar too low.");
  }
  if (entry.slug === "pt-141" && BP_MEDS.test(meds)) {
    cautions.push("PT-141 can raise blood pressure; you listed blood-pressure medication.");
  }
  if (entry.status !== "approved") {
    cautions.push("Not approved for human use in the US. Product quality and purity are unregulated.");
  }
  if (meds) cautions.push(`Bring your full medication list (${meds}) to the conversation.`);
  if (context.allergies.trim()) cautions.push(`Mention your allergies: ${context.allergies.trim()}.`);

  const risks = entry.sideEffects.slice(0, 4);
  const questions = [
    `Is ${entry.name} a reasonable option for ${goalLabel(goal).toLowerCase()} given my history${meds ? " and medications" : ""}?`,
    `The human evidence is rated ${entry.researchScore}/100. What would we realistically expect to change, and how would we measure it?`,
    risks.length >= 2
      ? `How would we watch for ${risks[0].toLowerCase()} and ${risks[1].toLowerCase()}?`
      : "What side effects should I watch for, and when should I stop?",
    entry.status === "approved"
      ? "Would this be prescribed for my situation, and what are the alternatives?"
      : "It is not an approved drug here. What are the legal and quality risks of using it?",
  ];

  return {
    slug: entry.slug,
    name: entry.name,
    goal: goalLabel(goal),
    status: entry.legal,
    evidence: entry.evidence,
    researchScore: entry.researchScore,
    approval: entry.approval,
    benefits: [entry.primaryUse, entry.effects.slice(0, 4).join(", ")].filter(Boolean).join(". "),
    risks,
    boxedWarning: entry.boxedWarning,
    cautions,
    questions,
    worksheet: entry.worksheet,
    why: [
      { label: "Your goal", value: goalLabel(goal) },
      { label: "Risk tolerance", value: context.tolerance, effect: "sets which evidence levels appear" },
      { label: "Pepipedia research score", value: `${entry.researchScore}/100` },
      { label: "Today's wearable data", value: "Not used", effect: "compounds are never picked from daily metrics" },
    ],
  };
}

// ── Report ───────────────────────────────────────────────────────────────

export function buildReport(context: UserContext, history: DayState[], pool: CompoundSource[]): DailyReport | null {
  const days = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const today = days.at(-1);
  if (!today) return null;
  const prior = days.slice(0, -1);
  const yesterday = prior.at(-1);
  const base = baselineFrom(prior);

  const recovery = recoveryScore(today, base, context);
  const sleep = sleepScore(today, context);
  const cardio = cardioStress(today, base);
  const ready = readiness(recovery, cardio, today, yesterday);
  const goal = goalAlignment(days, context);
  const { cards, withheld, notes } = compounds(context, pool);

  const reportNotes = [...notes];
  if (base.days < BASELINE_MIN_DAYS) {
    reportNotes.push(`Baselines need ${BASELINE_MIN_DAYS} days of data. You have ${base.days} before today, so heart-rate comparisons are limited.`);
  }

  return {
    date: today.date,
    source: today.source,
    baselineDays: base.days,
    scores: [recovery, sleep, cardio, ready, goal],
    lifestyle: lifestyle(context, today, days, ready, sleep),
    supplements: supplements(context, today, days, sleep, cardio),
    compounds: cards,
    compoundsWithheld: withheld,
    notes: reportNotes,
  };
}
