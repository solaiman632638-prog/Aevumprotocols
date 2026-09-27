"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

/**
 * A figure that counts up once, the first time it is scrolled into view.
 * Non-numeric values (like "30s") just appear.
 */
export function Figure({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const target = Number(value.replace(/[^0-9.]/g, ""));
  const countable = Number.isFinite(target) && target > 0;
  const [shown, setShown] = useState(countable ? 0 : target);

  useEffect(() => {
    if (!inView || !countable) return;
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, countable, target]);

  const suffix = value.replace(/[0-9.]/g, "");

  return (
    <div className="border-t border-rule py-10 pr-4">
      <dt className="eyebrow">{label}</dt>
      <dd
        ref={ref as React.Ref<HTMLElement>}
        className="mt-3 text-6xl font-light tracking-[-0.02em] tabular-nums sm:text-7xl"
        style={{ fontFamily: "var(--font-readout)" }}
      >
        {countable ? shown : ""}
        {suffix}
      </dd>
    </div>
  );
}
