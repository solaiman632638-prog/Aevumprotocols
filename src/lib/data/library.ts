import entries from "@/lib/data/library.json";
import { getProtocol, protocols } from "@/lib/data/protocols";

/**
 * Every Pepipedia monograph (pepipedia.com/peptides), one row each.
 * Status, evidence, and side-effect fields are Pepipedia's; summary,
 * mechanism, and safety are paraphrased. No dosing — Pepipedia publishes none.
 */
export type LibraryEntry = {
  slug: string;
  name: string;
  synonyms: string[];
  system: SystemSlug;
  pepipediaCategory: string;
  effects: string[];
  researchScore: number;
  popularity: number;
  legal: string;
  status: StatusSlug;
  approval: string;
  evidence: string;
  primaryUse: string;
  indication: string;
  origin: string;
  boxedWarning?: string;
  sideEffects: string[];
  summary: string;
  mechanism: string;
  safety: string;
  isNew: boolean;
  /** Hash of Pepipedia's source prose; /refresh-library uses it to spot edits. */
  sourceHash: string;
};

/** Pepipedia's 17 categories folded into nine body systems. */
export const systems = [
  { slug: "brain", name: "Brain & nerves" },
  { slug: "digestive", name: "Digestive & liver" },
  { slug: "metabolic", name: "Metabolic & weight" },
  { slug: "skin", name: "Skin & hair" },
  { slug: "immune", name: "Immune" },
  { slug: "musculoskeletal", name: "Muscle, bone & joint" },
  { slug: "reproductive", name: "Reproductive" },
  { slug: "cardiovascular", name: "Heart, blood & kidney" },
  { slug: "oncology-imaging", name: "Oncology, infection & imaging" },
] as const;

export type SystemSlug = (typeof systems)[number]["slug"];

export const statuses = [
  { slug: "approved", name: "Approved / prescription" },
  { slug: "investigational", name: "Investigational" },
  { slug: "research", name: "Research chemical" },
  { slug: "other", name: "Cosmetic / other" },
] as const;

export type StatusSlug = (typeof statuses)[number]["slug"];

export const library = (entries as LibraryEntry[]).toSorted((a, b) =>
  a.name.localeCompare(b.name),
);

/** The slice of an entry the client-side index needs to filter and sort. */
export type LibraryRow = Pick<
  LibraryEntry,
  | "slug"
  | "name"
  | "synonyms"
  | "system"
  | "status"
  | "effects"
  | "primaryUse"
  | "indication"
  | "researchScore"
  | "popularity"
>;

export function toRow(entry: LibraryEntry): LibraryRow {
  return {
    slug: entry.slug,
    name: entry.name,
    synonyms: entry.synonyms,
    system: entry.system,
    status: entry.status,
    effects: entry.effects,
    primaryUse: entry.primaryUse,
    indication: entry.indication,
    researchScore: entry.researchScore,
    popularity: entry.popularity,
  };
}

const bySlug = new Map(library.map((entry) => [entry.slug, entry]));

export function getEntry(slug: string): LibraryEntry | undefined {
  return bySlug.get(slug);
}

export function systemName(slug: string): string {
  return systems.find((system) => system.slug === slug)?.name ?? slug;
}

export function statusName(slug: string): string {
  return statuses.find((status) => status.slug === slug)?.name ?? slug;
}

/** Worksheet slug for this monograph, when the NovaEvum catalog carries it. */
export function worksheetFor(slug: string): string | undefined {
  return (
    getProtocol(slug)?.slug ??
    protocols.find((protocol) => protocol.pepipediaSlug === slug)?.slug
  );
}
