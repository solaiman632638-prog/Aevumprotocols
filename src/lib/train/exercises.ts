import type { Sex } from "@/lib/today/types";

/**
 * Lifts the tracker knows. The five barbell lifts carry strength standards:
 * one-rep max as a multiple of body weight at each level, approximated from
 * the widely used community standards (Strength Level, Symmetric Strength).
 * The others track progress only.
 */
export type Level = "Beginner" | "Novice" | "Intermediate" | "Advanced" | "Elite";

export const levels: { name: Level; percentile: number }[] = [
  { name: "Beginner", percentile: 5 },
  { name: "Novice", percentile: 20 },
  { name: "Intermediate", percentile: 50 },
  { name: "Advanced", percentile: 80 },
  { name: "Elite", percentile: 95 },
];

type Standards = Record<Sex, [number, number, number, number, number]>;

export const muscles = [
  { slug: "chest", name: "Chest" },
  { slug: "back", name: "Back" },
  { slug: "shoulders", name: "Shoulders" },
  { slug: "quads", name: "Quads" },
  { slug: "posterior", name: "Hamstrings & glutes" },
  { slug: "arms", name: "Arms" },
  { slug: "calves", name: "Calves" },
] as const;

export type Muscle = (typeof muscles)[number]["slug"];

export const muscleName = (slug: Muscle) => muscles.find((m) => m.slug === slug)?.name ?? slug;

export type Exercise = { slug: string; name: string; muscle: Muscle; bodyweight?: boolean; standards?: Standards };

export const exercises: Exercise[] = [
  { slug: "squat", name: "Back squat", muscle: "quads", standards: { male: [0.75, 1.25, 1.5, 2.25, 2.75], female: [0.5, 0.75, 1.25, 1.5, 2] } },
  { slug: "bench", name: "Bench press", muscle: "chest", standards: { male: [0.5, 0.75, 1, 1.5, 2], female: [0.25, 0.5, 0.75, 1, 1.5] } },
  { slug: "deadlift", name: "Deadlift", muscle: "posterior", standards: { male: [1, 1.5, 2, 2.5, 3], female: [0.5, 1, 1.25, 1.75, 2.5] } },
  { slug: "ohp", name: "Overhead press", muscle: "shoulders", standards: { male: [0.35, 0.55, 0.75, 1, 1.35], female: [0.2, 0.35, 0.5, 0.75, 1] } },
  { slug: "row", name: "Barbell row", muscle: "back", standards: { male: [0.5, 0.75, 1, 1.5, 1.75], female: [0.25, 0.4, 0.65, 0.9, 1.2] } },
  { slug: "front-squat", name: "Front squat", muscle: "quads" },
  { slug: "rdl", name: "Romanian deadlift", muscle: "posterior" },
  { slug: "incline-bench", name: "Incline bench press", muscle: "chest" },
  { slug: "db-bench", name: "Dumbbell bench press", muscle: "chest" },
  { slug: "db-press", name: "Dumbbell shoulder press", muscle: "shoulders" },
  { slug: "pull-up", name: "Pull-up", muscle: "back", bodyweight: true },
  { slug: "chin-up", name: "Chin-up", muscle: "back", bodyweight: true },
  { slug: "dip", name: "Dip", muscle: "chest", bodyweight: true },
  { slug: "push-up", name: "Push-up", muscle: "chest", bodyweight: true },
  { slug: "lat-pulldown", name: "Lat pulldown", muscle: "back" },
  { slug: "cable-row", name: "Seated cable row", muscle: "back" },
  { slug: "leg-press", name: "Leg press", muscle: "quads" },
  { slug: "lunge", name: "Lunge", muscle: "quads" },
  { slug: "hip-thrust", name: "Hip thrust", muscle: "posterior" },
  { slug: "leg-curl", name: "Leg curl", muscle: "posterior" },
  { slug: "leg-extension", name: "Leg extension", muscle: "quads" },
  { slug: "calf-raise", name: "Calf raise", muscle: "calves" },
  { slug: "curl", name: "Biceps curl", muscle: "arms" },
  { slug: "triceps", name: "Triceps extension", muscle: "arms" },
  { slug: "lateral-raise", name: "Lateral raise", muscle: "shoulders" },
];

export function getExercise(slug: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.slug === slug);
}

/** Estimated one-rep max (Epley). A single rep is the max itself. */
export function oneRepMax(weightKg: number, reps: number): number {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

/**
 * Age coefficients from masters powerlifting (McCulloch) and junior lifting:
 * a 60-year-old's lift counts about a third more. Linear between points.
 */
const ageCurve: [number, number][] = [
  [14, 1.23], [16, 1.13], [18, 1.06], [20, 1.03], [23, 1], [40, 1],
  [45, 1.055], [50, 1.13], [55, 1.22], [60, 1.33], [65, 1.46], [70, 1.61], [75, 1.8], [80, 2],
];

export function ageFactor(age: number): number {
  if (age <= ageCurve[0][0]) return ageCurve[0][1];
  for (let i = 1; i < ageCurve.length; i++) {
    const [a1, f1] = ageCurve[i];
    const [a0, f0] = ageCurve[i - 1];
    if (age <= a1) return f0 + ((age - a0) / (a1 - a0)) * (f1 - f0);
  }
  return ageCurve.at(-1)![1];
}

export type Rank = { level: Level; percentile: number; next?: { level: Level; kg: number } };

/**
 * Where an estimated max sits among lifters of the same sex, scaled for body
 * weight and age. Percentile is interpolated between level anchors, so it is
 * an estimate, not a measured population figure.
 */
export function rank(exercise: Exercise, sex: Sex, bodyKg: number, age: number, maxKg: number): Rank | null {
  const table = exercise.standards?.[sex];
  if (!table || bodyKg <= 0) return null;
  const factor = ageFactor(age);
  const ratio = (maxKg * factor) / bodyKg;
  const anchors: [number, number][] = [[0, 0], ...table.map((r, i): [number, number] => [r, levels[i].percentile]), [table[4] * 1.3, 99]];
  let percentile = 99;
  for (let i = 1; i < anchors.length; i++) {
    if (ratio <= anchors[i][0]) {
      const [r0, p0] = anchors[i - 1];
      const [r1, p1] = anchors[i];
      percentile = p0 + ((ratio - r0) / (r1 - r0)) * (p1 - p0);
      break;
    }
  }
  const reached = table.filter((r) => ratio >= r).length;
  const level = levels[Math.max(0, reached - 1)].name;
  const next = reached < table.length ? { level: levels[reached].name, kg: (table[reached] * bodyKg) / factor } : undefined;
  return { level, percentile: Math.max(1, Math.round(percentile)), next };
}
