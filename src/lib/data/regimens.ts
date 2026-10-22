import entries from "@/lib/data/regimens.json";

/**
 * Published dosing for monographs without a full protocol: the regulator's
 * label for approved drugs, the trial regimen for investigational ones, the
 * formulation level for cosmetic ingredients. Every number is in its source.
 */
export type RegimenBasis = "label" | "trial" | "study" | "cosmetic" | "none";

export type Regimen = {
  slug: string;
  basis: RegimenBasis;
  route: string;
  lines: string[];
  sources: { label: string; url: string }[];
};

export const regimens = entries as Regimen[];

const bySlug = new Map(regimens.map((regimen) => [regimen.slug, regimen]));

export function getRegimen(slug: string): Regimen | undefined {
  return bySlug.get(slug);
}

export const basisName: Record<RegimenBasis, string> = {
  label: "Approved label",
  trial: "Clinical trial regimen",
  study: "Published human study",
  cosmetic: "Cosmetic use level",
  none: "No published human dosing",
};
