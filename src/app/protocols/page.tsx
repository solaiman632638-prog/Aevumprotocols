import type { Metadata } from "next";
import { ProtocolIndex, type RegisterRow } from "@/components/protocols/ProtocolIndex";
import { guides } from "@/lib/data/guides";
import { getEntry } from "@/lib/data/library";
import { protocols } from "@/lib/data/protocols";

export const metadata: Metadata = {
  title: "Protocol register",
  description:
    "Dosing protocols, reconstitution, and storage for every compound, with worksheets for the NovaEvum catalog.",
};

function rows(): RegisterRow[] {
  const stocked: RegisterRow[] = protocols.map((protocol) => ({
    slug: protocol.slug,
    name: protocol.name,
    category: protocol.category,
    amount: protocol.doses[0]?.amount ?? "—",
    route: protocol.route,
    score: protocol.researchScore,
    stocked: true,
    blend: protocol.form === "blend",
    keywords: [...protocol.synonyms, protocol.primaryUse, protocol.summary, ...(protocol.effects ?? [])].join(" "),
  }));
  const covered = new Set(stocked.map((row) => row.slug));
  const extra: RegisterRow[] = guides
    .filter((guide) => !covered.has(guide.slug))
    .map((guide) => {
      const entry = guide.librarySlug ? getEntry(guide.librarySlug) : undefined;
      return {
        slug: guide.slug,
        name: guide.name,
        category: guide.category,
        amount: guide.typical,
        route: guide.route,
        score: entry?.researchScore,
        stocked: false,
        blend: /blend/i.test(guide.name),
        keywords: [...(entry?.synonyms ?? []), entry?.primaryUse, ...(entry?.effects ?? [])].join(" "),
      };
    });
  return [...stocked, ...extra];
}

export default function ProtocolsPage() {
  const all = rows();
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Protocol register
      </h1>
      <p className="mt-3 max-w-2xl text-mute">
        {all.length} protocols: reconstitution, titration, schedule, and
        storage. The {protocols.length} NovaEvum catalog compounds come first
        and carry a vial worksheet. Blends are listed as a single vial; you
        cannot split the ratio.
      </p>
      <div className="mt-8">
        <ProtocolIndex protocols={all} />
      </div>
    </div>
  );
}
