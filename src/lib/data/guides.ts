import entries from "@/lib/data/guides.json";
import type { CategorySlug } from "@/lib/types";

/**
 * Full dosing protocols: titration, schedule, duration, and handling for 43
 * compounds. Compounds the NovaEvum catalog stocks also have a worksheet in
 * protocols.ts; the guide renders as an extra section on that page.
 */
export type GuideSection = { title: string; items: string[] };

export type Guide = {
  slug: string;
  name: string;
  category: CategorySlug;
  route: string;
  /** One-line summary for the register table. */
  typical: string;
  /** Pepipedia monograph in the library, when there is one. */
  librarySlug: string | null;
  /** Vial sizes offered, in mg. Empty for ready-to-use solutions. */
  vials: number[];
  /** Bacteriostatic water fills that suit the vial, in mL. */
  bac: number[];
  defaultVialMg: number;
  defaultWaterMl: number;
  startDoseMcg: number;
  /** Ready-to-use solutions: concentration and volume, nothing to mix. */
  readyMgPerMl?: number;
  readyMl?: number;
  important?: string;
  bacNote?: string;
  /** Extra mixing steps beyond the standard four. */
  recon: string[];
  sections: GuideSection[];
  dosing: string[];
  duration: string[];
  notes: string[];
  /** Storage lines beyond the standard ones. */
  storage: string[];
};

export const guides = entries as Guide[];

const bySlug = new Map(guides.map((guide) => [guide.slug, guide]));

export function getGuide(slug: string): Guide | undefined {
  return bySlug.get(slug);
}

/** A guide for a library monograph, preferring the one that shares its slug. */
export function guideForLibrary(librarySlug: string): Guide | undefined {
  return bySlug.get(librarySlug) ?? guides.find((guide) => guide.librarySlug === librarySlug);
}

export const standardMixing = [
  "Use bacteriostatic water as the diluent.",
  "Add the water slowly, letting it run down the inside wall of the vial rather than onto the powder.",
  "Swirl gently to mix, then leave it to dissolve. Do not shake.",
  "Give it a few minutes. The finished solution should be clear and colourless.",
];

export const standardStorage = [
  "Keep the powdered (lyophilized) vial in a cool, dark place. Refrigerate it for longer-term storage before mixing.",
  "Once reconstituted and refrigerated at 2–8 °C away from light, use the vial within 90 days.",
  "Do not freeze a reconstituted vial, and keep it away from heat and sunlight.",
  "If the solution turns cloudy, develops floating particles, or shows any other sign of degradation, stop using that vial.",
];
