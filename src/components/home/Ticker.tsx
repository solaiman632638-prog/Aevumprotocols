"use client";

import { useRef } from "react";
import { motion, MotionConfig, useScroll, useTransform } from "motion/react";

/** Compound names sliding past as the page scrolls, like a readout. */
export function Ticker({ names }: { names: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-32%"]);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className="overflow-hidden border-y border-rule py-5">
        <motion.ul style={{ x }} className="flex w-max items-center gap-10 font-mono text-xs uppercase tracking-[0.18em] text-dim">
          {[...names, ...names].map((name, index) => (
            <li key={`${name}-${index}`} className="flex items-center gap-10 whitespace-nowrap">
              <span>{name}</span>
              <span aria-hidden className="text-rule">
                /
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </MotionConfig>
  );
}
