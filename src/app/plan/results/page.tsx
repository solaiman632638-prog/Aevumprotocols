import type { Metadata } from "next";
import { PlanResults } from "@/components/plan/PlanResults";

export const metadata: Metadata = {
  title: "Your worksheet",
};

export default function PlanResultsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PlanResults />
    </div>
  );
}
