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
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
      <TodayBoard pool={compoundPool()} />
      <p className="mt-16 max-w-2xl text-xs leading-relaxed text-mute">
        Not medical advice. Peptides are picked from your goals and screened
        against your health profile, with the starting amount each published
        protocol uses. Most are research compounds with limited human data, so
        no amount is proven safe. Start low, and stop and see a clinician if
        side effects appear.
      </p>
    </div>
  );
}
