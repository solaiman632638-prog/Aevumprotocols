"use client";

import { useEffect, useRef, useState } from "react";

export type TrendPoint = { date: string; value: number | null };

type Props = {
  title: string;
  /** Appended to values in labels and the tooltip, e.g. "h" or "/100". */
  unit: string;
  points: TrendPoint[];
  kind: "line" | "bar";
  color: string;
  yMin: number;
  yMax: number;
  reference?: { value: number; label: string };
  format?: (value: number) => string;
};

const HEIGHT = 200;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Gridlines on round numbers (…, 2, 2.5, 5, 10 × 10ⁿ), about four per chart. */
function niceTicks(min: number, max: number): number[] {
  const rough = (max - min) / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= rough) ?? rough;
  const ticks: number[] = [];
  for (let value = Math.ceil(min / step) * step; value <= max + 1e-9; value += step) {
    ticks.push(Math.round(value * 1000) / 1000);
  }
  return ticks;
}

/** Rounded top, square base: data-ends are rounded, the baseline stays anchored. */
function barPath(x: number, y: number, width: number, base: number, radius: number): string {
  const r = Math.min(radius, width / 2, Math.max(0, base - y));
  return `M${x},${base} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${base} Z`;
}

/** Single-series trend: line or bars, recessive grid, crosshair tooltip, last value labelled. */
export function TrendChart({ title, unit, points, kind, color, yMin, yMax, reference, format }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const fmt = format ?? ((value: number) => String(Math.round(value * 10) / 10));

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const n = points.length;
  const step = n > 1 ? plotW / (kind === "bar" ? n : n - 1) : plotW;
  const xAt = (i: number) => PAD.left + (kind === "bar" ? step * i + step / 2 : n > 1 ? step * i : plotW / 2);
  const yAt = (v: number) => PAD.top + plotH - ((Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin)) * plotH;
  const base = PAD.top + plotH;

  const ticks = niceTicks(yMin, yMax);
  const labelIdx = n <= 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];
  const present = points.map((p, i) => ({ ...p, i })).filter((p): p is { date: string; value: number; i: number } => p.value != null);
  const last = present.at(-1);

  // Line segments break at missing days rather than bridging them.
  const segments: string[] = [];
  let current = "";
  points.forEach((p, i) => {
    if (p.value == null) {
      if (current) segments.push(current);
      current = "";
      return;
    }
    current += `${current ? "L" : "M"}${xAt(i)},${yAt(p.value)} `;
  });
  if (current) segments.push(current);

  function onMove(event: React.PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left + PAD.left;
    const raw = kind === "bar" ? (x - PAD.left) / step - 0.5 : (x - PAD.left) / (step || 1);
    setHover(Math.max(0, Math.min(n - 1, Math.round(raw))));
  }

  const hovered = hover != null ? points[hover] : null;
  const summary = last
    ? `${title}: latest ${fmt(last.value)}${unit} on ${shortDate(last.date)}, ${present.length} of ${n} days logged.`
    : `${title}: no data in this range.`;

  return (
    <figure className="rounded-3xl border border-rule bg-sheet p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-mute">{title}</span>
        {last ? (
          <span className="font-display text-2xl font-light tracking-[-0.02em]">
            {fmt(last.value)}
            <span className="ml-0.5 text-sm text-mute">{unit}</span>
          </span>
        ) : null}
      </figcaption>

      <div ref={frameRef} className="relative mt-3">
        {present.length === 0 ? (
          <p className="flex h-[200px] items-center justify-center text-sm text-mute">Nothing logged in this range yet.</p>
        ) : (
          <svg width={width} height={HEIGHT} role="img" aria-label={summary} className="block overflow-visible">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={PAD.left} x2={width - PAD.right} y1={yAt(t)} y2={yAt(t)} stroke="var(--color-rule)" strokeWidth="1" />
                <text x={PAD.left - 8} y={yAt(t)} dy="0.32em" textAnchor="end" className="fill-mute text-[11px]">
                  {fmt(t)}
                </text>
              </g>
            ))}
            {labelIdx.map((i) => (
              <text key={i} x={xAt(i)} y={HEIGHT - 8} textAnchor={i === 0 && n > 1 ? "start" : i === n - 1 && n > 1 ? "end" : "middle"} className="fill-mute text-[11px]">
                {shortDate(points[i].date)}
              </text>
            ))}

            {reference ? (
              <g>
                <line x1={PAD.left} x2={width - PAD.right} y1={yAt(reference.value)} y2={yAt(reference.value)} stroke="var(--color-mute)" strokeWidth="1" strokeDasharray="4 4" />
                <text x={width - PAD.right} y={yAt(reference.value) - 6} textAnchor="end" className="fill-mute text-[11px]">
                  {reference.label}
                </text>
              </g>
            ) : null}

            {kind === "bar"
              ? present.map((p) => {
                  const w = Math.max(3, Math.min(28, step - 2));
                  return (
                    <path
                      key={p.date}
                      d={barPath(xAt(p.i) - w / 2, yAt(p.value), w, base, 4)}
                      fill={color}
                      opacity={hover == null || hover === p.i ? 1 : 0.55}
                    />
                  );
                })
              : (
                <>
                  {segments.map((d) => (
                    <path key={d} d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                  ))}
                  {present.map((p) => (
                    <circle key={p.date} cx={xAt(p.i)} cy={yAt(p.value)} r="4" fill={color} stroke="var(--color-sheet)" strokeWidth="2" />
                  ))}
                </>
              )}

            {hover != null ? (
              <line x1={xAt(hover)} x2={xAt(hover)} y1={PAD.top} y2={base} stroke="var(--color-mute)" strokeWidth="1" />
            ) : null}

            <rect
              x={PAD.left}
              y={PAD.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}

        {hovered && hover != null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-rule bg-paper px-3 py-2 text-xs shadow-lg"
            style={{ left: Math.min(width - 60, Math.max(60, xAt(hover))) }}
          >
            <p className="text-mute">{shortDate(hovered.date)}</p>
            <p className="mt-0.5 text-sm text-ink">{hovered.value == null ? "Not logged" : `${fmt(hovered.value)}${unit}`}</p>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
