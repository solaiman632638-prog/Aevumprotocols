import type { Metadata } from "next";
import { TrainTabs } from "@/components/train/TrainTabs";

export const metadata: Metadata = {
  title: "Training",
  description: "Log your lifts, see how you rank for your age and weight, and get a gym plan built around your weak points.",
};

export default function TrainPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Training</h1>
      <p className="mt-3 max-w-prose text-mute">
        Log what you lifted and watch it climb, see how you rank for your age and weight, and get a weekly plan built
        around how often you train and what needs the most work.
      </p>
      <div className="mt-8">
        <TrainTabs />
      </div>
    </div>
  );
}
