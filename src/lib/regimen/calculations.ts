/**
 * Every number Aevum states about a regimen is produced here, in plain
 * TypeScript. The model is never asked to add, divide or compare — it is
 * handed these results and quotes them.
 */

export type Unit = "mg" | "mcg";

export type RegimenEntry = {
  compound: string;
  /** Amount per administration, in `unit`. */
  amount: number;
  unit: Unit;
  /** Administrations per week. */
  administrationsPerWeek: number;
  /** Optional weekday names, when the person named specific days. */
  days?: string[];
};

export type Exposure = {
  perAdministration: number;
  administrationsPerWeek: number;
  weeklyTotal: number;
  monthlyApproximate: number;
  unit: Unit;
};

const WEEKS_PER_MONTH = 52 / 12;

/** Rounds away binary-float noise without pretending to precision. */
function tidy(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export function calculateWeeklyTotal(amount: number, administrationsPerWeek: number): number {
  return tidy(amount * administrationsPerWeek);
}

export function calculateMonthlyApproximation(weeklyTotal: number): number {
  return tidy(weeklyTotal * WEEKS_PER_MONTH);
}

/** Administrations a week, from named days when given, else the stated count. */
export function calculateAdministrationsPerWeek(entry: RegimenEntry): number {
  if (entry.days && entry.days.length > 0) return entry.days.length;
  return entry.administrationsPerWeek;
}

/** Percentage change from one amount to another. Null when `from` is 0. */
export function calculatePercentageChange(from: number, to: number): number | null {
  if (from === 0) return null;
  return tidy(((to - from) / from) * 100);
}

export function calculateDoseDifference(from: number, to: number): number {
  return tidy(to - from);
}

/** Even spacing between administrations, in days. Null when fewer than one. */
export function calculateTimeBetweenAdministrations(administrationsPerWeek: number): number | null {
  if (administrationsPerWeek <= 0) return null;
  return tidy(7 / administrationsPerWeek);
}

/** The full exposure picture for one entry. */
export function calculateExposure(entry: RegimenEntry): Exposure {
  const administrationsPerWeek = calculateAdministrationsPerWeek(entry);
  const weeklyTotal = calculateWeeklyTotal(entry.amount, administrationsPerWeek);
  return {
    perAdministration: tidy(entry.amount),
    administrationsPerWeek,
    weeklyTotal,
    monthlyApproximate: calculateMonthlyApproximation(weeklyTotal),
    unit: entry.unit,
  };
}

export type RegimenChange = {
  compound: string;
  unit: Unit;
  previousWeekly: number;
  proposedWeekly: number;
  difference: number;
  percentageChange: number | null;
};

/** A stated change, expressed as difference and percentage. No judgement. */
export function compareRegimens(
  compound: string,
  previous: RegimenEntry,
  proposed: RegimenEntry,
): RegimenChange {
  const previousWeekly = calculateExposure(previous).weeklyTotal;
  const proposedWeekly = calculateExposure(proposed).weeklyTotal;
  return {
    compound,
    unit: previous.unit,
    previousWeekly,
    proposedWeekly,
    difference: calculateDoseDifference(previousWeekly, proposedWeekly),
    percentageChange: calculatePercentageChange(previousWeekly, proposedWeekly),
  };
}

/** One line per entry, ready to hand to the model verbatim. */
export function describeExposure(entry: RegimenEntry): string {
  const exposure = calculateExposure(entry);
  const days = entry.days?.length ? ` on ${entry.days.join(", ")}` : "";
  return `${entry.compound}: ${exposure.perAdministration} ${exposure.unit} × ${exposure.administrationsPerWeek}/week${days} = ${exposure.weeklyTotal} ${exposure.unit}/week (about ${exposure.monthlyApproximate} ${exposure.unit}/month)`;
}
