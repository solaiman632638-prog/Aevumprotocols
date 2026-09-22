import type { Metadata } from "next";
import { TodayBoard } from "@/components/today/TodayBoard";
import { getEntry, worksheetFor } from "@/lib/data/library";
import { compoundsByGoal, type CompoundSource } from "@/lib/today/engine";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Daily recovery, sleep, and readiness from a thirty-second check-in or an optional device, with guidance for your goals.",
};

/** Only the monographs the engine can surface, trimmed to what the cards show. */
function compoundPool(): CompoundSource[] {
  const slugs = [...new Set(Object.values(compoundsByGoal).flat())];
  return slugs.flatMap((slug) => {
    const entry = getEntry(slug);
    if (!entry) return [];
    return [
      {
        slug: entry.slug,
        name: entry.name,
        legal: entry.legal,
        status: entry.status,
        approval: entry.approval,
        evidence: entry.evidence,
        researchScore: entry.researchScore,
        primaryUse: entry.primaryUse,
        effects: entry.effects,
        sideEffects: entry.sideEffects,
        boxedWarning: entry.boxedWarning,
        worksheet: worksheetFor(entry.slug),
      },
    ];
  });
}

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Daily readout</p>
      <h1 className="mt-3 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Today
      </h1>
      <p className="mt-4 max-w-2xl text-mute">
        Log how you slept, how you feel, and the peptides you took. Get
        recovery and sleep scores, protocol guidance for each peptide,
        interaction warnings, and injection-site tracking. Every
        recommendation shows the data behind it.
      </p>
      <p className="mt-4 max-w-2xl rounded-2xl border border-rule px-4 py-3 text-sm text-mute">
        Educational, not medical advice. Peptide guidance restates published
        protocols against what you log; it never goes above a protocol&apos;s
        maximum and is not a prescription. Confirm dosing and treatment
        decisions with a clinician.
      </p>
      <div className="mt-10">
        <TodayBoard pool={compoundPool()} />
      </div>
    </div>
  );
}
