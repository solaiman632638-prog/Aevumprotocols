import type { Metadata } from "next";
import { TodayBoard } from "@/components/today/TodayBoard";
import { compoundPool } from "@/lib/today/pool";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Daily recovery, sleep, and readiness from a thirty-second check-in or an optional device, with guidance for your goals.",
};

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
        Not medical advice. Peptides are picked from your goals and screened
        against your health profile, with the starting amount each published
        protocol uses. Most are research compounds with limited human data, so
        no amount is proven safe. Start low, and stop and see a clinician if
        side effects appear.
      </p>
      <div className="mt-10">
        <TodayBoard pool={compoundPool()} />
      </div>
    </div>
  );
}
