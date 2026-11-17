"use client";

import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { Readiness } from "@/components/home/Readiness";

const ease = [0.16, 1, 0.3, 1] as const;

const promises = ["Free, no card", "Evidence-ranked", "Works on any phone"];

/**
 * A dark rounded stage with a big plain-spoken headline, and the live
 * readiness card floating beside it as the product shot.
 */
export function Hero({ compounds }: { compounds: number }) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="stage overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-10 sm:py-20 lg:min-h-[80vh] lg:grid-cols-12 lg:gap-10 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="lg:col-span-7"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm text-white/75 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-glow" />
                {compounds} peptides, ranked by the evidence
              </p>
              <h1 className="mt-6 font-display text-[2.9rem] font-normal leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Know what your peptides are really doing.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-white/70 sm:mt-8">
                Log every pin beside your training, rotate your sites, and see
                what the research actually says. One free app for recovery,
                strength and endurance.
              </p>
              <div className="mt-8 grid gap-3 sm:mt-10 sm:flex sm:flex-wrap">
                <Link href="/today" className="btn-light">
                  Start free
                </Link>
                <Link
                  href="/peptides"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-white no-underline hover:border-white"
                >
                  Browse peptides
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                {promises.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-4 w-4 text-[#4fd1a5]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M3 8.5 6.5 12 13 4.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
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
              <div className="rounded-3xl bg-white text-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
                <Readiness />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
