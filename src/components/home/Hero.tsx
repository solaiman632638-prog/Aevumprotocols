"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";
import { Heartbeat } from "@/components/home/Heartbeat";
import { Readiness } from "@/components/home/Readiness";

/**
 * The headline drifts up and dims as the page moves under it, with the
 * heart-rate trace behind it travelling slower so the two separate. The
 * readiness panel beside it is the interactive half: pick a sport and the
 * sample athlete's day redraws.
 */
export function Hero({ compounds }: { compounds: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
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
          <Heartbeat />
          <motion.div
            style={{ y: sweepY }}
            className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(232,237,242,0.35),transparent)]"
          />
        </motion.div>

        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-14 px-4 py-28 sm:px-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-7">
            <p className="eyebrow">Peptides · Evidence · Performance</p>
            <h1 className="mt-6 font-display text-6xl font-light leading-[0.92] tracking-[-0.045em] sm:text-8xl">
              Peptides.
              <br />
              <span className="text-mute">Built for</span> performance.
            </h1>
            <p className="mt-8 max-w-md text-lg text-mute">
              {compounds} peptides and related compounds, with protocols and
              published dosing, ranked by the evidence. Log every pin beside your training and see what the
              research actually says about recovery, strength, and endurance.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/today" className="btn-primary">
                Start tracking
              </Link>
              <Link href="/peptides" className="btn-secondary">
                Browse peptides
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Readiness />
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
