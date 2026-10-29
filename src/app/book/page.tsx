import type { Metadata } from "next";
import { BookCall } from "@/components/booking/BookCall";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a call with a doctor or peptide expert who works with Aevum.",
};

export default function BookPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">
      <h1 className="font-display text-[2.6rem] font-light leading-[1] tracking-[-0.035em] sm:text-6xl">Book a call</h1>
      <p className="mt-3 max-w-xl text-mute">
        Talk through your goals, a protocol, or side effects with a doctor or peptide expert who works with Aevum.
      </p>
      <div className="mt-8 sm:mt-10">
        <BookCall />
      </div>
      <p className="mt-16 max-w-2xl text-xs leading-relaxed text-mute">
        Not for emergencies. If you have severe or worsening symptoms, call emergency services or go to urgent care.
      </p>
    </div>
  );
}
