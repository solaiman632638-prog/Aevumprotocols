import type { Metadata } from "next";
import { LibraryIndex } from "@/components/library/LibraryIndex";
import { compoundRows, counts } from "@/lib/data/compounds";

export const metadata: Metadata = {
  title: "Compounds",
  description:
    "Every compound in one place: research evidence, dosing protocols, reconstitution math, and regulatory status.",
};

export default function CompoundsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Research · Protocols · Vial math</p>
      <h1 className="mt-3 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Compounds
      </h1>
      <p className="mt-4 max-w-2xl text-mute">
        {counts.total} compounds, {counts.protocols} of them with a full dosing
        protocol, and {counts.stocked} with a NovaEvum vial worksheet and
        calculator. Each page holds the evidence, the risks, the protocol, and
        the syringe math together.
      </p>
      <div className="mt-8">
        <LibraryIndex rows={compoundRows} />
      </div>
    </div>
  );
}
