import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MonitorBoard } from "@/components/wearables/MonitorBoard";

export const metadata: Metadata = {
  title: "Devices",
  description: "Optionally connect a heart rate monitor to fill in HRV, resting heart rate, and sleep.",
};

export default function MonitorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Devices</h1>
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
    </div>
  );
}
