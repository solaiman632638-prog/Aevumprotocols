"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const GRID_LINE = "rgba(232,237,242,0.05)";
const GRID_LIT = "rgba(232,237,242,0.34)";

function grid(colour: string) {
  return `linear-gradient(to right, ${colour} 1px, transparent 1px), linear-gradient(to bottom, ${colour} 1px, transparent 1px)`;
}

/**
 * A measurement grid that answers the pointer: it lights up under the cursor,
 * a crosshair tracks it, and the field drifts against the movement so it
 * reads as depth rather than as a sticker.
 *
 * Pointer position drives motion values, never React state, so moving the
 * mouse never re-renders the tree. Touch devices and anyone who asked for
 * reduced motion get the plain grid.
 */
export function ReactiveGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Eased, so the light trails the cursor rather than snapping to it.
  const sx = useSpring(px, { stiffness: 140, damping: 26, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 140, damping: 26, mass: 0.6 });
  const left = useTransform(sx, (value) => `${value * 100}%`);
  const top = useTransform(sy, (value) => `${value * 100}%`);

  // Slower, shorter travel for the grid itself: parallax against the pointer.
  const dx = useSpring(px, { stiffness: 50, damping: 22 });
  const dy = useSpring(py, { stiffness: 50, damping: 22 });
  const gridX = useTransform(dx, [0, 1], [14, -14]);
  const gridY = useTransform(dy, [0, 1], [10, -10]);

  const glow = useMotionTemplate`radial-gradient(22rem 22rem at ${left} ${top}, rgba(232,237,242,0.14), transparent 70%)`;
  const lit = useMotionTemplate`radial-gradient(24rem 24rem at ${left} ${top}, #000 0%, transparent 70%)`;

  useEffect(() => {
    if (reduced) return;
    const node = ref.current;
    if (!node) return;
    // Hover-capable pointers only; a finger has no resting position.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    // The grid sits under a pointer-events-none layer, so it can never be
    // the event target. Listen on the window and measure against its box.
    let box = node.getBoundingClientRect();
    const remeasure = () => {
      box = node.getBoundingClientRect();
    };

    const onMove = (event: PointerEvent) => {
      const x = (event.clientX - box.left) / box.width;
      const y = (event.clientY - box.top) / box.height;
      // Outside the hero, drift back to centre rather than tracking blind.
      if (x < -0.15 || x > 1.15 || y < -0.15 || y > 1.15) {
        px.set(0.5);
        py.set(0.5);
        return;
      }
      px.set(Math.min(1, Math.max(0, x)));
      py.set(Math.min(1, Math.max(0, y)));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure);
    };
  }, [px, py, reduced]);

  const fade = "radial-gradient(ellipse 78% 62% at 50% 38%, #000 30%, transparent 80%)";

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-10"
        style={{
          x: reduced ? 0 : gridX,
          y: reduced ? 0 : gridY,
          backgroundImage: grid(GRID_LINE),
          backgroundSize: "6rem 6rem",
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      />

      {reduced ? null : (
        <>
          <motion.div
            className="absolute -inset-10"
            style={{
              x: gridX,
              y: gridY,
              backgroundImage: grid(GRID_LIT),
              backgroundSize: "6rem 6rem",
              maskImage: lit,
              WebkitMaskImage: lit,
            }}
          />
          <motion.div className="absolute inset-0" style={{ background: glow }} />
          <motion.div
            className="absolute inset-x-0 h-px bg-[linear-gradient(to_right,transparent,rgba(232,237,242,0.2),transparent)]"
            style={{ top }}
          />
          <motion.div
            className="absolute inset-y-0 w-px bg-[linear-gradient(to_bottom,transparent,rgba(232,237,242,0.2),transparent)]"
            style={{ left }}
          />
        </>
      )}
    </div>
  );
}
