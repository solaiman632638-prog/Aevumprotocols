export type ReconInput = {
  vialMg: number;
  waterMl: number;
  doseMcg: number;
};

export type ReconResult = {
  mcgPerMl: number;
  mcgPerUnit: number;
  mgPerMl: number;
  drawMl: number;
  drawUnits: number;
  dosesPerVial: number;
};

/** U-100 insulin syringe: 100 units = 1 mL. */
export const UNITS_PER_ML = 100;

export function calculateRecon({
  vialMg,
  waterMl,
  doseMcg,
}: ReconInput): ReconResult | null {
  if (vialMg <= 0 || waterMl <= 0 || doseMcg <= 0) return null;

  const mcgPerMl = (vialMg * 1000) / waterMl;
  const mgPerMl = vialMg / waterMl;
  const mcgPerUnit = mcgPerMl / UNITS_PER_ML;
  const drawMl = doseMcg / mcgPerMl;
  const drawUnits = drawMl * UNITS_PER_ML;
  const dosesPerVial = (vialMg * 1000) / doseMcg;

  if (!Number.isFinite(drawMl) || drawMl <= 0) return null;

  return {
    mcgPerMl,
    mcgPerUnit,
    mgPerMl,
    drawMl,
    drawUnits,
    dosesPerVial,
  };
}

export function formatNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(Math.min(digits, 1));
  return value.toFixed(digits);
}
