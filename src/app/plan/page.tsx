import type { Metadata } from "next";
import { PlanWizard } from "@/components/plan/PlanWizard";

export const metadata: Metadata = {
  title: "Plan",
  description: "Match catalog peptides and supplements to your goals and risk band.",
};

export default function PlanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Build a worksheet
      </h1>
      <p className="mt-3 max-w-prose text-mute">
        Goals, risk, and a few flags. The matcher returns exact catalog vials,
        reconstitution math, and a supplement list. It is not a prescription.
      </p>
      <div className="mt-8">
        <PlanWizard />
      </div>
    </div>
  );
}
