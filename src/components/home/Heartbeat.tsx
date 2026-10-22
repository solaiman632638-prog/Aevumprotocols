"use client";

import { motion, useReducedMotion } from "motion/react";

const WIDTH = 1600;
const HEIGHT = 200;
const BASE = 120;
const BEAT = 320;

/** One beat: flat, P bump, the QRS spike, T bump, flat again. */
function beat(x: number) {
  return [
    `L ${x + 70} ${BASE}`,
    `Q ${x + 85} ${BASE - 12} ${x + 100} ${BASE}`,
    `L ${x + 120} ${BASE}`,
    `L ${x + 128} ${BASE + 14}`,
    `L ${x + 140} ${BASE - 95}`,
    `L ${x + 152} ${BASE + 30}`,
    `L ${x + 162} ${BASE}`,
    `L ${x + 195} ${BASE}`,
    `Q ${x + 220} ${BASE - 26} ${x + 245} ${BASE}`,
    `L ${x + BEAT} ${BASE}`,
  ].join(" ");
}

const trace = `M 0 ${BASE} ${Array.from({ length: WIDTH / BEAT }, (_, i) => beat(i * BEAT)).join(" ")}`;

const paper =
  "linear-gradient(to right, rgba(232,237,242,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,237,242,0.04) 1px, transparent 1px)";
const fade = "radial-gradient(ellipse 80% 65% at 50% 50%, #000 35%, transparent 85%)";

/**
 * A heart-rate trace across the hero, on faint monitor paper. The dim line
 * holds still; a bright pulse runs along it at a resting sixty beats a
 * minute. Reduced motion keeps the line and drops the pulse.
 */
export function Heartbeat() {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <div className="absolute inset-0" style={{ backgroundImage: paper, backgroundSize: "3rem 3rem" }} />

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[58%] h-48 w-full -translate-y-1/2 sm:h-64"
      >
        <path d={trace} fill="none" stroke="rgba(232,237,242,0.09)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {reduced ? null : (
          <>
            <motion.path
              d={trace}
              fill="none"
              stroke="var(--color-recovery)"
              strokeWidth="6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="0.08 0.92"
              animate={{ strokeDashoffset: [0.08, -0.92] }}
              transition={{ duration: WIDTH / BEAT, ease: "linear", repeat: Infinity }}
              style={{ filter: "blur(6px)", opacity: 0.45 }}
            />
            <motion.path
              d={trace}
              fill="none"
              stroke="var(--color-recovery)"
              strokeWidth="1.75"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              pathLength={1}
              strokeDasharray="0.08 0.92"
              animate={{ strokeDashoffset: [0.08, -0.92] }}
              transition={{ duration: WIDTH / BEAT, ease: "linear", repeat: Infinity }}
            />
          </>
        )}
      </svg>
    </div>
  );
}
