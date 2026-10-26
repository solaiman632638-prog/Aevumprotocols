import type { Metadata } from "next";
import { SupplementIndex } from "@/components/supplements/SupplementIndex";
import { supplements } from "@/lib/data/supplements";

export const metadata: Metadata = {
  title: "Supplements",
  description:
    "What the main supplements actually do, how strong the evidence is, and how much to take for your goals and body weight.",
};

export default function SupplementsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Evidence · Amounts · Safety</p>
      <h1 className="mt-3 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Supplements</h1>
      <p className="mt-4 max-w-2xl text-mute">
        {supplements.length} of the supplements people ask about most. Each one covers what it does, how it works, how
        good the evidence is, and how much to take, worked out for your body weight when you have a Today profile.
        Educational only. Check with your doctor or pharmacist if you take medicine or have a health condition.
      </p>
      <div className="mt-8">
        <SupplementIndex />
      </div>
    </div>
  );
}
