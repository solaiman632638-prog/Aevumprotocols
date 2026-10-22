"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";

export type GoalCompound = {
  slug: string;
  name: string;
  status: string;
  statusLabel: string;
  score?: number;
  primaryUse: string;
};

export type Goal = {
  key: string;
  label: string;
  blurb: string;
  compounds: GoalCompound[];
};

/**
 * Pick a training goal, see what the register holds for it. Educational only:
 * evidence and research status, never an amount.
 */
export function GoalExplorer({ goals }: { goals: Goal[] }) {
  const [active, setActive] = useState(goals[0].key);
  const goal = goals.find((item) => item.key === active) ?? goals[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-12 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]" role="tablist" aria-label="Training goal">
        {goals.map((item) => {
          const selected = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="goal-panel"
              onClick={() => setActive(item.key)}
              className={`relative shrink-0 rounded-2xl border px-5 py-3 text-sm transition-colors ${
                selected ? "border-ink text-on-accent" : "border-rule text-mute hover:border-mute hover:text-ink"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="goal-pill"
                  className="absolute inset-0 -z-0 rounded-2xl bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div id="goal-panel" role="tabpanel" className="mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={goal.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="max-w-xl text-lg text-mute">{goal.blurb}</p>
            <ul className="mt-8 grid gap-px overflow-hidden rounded-3xl bg-rule sm:grid-cols-2 lg:grid-cols-4">
              {goal.compounds.map((compound, index) => (
                <motion.li
                  key={compound.slug}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-paper"
                >
                  <Link
                    href={`/peptides/${compound.slug}`}
                    className="group flex h-full min-h-60 flex-col justify-between bg-sheet p-6 transition-colors hover:bg-panel lg:p-7"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-dim">
                        {compound.statusLabel}
                      </span>
                      <span aria-hidden className="text-dim transition-transform group-hover:translate-x-1 group-hover:text-ink">
                        →
                      </span>
                    </div>
                    <div className="mt-8">
                      <h3 className="font-display text-2xl font-light tracking-[-0.02em]">{shortName(compound.name)}</h3>
                      <p className="mt-2 text-sm text-mute">{compound.primaryUse}</p>
                      {compound.score !== undefined && (
                        <div className="mt-5">
                          <div className="flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-[0.14em] text-dim">
                            <span>Research score</span>
                            <span className="text-ink">{compound.score}</span>
                          </div>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-rule">
                            <motion.div
                              className="h-full rounded-full bg-ink"
                              initial={{ width: 0 }}
                              animate={{ width: `${compound.score}%` }}
                              transition={{ delay: 0.15 + 0.06 * index, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

/** "Semaglutide (Ozempic, Rybelsus, Wegovy)" reads as "Semaglutide" on a card. */
function shortName(name: string) {
  return name.replace(/\s*\(.*\)\s*$/, "");
}
