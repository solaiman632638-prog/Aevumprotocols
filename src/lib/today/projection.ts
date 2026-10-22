/**
 * When the user's own weight trend reaches their target weight, if it keeps
 * going at the rate it has. A projection of logged data, not a plan: it says
 * nothing about which compound, how much, or for how long.
 */

const DAY = 86_400_000;

/** Weigh-ins older than this stop counting, so the rate reflects now. */
const WINDOW_DAYS = 28;
const MIN_POINTS = 3;
const MIN_SPAN_DAYS = 7;
/** Slower than this (kg a week) reads as holding steady, not trending. */
const FLAT_KG_PER_WEEK = 0.1;
/** Within this of target counts as there. */
const REACHED_KG = 0.5;

export type WeighIn = { date: string; weightKg: number };

export type WeightProjection =
  | { status: "no-target" }
  | { status: "not-enough"; points: number; needed: number; spanDays: number; neededSpanDays: number }
  | { status: "reached"; currentKg: number; targetKg: number }
  | { status: "flat" | "away"; currentKg: number; targetKg: number; kgPerWeek: number }
  | { status: "on-track"; currentKg: number; targetKg: number; kgPerWeek: number; weeks: number; eta: string };

const dayNumber = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);

export function projectWeight(weighIns: WeighIn[], targetKg: number | undefined, today: string): WeightProjection {
  if (!targetKg) return { status: "no-target" };

  const now = dayNumber(today);
  const recent = weighIns
    .filter((entry) => Number.isFinite(entry.weightKg) && entry.weightKg > 0)
    .map((entry) => ({ x: dayNumber(entry.date), y: entry.weightKg }))
    .filter((point) => point.x <= now && now - point.x < WINDOW_DAYS)
    .sort((a, b) => a.x - b.x);

  const span = recent.length > 1 ? recent[recent.length - 1].x - recent[0].x : 0;
  if (recent.length < MIN_POINTS || span < MIN_SPAN_DAYS) {
    return { status: "not-enough", points: recent.length, needed: MIN_POINTS, spanDays: span, neededSpanDays: MIN_SPAN_DAYS };
  }

  // Least-squares line through the weigh-ins: one heavy or light morning
  // moves it a little, not a lot.
  const meanX = recent.reduce((sum, p) => sum + p.x, 0) / recent.length;
  const meanY = recent.reduce((sum, p) => sum + p.y, 0) / recent.length;
  const slope =
    recent.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) /
    recent.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  const currentKg = round(meanY + slope * (now - meanX));
  const kgPerWeek = round(slope * 7);
  const gap = targetKg - currentKg;

  if (Math.abs(gap) <= REACHED_KG) return { status: "reached", currentKg, targetKg };
  if (Math.abs(kgPerWeek) < FLAT_KG_PER_WEEK) return { status: "flat", currentKg, targetKg, kgPerWeek };
  if (Math.sign(gap) !== Math.sign(slope)) return { status: "away", currentKg, targetKg, kgPerWeek };

  const daysToGo = Math.ceil(gap / slope);
  return {
    status: "on-track",
    currentKg,
    targetKg,
    kgPerWeek,
    weeks: Math.ceil(daysToGo / 7),
    eta: new Date((now + daysToGo) * DAY).toISOString().slice(0, 10),
  };
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
