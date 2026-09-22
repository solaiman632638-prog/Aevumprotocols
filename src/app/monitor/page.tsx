import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MonitorBoard } from "@/components/wearables/MonitorBoard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Devices",
  description: "Heart rate monitor sync is coming soon. Until then, use the daily check-in.",
};

export default function MonitorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Devices</h1>
      {site.devicesEnabled ? (
        <>
          <p className="mt-3 max-w-prose text-mute">
            Optional. Aevum works fully from a thirty-second{" "}
            <Link href="/today" className="text-pine-deep underline decoration-rule underline-offset-2">
              manual check-in
            </Link>
            . If you already wear a heart rate monitor, connect it here and your
            HRV, resting heart rate, and sleep fill in automatically.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-mute">Loading…</p>}>
              <MonitorBoard />
            </Suspense>
          </div>
        </>
      ) : (
        <section className="mt-8 rounded-3xl border border-rule bg-sheet p-6 sm:p-8">
          <p className="eyebrow">Coming soon</p>
          <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.03em]">Heart rate monitor sync</h2>
          <p className="mt-3 max-w-prose text-mute">
            Soon you&apos;ll be able to connect a heart rate monitor so your HRV,
            resting heart rate, and sleep fill in on their own. Until then, the
            thirty-second check-in gives you the same daily scores, and you can
            type in your resting heart rate or HRV yourself if you track them.
          </p>
          <Link href="/today" className="btn-primary mt-6">
            Go to today&apos;s check-in
          </Link>
        </section>
      )}
    </div>
  );
}
