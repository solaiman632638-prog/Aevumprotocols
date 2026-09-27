"use client";

import { useRef } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";

const tiers = [
  {
    name: "Best evidenced",
    body: "Approved human dosing, a trial base behind it, and a characterised side-effect profile.",
  },
  {
    name: "Reasonable evidence",
    body: "Approved for something, or carried by human trials, with hazards worth weighing.",
  },
  {
    name: "Limited evidence",
    body: "Widely used, mostly on animal data. No established human dosing exists.",
  },
  {
    name: "Most uncertain",
    body: "No established dosing and known hazards. The honest answer is that little is known.",
  },
];

/** The heading holds while the four tiers move through it. */
export function Tiers() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rule = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <MotionConfig reducedMotion="user">
      <section ref={ref} className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow">Evidence ranking</p>
              <h2 className="mt-5 font-display text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                Four tiers.
                <br />
                No guesswork.
              </h2>
              <p className="mt-6 max-w-sm text-mute">
                Every compound is ranked on how much human evidence stands
                behind it and what hazards are known. Guidance arrives in that
                order, best evidenced first.
              </p>
              <div className="mt-8 h-px w-full max-w-sm bg-rule">
                <motion.div style={{ width: rule }} className="h-px bg-ink" />
              </div>
            </div>
          </div>

          <ol className="lg:col-span-7">
            {tiers.map((tier, index) => (
              <TierRow key={tier.name} index={index} name={tier.name} body={tier.body} />
            ))}
          </ol>
        </div>
      </section>
    </MotionConfig>
  );
}

function TierRow({ index, name, body }: { index: number; name: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [28, 0]);

  return (
    <motion.li ref={ref} style={{ opacity, x }} className="border-t border-rule py-10 last:border-b">
      <div className="flex items-baseline gap-5">
        <span className="font-mono text-xs text-dim">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3 className="font-display text-3xl font-light tracking-[-0.02em] sm:text-4xl">{name}</h3>
          <p className="mt-3 max-w-md text-mute">{body}</p>
        </div>
      </div>
    </motion.li>
  );
}
