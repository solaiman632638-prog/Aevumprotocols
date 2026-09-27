import { getGuide, guides, type Guide } from "@/lib/data/guides";
import { getEntry, library, statusName, systemName, type LibraryEntry, type StatusSlug, type SystemSlug } from "@/lib/data/library";
import { getProtocol, protocols } from "@/lib/data/protocols";
import type { CategorySlug, Protocol } from "@/lib/types";

/**
 * One register for everything: research monographs, dosing protocols, and the
 * NovaEvum vial worksheets, keyed by a single slug per compound.
 */
export type CompoundRow = {
  slug: string;
  name: string;
  system: SystemSlug;
  systemLabel: string;
  status: StatusSlug;
  statusLabel: string;
  primaryUse: string;
  score?: number;
  hasProtocol: boolean;
  stocked: boolean;
  /** Extra text the search box matches. */
  keywords: string;
};

export type CompoundPage = {
  canonical: string;
  entry?: LibraryEntry;
  guide?: Guide;
  worksheet?: Protocol;
};

/** Protocol categories mapped onto the library's body systems. */
const categorySystem: Record<CategorySlug, SystemSlug> = {
  "glp-1-metabolic": "metabolic",
  "healing-recovery": "musculoskeletal",
  "growth-hormone": "metabolic",
  "skin-hair-aesthetics": "skin",
  "longevity-cellular": "metabolic",
  "brain-cognitive": "brain",
};

/** The protocol that belongs to a monograph: same slug first, then a linked one. */
function primaryGuide(slug: string): Guide | undefined {
  return getGuide(slug) ?? guides.find((guide) => guide.librarySlug === slug);
}

function worksheetFor(slug: string): Protocol | undefined {
  return getProtocol(slug) ?? protocols.find((protocol) => protocol.pepipediaSlug === slug);
}

/** Protocols with no monograph of their own: blends and variants. */
const extraGuides = guides.filter((guide) => {
  if (getEntry(guide.slug)) return false;
  const claimed = guide.librarySlug ? primaryGuide(guide.librarySlug) : undefined;
  return claimed?.slug !== guide.slug;
});

export const compoundRows: CompoundRow[] = [
  ...library.map((entry) => {
    const guide = primaryGuide(entry.slug);
    return {
      slug: entry.slug,
      name: entry.name,
      system: entry.system,
      systemLabel: systemName(entry.system),
      status: entry.status,
      statusLabel: statusName(entry.status),
      primaryUse: entry.primaryUse,
      score: entry.researchScore,
      hasProtocol: Boolean(guide),
      stocked: Boolean(worksheetFor(entry.slug)),
      keywords: [...entry.synonyms, entry.indication, ...entry.effects, guide?.typical ?? ""].join(" "),
    };
  }),
  ...extraGuides.map((guide) => {
    const entry = guide.librarySlug ? getEntry(guide.librarySlug) : undefined;
    return {
      slug: guide.slug,
      name: guide.name,
      system: categorySystem[guide.category],
      systemLabel: systemName(categorySystem[guide.category]),
      status: entry?.status ?? ("research" as StatusSlug),
      statusLabel: statusName(entry?.status ?? "research"),
      primaryUse: entry?.primaryUse || guide.typical,
      score: entry?.researchScore,
      hasProtocol: true,
      stocked: Boolean(worksheetFor(guide.slug)),
      keywords: [...(entry?.synonyms ?? []), guide.typical, ...(entry?.effects ?? [])].join(" "),
    };
  }),
].sort((a, b) => a.name.localeCompare(b.name));

/** Every URL the section answers on, including protocol-slug aliases. */
export const compoundSlugs: string[] = [...new Set([...library.map((entry) => entry.slug), ...guides.map((guide) => guide.slug)])];

export function compoundPage(slug: string): CompoundPage | null {
  const entry = getEntry(slug);
  if (entry) {
    return { canonical: entry.slug, entry, guide: primaryGuide(entry.slug), worksheet: worksheetFor(entry.slug) };
  }
  const guide = getGuide(slug);
  if (!guide) return null;
  const linked = guide.librarySlug ? getEntry(guide.librarySlug) : undefined;
  const claimed = guide.librarySlug ? primaryGuide(guide.librarySlug) : undefined;
  return {
    canonical: claimed?.slug === guide.slug && linked ? linked.slug : guide.slug,
    entry: linked,
    guide,
    worksheet: worksheetFor(guide.slug),
  };
}

export const counts = {
  total: compoundRows.length,
  protocols: compoundRows.filter((row) => row.hasProtocol).length,
  stocked: compoundRows.filter((row) => row.stocked).length,
};
