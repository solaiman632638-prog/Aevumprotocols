import type { Metadata } from "next";
import { LibraryIndex } from "@/components/library/LibraryIndex";
import { library, toRow, worksheetFor } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "Peptide library",
  description:
    "173 peptides: mechanism, evidence, regulatory status, and safety.",
};

export default function PeptidesPage() {
  const worksheets = library
    .filter((entry) => worksheetFor(entry.slug))
    .map((entry) => entry.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Peptide library
      </h1>
      <p className="mt-3 max-w-2xl text-mute">
        All {library.length} peptides, from research chemicals to approved drugs. Reference only — no
        doses. Compounds on the NovaEvum catalog are listed first and link to
        their worksheet.
      </p>
      <div className="mt-8">
        <LibraryIndex entries={library.map(toRow)} worksheets={worksheets} />
      </div>
    </div>
  );
}
