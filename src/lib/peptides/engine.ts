import { compounds, getCompound, sites, symptoms, toUnit, type CompoundModel, type SiteId } from "./catalog";
import type { DayState, Driver, Reaction, UserContext } from "../today/types";

/**
 * Peptide check-in analysis. Guidance restates each compound's published
 * protocol (titration ladder, range, cycle length) against what the user has
 * logged, and holds or stops on side effects. It never goes above a
 * protocol's maximum and never uses heart-rate, sleep, or other metrics.
 */

export type GuidanceStatus = "start" | "keep" | "step-up" | "hold" | "step-down" | "above-max" | "break" | "stop";

export type Guidance = {
  slug: string;
  name: string;
  status: GuidanceStatus;
  headline: string;
  detail: string;
  current: string;
  why: Driver[];
};

export type Interaction = {
  level: "warning" | "caution" | "info";
  title: string;
  detail: string;
  compounds: string[];
};

export type SiteSummary = {
  usage: Partial<Record<SiteId, { lastDate: string; count: number }>>;
  suggestion: SiteId;
  repeats: { site: SiteId; compound: string; lastDate: string }[];
};

export type PeptideReport = {
  guidance: Guidance[];
  interactions: Interaction[];
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

function guidanceFor(model: CompoundModel, doses: Dose[], reactions: (Reaction & { date: string })[], today: string, context: UserContext): Guidance {
  const last = doses[doses.length - 1];
  const current = last.amount;
  const unit = model.unit;
  const base = { slug: model.slug, name: model.name, current: `${fmt(current)} ${unit}` };
  const start = runStart(doses);
  const onCycle = days(start, today) + 1;
  const since = atDoseSince(doses);
  const weeksAtDose = Math.floor((days(since, today) + 1) / 7);
  const why: Driver[] = [
    { label: "Last dose", value: `${fmt(current)} ${unit}`, effect: last.date },
    { label: "Protocol range", value: `${fmt(model.range[0])}–${fmt(model.range[1])} ${unit}`, effect: `max ${fmt(model.max)}` },
    { label: "This run", value: `day ${onCycle}`, effect: model.cycleDays ? `protocol run ${model.cycleDays} days` : undefined },
  ];

  // The user's health history outranks any protocol step.
  if (context.conditions.includes("cancer") && model.classes.includes("growth-signal")) {
    return {
      ...base,
      status: "stop",
      headline: "Check with your oncologist first",
      detail: "This compound promotes growth signalling. With a cancer history, do not continue without your oncologist's approval.",
      why: [...why, { label: "Health history", value: "Cancer" }],
    };
  }
  if (context.conditions.includes("cardio") && model.classes.some((c) => c === "glp1" || c === "melanocortin")) {
    return {
      ...base,
      status: "hold",
      headline: "Check with your doctor first",
      detail: "This compound can raise heart rate or blood pressure. With a heart or blood-pressure condition, get your doctor's go-ahead before continuing.",
      why: [...why, { label: "Health history", value: "Heart or blood pressure" }],
    };
  }

  const severe = reactions.filter((r) => r.severity === 3);
  if (severe.length > 0) {
    return {
      ...base,
      status: "stop",
      headline: "Pause and get medical advice",
      detail: `You logged a severe ${symptomLabel(severe[0].symptom).toLowerCase()}. Stop taking anything new, and contact a clinician or urgent care if it does not ease quickly.`,
      why: [...why, { label: "Severe side effect", value: symptomLabel(severe[0].symptom), effect: severe[0].date }],
    };
  }
  if (reactions.some((r) => r.symptom === "low-sugar") && model.classes.some((c) => c === "igf" || c === "glp1")) {
    return {
      ...base,
      status: "hold",
      headline: "Do not increase: possible low blood sugar",
      detail: "Shakiness, sweating, or dizziness on a compound that lowers blood sugar needs attention. Eat, check your glucose if you can, and talk to a clinician before the next dose.",
      why: [...why, { label: "Side effect", value: "Shaky, sweaty, or dizzy" }],
    };
  }
  if (current > model.max * 1.02) {
    return {
      ...base,
      status: "above-max",
      headline: `Above the protocol maximum of ${fmt(model.max)} ${unit}`,
      detail: `Published protocols do not go above ${fmt(model.max)} ${unit}. Go back to a dose within ${fmt(model.range[0])}–${fmt(model.range[1])} ${unit}.`,
      why,
    };
  }
  if (model.cycleDays && onCycle > model.cycleDays) {
    return {
      ...base,
      status: "break",
      headline: "Time for a break",
      detail: `You are on day ${onCycle}; the protocol runs about ${model.cycleDays} days, then pauses before another round.`,
      why,
    };
  }

  // Spacing rules from the protocols.
  const previous = doses.length > 1 ? doses[doses.length - 2] : undefined;
  if (previous && model.frequency === "weekly" && days(previous.date, last.date) < 5) {
    return {
      ...base,
      status: "hold",
      headline: "Doses are too close together",
      detail: `This is a once-weekly compound, but your last two doses were ${days(previous.date, last.date)} days apart. Keep to one set day each week.`,
      why: [...why, { label: "Previous dose", value: previous.date }],
    };
  }
  if (previous && model.frequency === "as-needed" && days(previous.date, last.date) <= 1) {
    return {
      ...base,
      status: "hold",
      headline: "Not meant for back-to-back days",
      detail: "Protocols use this occasionally, not on consecutive days. Space doses out.",
      why: [...why, { label: "Previous dose", value: previous.date }],
    };
  }

  const moderateGi = reactions.filter((r) => r.severity >= 2 && gi.has(r.symptom));
  const moderateAny = reactions.filter((r) => r.severity >= 2);

  if (model.titration) {
    const { steps, weeksPerStep } = model.titration;
    const index = steps.reduce((found, step, i) => (current >= step * 0.98 ? i : found), -1);
    const why2: Driver[] = [...why, { label: "At this dose", value: `${weeksAtDose} week${weeksAtDose === 1 ? "" : "s"}`, effect: `protocol holds each step ${weeksPerStep} week${weeksPerStep === 1 ? "" : "s"}` }];

    if (moderateGi.length > 0) {
      const giDays = new Set(moderateGi.map((r) => r.date)).size;
      if (giDays >= 3 && index > 0) {
        return {
          ...base,
          status: "step-down",
          headline: `Consider stepping back to ${fmt(steps[index - 1])} ${unit}`,
          detail: "Side effects have lasted several days at this dose. Protocols treat dropping back one step as normal, and still effective.",
          why: [...why2, { label: "Stomach side effects", value: `${giDays} days this week`, effect: "moderate or worse" }],
        };
      }
      return {
        ...base,
        status: "hold",
        headline: "Stay at this dose for now",
        detail: "Do not step up while side effects are active. They usually settle within a week or two at the same dose.",
        why: [...why2, { label: "Side effect", value: symptomLabel(moderateGi[0].symptom), effect: "moderate" }],
      };
    }
    if (index < 0) {
      return { ...base, status: "start", headline: `Protocols start at ${fmt(steps[0])} ${unit}`, detail: "Your logged dose is below the first step of the protocol.", why: why2 };
    }
    const firstOfRun = doses.find((dose) => dose.date >= start);
    const firstIndex = firstOfRun ? steps.reduce((found, step, i) => (firstOfRun.amount >= step * 0.98 ? i : found), -1) : 0;
    if (firstIndex > 0 && index >= firstIndex && days(start, today) < weeksPerStep * 7) {
      return {
        ...base,
        status: "hold",
        headline: `Protocols start at ${fmt(steps[0])} ${unit}`,
        detail: `You started this run at ${fmt(firstOfRun!.amount)} ${unit}, above the first step. Starting high is the main cause of side effects; protocols climb one step at a time.`,
        why: [...why2, { label: "First dose this run", value: `${fmt(firstOfRun!.amount)} ${unit}`, effect: start }],
      };
    }
    if (index >= steps.length - 1) {
      return { ...base, status: "keep", headline: "At the protocol's top step", detail: "There is no higher step. Stay here or step down if side effects appear.", why: why2 };
    }
    if (weeksAtDose >= weeksPerStep && moderateAny.length === 0) {
      return {
        ...base,
        status: "step-up",
        headline: `Protocol's next step: ${fmt(steps[index + 1])} ${unit}`,
        detail: `You have held ${fmt(current)} ${unit} for ${weeksAtDose} weeks without logged side effects. Protocols only move up if progress has stalled; staying at a dose that works is fine.`,
        why: why2,
      };
    }
    return {
      ...base,
      status: "keep",
      headline: "Keep this dose",
      detail: `Week ${Math.min(weeksAtDose + 1, weeksPerStep)} of ${weeksPerStep} at this step. The protocol holds each step before moving up.`,
      why: why2,
    };
  }

  if (moderateAny.length > 0) {
    return {
      ...base,
      status: "hold",
      headline: "Do not increase",
      detail: `You logged ${symptomLabel(moderateAny[0].symptom).toLowerCase()}. Stay at or below this dose until it settles.`,
      why: [...why, { label: "Side effect", value: symptomLabel(moderateAny[0].symptom), effect: "moderate" }],
    };
  }
  if (current < model.range[0] * 0.98) {
    return { ...base, status: "start", headline: `Below the usual ${fmt(model.range[0])} ${unit}`, detail: "Your dose is under the protocol's typical range. That is not a reason to go higher on its own.", why };
  }
  return { ...base, status: "keep", headline: "Keep this dose", detail: `Within the protocol's typical range of ${fmt(model.range[0])}–${fmt(model.range[1])} ${unit}.`, why };
}

// ── Interactions ─────────────────────────────────────────────────────────

const GLUCOSE_MEDS = /insulin|glipizide|glyburide|glimepiride|sulfonylurea|metformin/i;

function interactions(active: CompoundModel[], lastDoses: Map<string, Dose[]>, context: UserContext): Interaction[] {
  const out: Interaction[] = [];
  const names = (list: CompoundModel[]) => list.map((c) => c.name);
  const withClass = (cls: string) => active.filter((c) => c.classes.includes(cls as never));

  const glp1 = withClass("glp1");
  if (glp1.length >= 2) {
    out.push({ level: "warning", title: "Two GLP-1 drugs at once", detail: "They work the same way, so side effects stack: nausea, dehydration, and low blood sugar. Protocols run one at a time.", compounds: names(glp1) });
  }
  const amylin = withClass("amylin");
  if (amylin.length && glp1.length === 1 && glp1[0].slug === "semaglutide") {
    out.push({ level: "info", title: "Common pairing", detail: "Cagrilintide and semaglutide are often run together. Titrate each on its own schedule, same day, different sites.", compounds: names([...amylin, ...glp1]) });
  } else if (amylin.length && glp1.length) {
    out.push({ level: "caution", title: "Amylin plus GLP-1", detail: "Both reduce appetite and slow the stomach. Expect stronger nausea; titrate one at a time.", compounds: names([...amylin, ...glp1]) });
  }

  const melano = withClass("melanocortin");
  if (melano.length >= 2) {
    out.push({ level: "warning", title: "Melanocortin compounds together", detail: "Melanotan-1, Melanotan-2, and PT-141 act on the same receptors. Combining them is redundant and adds nausea and blood-pressure effects.", compounds: names(melano) });
  }

  const ghrh = withClass("ghrh");
  if (ghrh.length >= 2) {
    out.push({ level: "warning", title: "Two GHRH analogues", detail: "Tesamorelin, sermorelin, and CJC-1295 do the same job. Protocols pick one, often paired with a single GHRP like ipamorelin.", compounds: names(ghrh) });
  }
  const ghrp = withClass("ghrp");
  if (ghrp.length >= 2) {
    out.push({ level: "caution", title: "More than one GHRP", detail: "Ipamorelin, GHRP-2, and GHRP-6 overlap. Check whether a blend already includes one you take separately.", compounds: names(ghrp) });
  }

  const igf = withClass("igf");
  if (igf.length >= 2) {
    out.push({ level: "warning", title: "Two IGF-1 variants", detail: "Both lower blood sugar and act on the same receptor. Run one at a time.", compounds: names(igf) });
  }
  if (igf.length && (glp1.length || context.conditions.includes("diabetes") || GLUCOSE_MEDS.test(context.medications))) {
    out.push({ level: "warning", title: "Low blood sugar risk", detail: "IGF-1 lowers blood sugar, and so do GLP-1 drugs and diabetes medication. Eat after every IGF dose and know the signs of a low.", compounds: names([...igf, ...glp1]) });
  }

  // Blends that overlap with something taken separately or in another blend.
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
      detail: `${sources.join(" and ")} both contain ${model.name}: about ${fmt(total)} ${model.unit} combined per dose${over ? `, above the protocol maximum of ${fmt(model.max)} ${model.unit}` : ""}. Count the blend toward your total.`,
      compounds: sources,
    });
  }

  if (withClass("copper").length && active.length > 1) {
    out.push({ level: "info", title: "GHK-Cu in the syringe", detail: "Copper can react with other peptides. Do not mix GHK-Cu in the same syringe as anything except BPC-157.", compounds: names(withClass("copper")) });
  }

  // The user's own health history.
  const growth = withClass("growth-signal");
  if (context.conditions.includes("cancer") && growth.length) {
    out.push({ level: "warning", title: "Cancer history", detail: "These compounds promote growth signalling. Do not use them without your oncologist's approval.", compounds: names(growth) });
  }
  if (context.conditions.includes("cardio") && (glp1.length || melano.length)) {
    out.push({ level: "warning", title: "Heart or blood-pressure condition", detail: "GLP-1 drugs raise heart rate and melanocortins can raise blood pressure. Check with your doctor first.", compounds: names([...glp1, ...melano]) });
  }
  if (context.conditions.includes("pregnant")) {
    out.push({ level: "warning", title: "Pregnancy or nursing", detail: "None of these compounds has safety data for pregnancy or nursing. Stop and speak to your clinician.", compounds: names(active) });
  }
  return out;
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
  if (all.size === 0) return null;

  const active = compounds.filter((model) => {
    const last = all.get(model.slug)?.at(-1);
    if (!last) return false;
    const window = model.frequency === "weekly" ? 10 : 7;
    return days(last.date, today) < window;
  });
  const reactions = recentReactions(history_, today, 7);
  const withheld =
    context.age < 21
      ? "Dose guidance is not shown under 21."
      : context.conditions.includes("pregnant")
        ? "Dose guidance is not shown during pregnancy or nursing. Speak to your clinician."
        : undefined;

  const found = interactions(active, all, context);
  // Never suggest a step up on a compound caught in an active warning.
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
          detail: "This peptide is part of a combination warning. Resolve that before changing its dose.",
          why: [...item.why, { label: "Blocked by", value: "Combination warning" }],
        };
      });

  return { guidance, interactions: found, sites: siteSummary(history_, today), withheld };
}
