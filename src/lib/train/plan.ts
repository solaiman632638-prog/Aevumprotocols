import type { GoalId } from "@/lib/plan/types";
import { getExercise, oneRepMax, rank, type Muscle } from "@/lib/train/exercises";
import type { WorkoutDay } from "@/lib/train/types";
import type { UserContext } from "@/lib/today/types";

/** Best estimated max per exercise, in kg, from the most recent 90 days that have data. */
export function bestMaxes(days: WorkoutDay[], bodyKg = 0): Map<string, number> {
  const best = new Map<string, number>();
  const last = days.at(-1)?.date;
  if (!last) return best;
  const cutoff = new Date(`${last}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - 90);
  const since = cutoff.toISOString().slice(0, 10);
  for (const day of days) {
    if (day.date < since) continue;
    for (const lift of day.lifts) {
      const load = getExercise(lift.exercise)?.bodyweight ? bodyKg + lift.weightKg : lift.weightKg;
      best.set(lift.exercise, Math.max(best.get(lift.exercise) ?? 0, oneRepMax(load, lift.reps)));
    }
  }
  return best;
}

/** Working sets per muscle over the last 28 days. */
export function weeklyVolume(days: WorkoutDay[], today: string): Map<Muscle, number> {
  const cutoff = new Date(`${today}T00:00:00`);
  cutoff.setDate(cutoff.getDate() - 28);
  const since = cutoff.toISOString().slice(0, 10);
  const volume = new Map<Muscle, number>();
  for (const day of days) {
    if (day.date <= since) continue;
    for (const lift of day.lifts) {
      const muscle = getExercise(lift.exercise)?.muscle;
      if (muscle) volume.set(muscle, (volume.get(muscle) ?? 0) + lift.sets);
    }
  }
  return volume;
}

export type Focus = { muscle: Muscle; reason: string; source: "lifts" | "photo" };

/**
 * Weak points from the numbers: a lift ranking well below the others, the
 * classic strength ratios coaches check, and muscles left untrained.
 */
export function strengthFocus(profile: UserContext | null, days: WorkoutDay[], today: string): Focus[] {
  const maxes = bestMaxes(days, profile?.weightKg);
  const focus: Focus[] = [];
  const add = (muscle: Muscle, reason: string) => {
    if (!focus.some((item) => item.muscle === muscle)) focus.push({ muscle, reason, source: "lifts" });
  };

  if (profile) {
    const ranked = ["squat", "bench", "deadlift", "ohp", "row"].flatMap((slug) => {
      const max = maxes.get(slug);
      const exercise = getExercise(slug)!;
      const standing = max ? rank(exercise, profile.sex, profile.weightKg, profile.age, max) : null;
      return standing ? [{ exercise, percentile: standing.percentile }] : [];
    });
    for (const item of ranked) {
      const others = ranked.filter((other) => other !== item);
      if (others.length === 0) continue;
      const average = others.reduce((sum, other) => sum + other.percentile, 0) / others.length;
      if (average - item.percentile >= 15) {
        add(item.exercise.muscle, `Your ${item.exercise.name.toLowerCase()} ranks around ${item.percentile}%, well behind your other lifts (about ${Math.round(average)}%).`);
      }
    }
  }

  const ratio = (a: string, b: string) => {
    const x = maxes.get(a);
    const y = maxes.get(b);
    return x && y ? x / y : null;
  };
  const rowBench = ratio("row", "bench");
  if (rowBench !== null && rowBench < 0.7) add("back", `Your row is ${Math.round(rowBench * 100)}% of your bench. Aim for 75% or more to keep shoulders healthy.`);
  const ohpBench = ratio("ohp", "bench");
  if (ohpBench !== null && ohpBench < 0.55) add("shoulders", `Your overhead press is ${Math.round(ohpBench * 100)}% of your bench; around 60–65% is typical.`);
  const squatDead = ratio("squat", "deadlift");
  if (squatDead !== null && squatDead < 0.7) add("quads", `Your squat is ${Math.round(squatDead * 100)}% of your deadlift; 75–85% is typical.`);
  if (squatDead !== null && squatDead > 1) add("posterior", "Your squat outlifts your deadlift, which usually means the hamstrings and glutes lag.");

  const volume = weeklyVolume(days, today);
  const total = [...volume.values()].reduce((sum, sets) => sum + sets, 0);
  if (total >= 12) {
    for (const muscle of ["quads", "posterior", "back", "chest", "shoulders"] as Muscle[]) {
      if (!volume.get(muscle)) add(muscle, "No sets logged for it in the last 4 weeks.");
    }
  }
  return focus.slice(0, 3);
}

// ── Weekly plan ──────────────────────────────────────────────────────────

type Slot = { exercise: string; main?: boolean };
type Template = { name: string; slots: Slot[] };

const t = (name: string, main: string[], accessories: string[]): Template => ({
  name,
  slots: [...main.map((exercise) => ({ exercise, main: true })), ...accessories.map((exercise) => ({ exercise }))],
});

const templates = {
  fullA: t("Full body A", ["squat", "bench", "row"], ["lateral-raise", "curl"]),
  fullB: t("Full body B", ["deadlift", "ohp", "lat-pulldown"], ["lunge", "triceps"]),
  fullC: t("Full body C", ["leg-press", "incline-bench", "cable-row"], ["leg-curl", "calf-raise"]),
  upperA: t("Upper A", ["bench", "row", "ohp"], ["lat-pulldown", "curl", "triceps"]),
  lowerA: t("Lower A", ["squat", "rdl"], ["leg-press", "leg-curl", "calf-raise"]),
  upperB: t("Upper B", ["incline-bench", "pull-up", "db-press"], ["cable-row", "lateral-raise", "triceps"]),
  lowerB: t("Lower B", ["deadlift", "front-squat"], ["lunge", "leg-extension", "calf-raise"]),
  push: t("Push", ["bench", "ohp"], ["incline-bench", "lateral-raise", "triceps", "dip"]),
  pull: t("Pull", ["row", "pull-up"], ["cable-row", "lat-pulldown", "curl"]),
  legs: t("Legs", ["squat", "rdl"], ["leg-press", "leg-curl", "calf-raise"]),
};

const splits: Record<number, { name: string; days: Template[] }> = {
  1: { name: "Full body", days: [templates.fullA] },
  2: { name: "Full body, twice a week", days: [templates.fullA, templates.fullB] },
  3: { name: "Full body, three days", days: [templates.fullA, templates.fullB, templates.fullC] },
  4: { name: "Upper / lower", days: [templates.upperA, templates.lowerA, templates.upperB, templates.lowerB] },
  5: { name: "Upper / lower + push / pull / legs", days: [templates.upperA, templates.lowerA, templates.push, templates.pull, templates.legs] },
  6: { name: "Push / pull / legs, twice", days: [templates.push, templates.pull, templates.legs, templates.push, templates.pull, templates.legs] },
};

export type PlanExercise = { exercise: string; sets: number; reps: string; weightKg?: number; focus?: boolean };
export type PlanDay = { name: string; exercises: PlanExercise[] };
export type Plan = { split: string; days: PlanDay[]; style: string; progression: string; extra?: string };

type Style = { main: [number, number, number]; accessory: [number, number, number]; name: string; extra?: string };

/** Sets, low reps, high reps for main lifts and accessories, by the profile's lead goal. */
function styleFor(goals: GoalId[]): Style {
  if (goals.includes("muscle")) return { name: "Hypertrophy: moderate weights, more volume.", main: [3, 6, 10], accessory: [3, 10, 15] };
  if (goals.includes("fat-loss")) {
    return {
      name: "Keep strength while you lose fat: heavy enough to hold muscle, plus conditioning.",
      main: [3, 5, 8],
      accessory: [2, 10, 15],
      extra: "Finish two sessions a week with 10–15 minutes of intervals (bike, rower, or incline walk), and walk 8,000+ steps daily.",
    };
  }
  if (goals.includes("recovery") || goals.includes("longevity")) {
    return {
      name: "Strength for health: steady progress, stopping well short of failure.",
      main: [3, 6, 10],
      accessory: [2, 10, 15],
      extra: "Add 5–10 minutes of mobility work after each session, and 150 minutes a week of easy cardio.",
    };
  }
  return { name: "Balanced strength and muscle.", main: [3, 5, 8], accessory: [3, 10, 12] };
}

const roundTo = (kg: number, step: number) => Math.round(kg / step) * step;

/** A week built from how often they train, their goal, their logged maxes, and their focus areas. */
export function buildPlan(profile: UserContext | null, daysPerWeek: number, days: WorkoutDay[], focus: Focus[]): Plan {
  const count = Math.min(6, Math.max(1, Math.round(daysPerWeek)));
  const split = splits[count];
  const style = styleFor(profile?.goals ?? []);
  const maxes = bestMaxes(days, profile?.weightKg);
  const focused = new Set(focus.map((item) => item.muscle));
  const imperial = profile?.units === "imperial";
  const step = imperial ? 5 / 2.20462 : 2.5;

  const planDays = split.days.map((template) => ({
    name: template.name,
    exercises: template.slots.map((slot) => {
      const exercise = getExercise(slot.exercise)!;
      const [sets, low, high] = slot.main ? style.main : style.accessory;
      const isFocus = focused.has(exercise.muscle);
      const max = maxes.get(slot.exercise);
      // Load for the bottom of the range with about two reps left in the tank.
      const load = max ? max / (1 + (low + 2) / 30) - (exercise.bodyweight ? profile?.weightKg ?? 0 : 0) : undefined;
      return {
        exercise: slot.exercise,
        sets: sets + (isFocus ? 1 : 0),
        reps: `${low}–${high}`,
        weightKg: load !== undefined && load > 0 ? roundTo(load, step) : undefined,
        focus: isFocus || undefined,
      };
    }),
  }));

  return {
    split: split.name,
    days: planDays,
    style: style.name,
    progression: `Use a weight you could lift for two more reps. When every set reaches the top of the rep range, add ${imperial ? "5 lb" : "2.5 kg"} to upper-body lifts or ${imperial ? "10 lb" : "5 kg"} to lower-body lifts next time.`,
    extra: style.extra,
  };
}
