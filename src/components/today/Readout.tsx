"use client";

import { motion } from "motion/react";
import type { Score } from "@/lib/today/types";

const ease = [0.16, 1, 0.3, 1] as const;

/** Identity colour per metric. A caution always reads as warn, whatever the metric. */
export function scoreColour(score: Score): string {
  if (score.tone === "caution") return "var(--color-warn)";
  if (score.tone === "missing") return "var(--color-dim)";
  if (score.label.startsWith("Recovery")) return "var(--color-recovery)";
  if (score.label.startsWith("Sleep")) return "var(--color-sleep)";
  if (score.label.startsWith("Cardiovascular")) return "var(--color-strain)";
  return "var(--color-ink)";
}

/**
 * A row of instrument ticks lit up to the value. The ticks rise in sequence on
 * first paint; that cascade is the one motion moment on the screen.
 */
export function TickMeter({
  value,
  colour,
  label,
  ticks = 32,
  className = "h-9",
}: {
  value: number;
  colour: string;
  label: string;
  ticks?: number;
  className?: string;
}) {
  const lit = Math.round((value / 100) * ticks);
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
      className={`flex items-end gap-[3px] ${className}`}
    >
      {Array.from({ length: ticks }, (_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="h-full flex-1 origin-bottom rounded-[2px]"
          style={{ background: i < lit ? colour : "var(--color-rule)" }}
          initial={{ scaleY: 0.25, opacity: 0.4 }}
          animate={{ scaleY: i < lit ? 1 : 0.45, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.016, duration: 0.6, ease }}
        />
      ))}
    </div>
  );
}

/** The big dot-matrix figure with its /100. */
export function Figure({ score, size }: { score: Score; size: "lead" | "compact" }) {
  const colour = scoreColour(score);
  return (
    <p
      className={`flex items-baseline gap-1.5 tabular-nums leading-none ${size === "lead" ? "text-[6.5rem] sm:text-[8rem]" : "text-6xl"}`}
      style={{ fontFamily: "var(--font-readout)", color: colour }}
    >
      {score.numeric ?? "—"}
      <span className="font-mono text-sm tracking-normal text-mute">/100</span>
    </p>
  );
}
