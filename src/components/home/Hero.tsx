"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";

/**
 * The headline drifts up and dims as the page moves under it, with the
 * measurement grid behind it travelling slower so the two separate.
 */
export function Hero({ compounds }: { compounds: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1]);
  const sweepY = useTransform(scrollYProgress, [0, 1], ["0vh", "92vh"]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <MotionConfig reducedMotion="user">
      <section ref={ref} className="relative isolate min-h-[92vh] overflow-hidden">
        <motion.div
          aria-hidden
          style={{ y: gridY, opacity: gridOpacity }}
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(232,237,242,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,237,242,0.05) 1px, transparent 1px)",
              backgroundSize: "6rem 6rem",
              maskImage: "radial-gradient(ellipse 75% 60% at 50% 35%, #000 30%, transparent 78%)",
            }}
          />
          <motion.div
            style={{ y: sweepY }}
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(232,237,242,0.35),transparent)]"
          />
        </motion.div>

        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity, scale: headlineScale }}
          className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 py-28 sm:px-6"
        >
          <p className="eyebrow">Protocols · Evidence · Vial math</p>
          <h1 className="mt-6 font-display text-6xl font-light leading-[0.92] tracking-[-0.045em] sm:text-8xl lg:text-9xl">
            Peptides.
            <br />
            Reimagined.
          </h1>
          <p className="mt-8 max-w-md text-lg text-mute">
            {compounds} compounds, every one with a full protocol. Log what you
            took, see what the evidence actually says, and track every pin.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/today" className="btn-primary">
              Start tracking
            </Link>
            <Link href="/peptides" className="btn-secondary">
              Browse compounds
            </Link>
          </div>
        </motion.div>

        <motion.p
          style={{ opacity: cueOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-8 text-center font-mono text-[0.65rem] uppercase tracking-[0.2em] text-dim"
        >
          Scroll
        </motion.p>
      </section>
    </MotionConfig>
  );
}
