import type { Metadata } from "next";
import { ReconCalculator } from "@/components/calc/ReconCalculator";

export const metadata: Metadata = {
  title: "Reconstitution calculator",
  description:
    "Convert vial fill, bacteriostatic water, and an intended amount into a U-100 syringe draw.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Reconstitution calculator
      </h1>
      <p className="mt-3 max-w-prose text-mute">
        Concentration is vial milligrams divided by water millilitres. The draw
        is the intended amount divided by that concentration. A U-100 insulin
        syringe is 100 units per millilitre.
      </p>
      <div className="mt-8">
        <ReconCalculator />
      </div>
      <p className="mt-6 text-sm text-mute">
        Open a compound sheet if you want these fields pre-filled from the
        catalog vial size.
      </p>
    </div>
  );
}
