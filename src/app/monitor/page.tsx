import type { Metadata } from "next";
import Link from "next/link";
import { MonitorBoard } from "@/components/wearables/MonitorBoard";

export const metadata: Metadata = {
  title: "Monitor",
  description: "Connect Whoop or Google Fit and overlay recovery on your worksheet.",
};

export default function MonitorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Monitor</h1>
      <p className="mt-3 max-w-prose text-mute">
        A hard recovery day means skip extra pulses, not add water. Connect Whoop
        or Google Fit when you have API keys; until then the demo feed is enough
        to learn the loop.
      </p>
      <p className="mt-3 max-w-prose text-mute">
        No wearable?{" "}
        <Link href="/today" className="text-pine-deep underline decoration-rule underline-offset-2">
          Use a manual check-in on Today
        </Link>{" "}
        and get the same daily scores.
      </p>
      <div className="mt-8">
        <MonitorBoard />
      </div>
    </div>
  );
}
