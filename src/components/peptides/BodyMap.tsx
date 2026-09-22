"use client";

import { useState } from "react";
import { siteLabel, sites, type SiteId } from "@/lib/peptides/catalog";

type Usage = Partial<Record<SiteId, { lastDate: string; count: number }>>;

/** Simple outline in a 200 × 440 box, drawn with strokes so it reads as a diagram. */
function Outline() {
  return (
    <g fill="none" stroke="var(--color-rule)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="100" cy="42" r="24" />
      <path d="M88 64 L88 78 M112 64 L112 78" />
      <path d="M62 86 Q100 74 138 86 L146 150 Q142 200 132 226 L134 250 L66 250 L68 226 Q58 200 54 150 Z" />
      <path d="M62 86 Q44 92 42 118 L36 200 Q34 224 40 236" />
      <path d="M138 86 Q156 92 158 118 L164 200 Q166 224 160 236" />
      <path d="M68 250 L72 330 L76 420 M98 262 L96 330 L92 420" />
      <path d="M132 250 L128 330 L124 420 M102 262 L104 330 L108 420" />
    </g>
  );
}

function daysAgo(date: string, today: string): number {
  return Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000);
}

/**
 * Front and back body outline with injection sites. In picker mode, tapping a
 * site selects it; in display mode, recently used sites are shaded and the
 * suggested next site is ringed.
 */
export function BodyMap({
  value,
  onChange,
  usage = {},
  suggestion,
  today,
  label = "Injection site",
}: {
  value?: SiteId;
  onChange?: (site: SiteId) => void;
  usage?: Usage;
  suggestion?: SiteId;
  today?: string;
  label?: string;
}) {
  const [view, setView] = useState<"front" | "back">(() => sites.find((site) => site.id === value)?.view ?? "front");
  const picker = Boolean(onChange);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-mute">{label}</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Body side">
          {(["front", "back"] as const).map((side) => (
            <button
              key={side}
              type="button"
              role="radio"
              aria-checked={view === side}
              onClick={() => setView(side)}
              className={`rounded-full border px-3 py-1 text-xs ${view === side ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:text-ink"}`}
            >
              {side === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 200 440" className="mx-auto mt-3 block h-72 w-auto" role="group" aria-label={`${label}, ${view} of body`}>
        <Outline />
        {sites
          .filter((site) => site.view === view)
          .map((site) => {
            const used = usage[site.id];
            const age = used && today ? daysAgo(used.lastDate, today) : null;
            const selected = value === site.id;
            const suggested = suggestion === site.id;
            const fill = selected ? "var(--color-pine)" : age != null && age <= 2 ? "var(--color-strain)" : age != null && age <= 7 ? "var(--color-mute)" : "transparent";
            const name = `${site.label}${age != null ? `, used ${age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`}` : ""}${suggested ? ", suggested next" : ""}`;
            const dot = (
              <>
                {suggested ? <circle cx={site.x} cy={site.y} r="15" fill="none" stroke="var(--color-recovery)" strokeWidth="2" strokeDasharray="4 3" /> : null}
                <circle cx={site.x} cy={site.y} r="10" fill={fill} stroke={selected ? "var(--color-ink)" : "var(--color-mute)"} strokeWidth="2" />
              </>
            );
            return picker ? (
              <g
                key={site.id}
                role="radio"
                aria-checked={selected}
                aria-label={name}
                tabIndex={0}
                className="cursor-pointer outline-none focus-visible:[&>circle:last-child]:stroke-[var(--color-pine-deep)]"
                onClick={() => onChange?.(site.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange?.(site.id);
                  }
                }}
              >
                <circle cx={site.x} cy={site.y} r="18" fill="transparent" />
                {dot}
              </g>
            ) : (
              <g key={site.id} role="img" aria-label={name}>
                {dot}
              </g>
            );
          })}
      </svg>

      <p className="mt-2 text-center text-sm">
        {value ? siteLabel(value) : picker ? <span className="text-mute">Tap where you injected</span> : null}
      </p>
      {!picker ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-mute">
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: "var(--color-strain)" }} />Last 2 days</li>
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-mute" />This week</li>
          <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full border border-dashed" style={{ borderColor: "var(--color-recovery)" }} />Suggested next</li>
        </ul>
      ) : null}
    </div>
  );
}
