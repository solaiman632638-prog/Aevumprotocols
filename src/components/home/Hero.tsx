"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { Readiness } from "@/components/home/Readiness";

const ease = [0.16, 1, 0.3, 1] as const;

const promises = ["Free, no card", "Evidence-ranked", "Works on any phone"];

/**
 * Warm, bright opening: a soft glow behind a big plain-spoken headline, and
 * the live readiness card floating beside it as the product shot.
 */
export function Hero({ compounds }: { compounds: number }) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-glow/25 blur-3xl" />
          <div className="absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#ffc79a]/40 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[22rem] w-[22rem] rounded-full bg-[#c9c4ff]/30 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
            className="lg:col-span-7"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-rule bg-sheet/70 px-3.5 py-1.5 text-sm text-mute backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-glow" />
              {compounds} peptides, ranked by the evidence
            </p>
            <h1 className="mt-6 font-display text-[3.2rem] font-normal leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]">
              Know what your peptides are really doing.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-mute sm:mt-8 sm:text-xl">
              Log every pin beside your training, rotate your sites, and see what
              the research actually says. One free app for recovery, strength and
              endurance.
            </p>
            <div className="mt-8 grid gap-3 sm:mt-10 sm:flex sm:flex-wrap">
              <Link href="/today" className="btn-primary">
                Start free
              </Link>
              <Link href="/peptides" className="btn-secondary">
                Browse peptides
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mute">
              {promises.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 text-recovery" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="lg:col-span-5"
          >
            <div className="rounded-3xl shadow-[0_30px_80px_-30px_rgba(60,40,20,0.35)]">
              <Readiness />
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
