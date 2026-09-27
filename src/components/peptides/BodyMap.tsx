"use client";

import { useState } from "react";
import { siteDetail, siteLabel, sites, type SiteId } from "@/lib/peptides/catalog";

type Usage = Partial<Record<SiteId, { lastDate: string; count: number }>>;

const body = {
  fill: "var(--color-panel)",
  stroke: "var(--color-mute)",
  strokeOpacity: 0.55,
  strokeWidth: 1.6,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const;

const muscle = {
  fill: "none",
  stroke: "var(--color-mute)",
  strokeOpacity: 0.45,
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Head, neck, arms, legs and feet — shared by both views. */
function Frame() {
  return (
    <>
      <ellipse cx="120" cy="46" rx="21" ry="26" />
      <path d="M110 68h20v18h-20z" />
      {/* arms */}
      <path d="M86 96q-16 6-18 26l-6 52q-2 16 2 28l12 2q4-14 4-28l6-40z" />
      <path d="M154 96q16 6 18 26l6 52q2 16-2 28l-12 2q-4-14-4-28l-6-40z" />
      <path d="M62 202q-4 22 0 40l12 2q4-20 0-42z" />
      <path d="M178 202q4 22 0 40l-12 2q-4-20 0-42z" />
      {/* legs */}
      <path d="M88 252h32l4 62-4 66-6 58H96l-6-58-6-66z" />
      <path d="M120 252h32l6 62-6 66-6 58h-18l-4-58-4-66z" />
      <path d="M94 440h22l-2 34 2 18H92l2-18z" />
      <path d="M124 440h22l2 34 2 18h-24l2-18z" />
      <path d="M88 492h28v12H88zM124 492h28v12h-28z" />
    </>
  );
}

/** Front of the body: silhouette, then the muscle groups drawn over it. */
function FrontBody() {
  return (
    <g>
      <g {...body}>
        <Frame />
        <path d="M86 96q34-12 68 0l6 40q2 34-4 58l-4 30q-2 16-6 28H94q-4-12-6-28l-4-30q-6-24-4-58z" />
      </g>
      <g {...muscle}>
        <path d="M110 70q10 8 20 0" />
        {/* pectorals */}
        <path d="M92 108q28-12 28 10 0-22 28-10" />
        <path d="M92 108q4 24 28 26 24-2 28-26" />
        <path d="M120 118v22" />
        {/* deltoids */}
        <path d="M86 96q-14 8-16 30M154 96q14 8 16 30" />
        {/* biceps and forearms */}
        <path d="M74 132q-4 26 0 46M166 132q4 26 0 46" />
        <path d="M66 208q-2 18 2 30M174 208q2 18-2 30" />
        {/* rectus abdominis with its intersections */}
        <path d="M106 146h28v82h-28z" />
        <path d="M120 146v82" />
        <path d="M106 168h28M106 188h28M106 208h28" />
        {/* obliques */}
        <path d="M102 150q-10 24-8 52M138 150q10 24 8 52" />
        <path d="M96 232q24 12 48 0" />
        {/* quadriceps: rectus femoris centre, vastus either side */}
        <path d="M120 258v82" />
        <path d="M100 262q-6 40-2 76M140 262q6 40 2 76" />
        <path d="M112 266q-2 40 0 74M128 266q2 40 0 74" />
        {/* knees, shins */}
        <path d="M94 376q14 6 26 0M120 376q12 6 26 0" />
        <path d="M104 392q-4 24 0 42M136 392q4 24 0 42" />
      </g>
    </g>
  );
}

/** Back of the body, same construction. */
function BackBody() {
  return (
    <g>
      <g {...body}>
        <Frame />
        <path d="M86 96q34-12 68 0l6 40q2 34-4 58l-4 30q-2 16-6 28H94q-4-12-6-28l-4-30q-6-24-4-58z" />
      </g>
      <g {...muscle}>
        {/* trapezius */}
        <path d="M110 76 86 98l34 26 34-26-24-22z" />
        <path d="M120 124v104" />
        {/* deltoids, triceps */}
        <path d="M86 96q-14 8-16 30M154 96q14 8 16 30" />
        <path d="M74 134q-4 24 0 44M166 134q4 24 0 44" />
        {/* latissimus sweeping to the waist */}
        <path d="M94 124q-4 44 14 72M146 124q4 44-14 72" />
        {/* erector spinae */}
        <path d="M112 128v100M128 128v100" />
        <path d="M98 190q22 10 44 0" />
        {/* glutes */}
        <path d="M120 250v56" />
        <path d="M94 256q-4 32 8 50 18 10 36 0 12-18 8-50" />
        {/* hamstrings, calves */}
        <path d="M104 314q-4 32 0 58M136 314q4 32 0 58" />
        <path d="M94 376q14 6 26 0M120 376q12 6 26 0" />
        <path d="M104 394q-4 22 2 38M136 394q4 22-2 38" />
      </g>
    </g>
  );
}

function daysAgo(date: string, today: string): number {
  return Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000);
}

/**
 * Front and back of the body with every site worth injecting marked as an
 * area, not a point, since each one is a patch to rotate within.
 *
 * Tapping picks a site; in display mode recent sites are shaded and the next
 * suggested one is ringed.
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

      <svg viewBox="0 0 240 520" className="mx-auto mt-3 block h-96 w-auto" role="group" aria-label={`${label}, ${view} of body`}>
        {view === "front" ? <FrontBody /> : <BackBody />}
        {sites
          .filter((site) => site.view === view)
          .map((site) => {
            const used = usage[site.id];
            const age = used && today ? daysAgo(used.lastDate, today) : null;
            const selected = value === site.id;
            const suggested = suggestion === site.id;
            const fill = selected
              ? "var(--color-pine)"
              : age != null && age <= 2
                ? "var(--color-strain)"
                : age != null && age <= 7
                  ? "var(--color-mute)"
                  : "var(--color-ink)";
            const name = `${site.label}, ${site.detail}${site.im ? ", muscle" : ", under the skin"}${
              age != null ? `, used ${age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`}` : ""
            }${suggested ? ", suggested next" : ""}`;
            const area = (
              <>
                {suggested ? (
                  <ellipse
                    cx={site.x}
                    cy={site.y}
                    rx={site.rx + 5}
                    ry={site.ry + 5}
                    fill="none"
                    stroke="var(--color-recovery)"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                ) : null}
                <ellipse
                  cx={site.x}
                  cy={site.y}
                  rx={site.rx}
                  ry={site.ry}
                  fill={fill}
                  fillOpacity={selected ? 0.55 : age != null ? 0.4 : 0.12}
                  stroke={selected ? "var(--color-pine-deep)" : "var(--color-mute)"}
                  strokeWidth={selected ? 2 : 1.5}
                  strokeDasharray={site.im ? "5 3" : undefined}
                />
              </>
            );
            return picker ? (
              <g
                key={site.id}
                role="radio"
                aria-checked={selected}
                aria-label={name}
                tabIndex={0}
                className="cursor-pointer outline-none focus-visible:[&>ellipse:last-child]:stroke-[var(--color-pine-deep)]"
                onClick={() => onChange?.(site.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange?.(site.id);
                  }
                }}
              >
                <ellipse cx={site.x} cy={site.y} rx={site.rx + 6} ry={site.ry + 6} fill="transparent" />
                {area}
              </g>
            ) : (
              <g key={site.id} role="img" aria-label={name}>
                {area}
              </g>
            );
          })}
      </svg>

      <p className="mt-2 text-center text-sm">
        {value ? (
          <>
            {siteLabel(value)}
            <span className="block text-xs text-mute">{siteDetail(value)}</span>
          </>
        ) : picker ? (
          <span className="text-mute">Tap where you injected</span>
        ) : null}
      </p>

      {picker ? (
        <p className="mt-2 text-center text-xs text-mute">
          Dashed areas go into muscle, solid ones under the skin.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-mute">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: "var(--color-strain)" }} />
            Last 2 days
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mute" />
            This week
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-dashed" style={{ borderColor: "var(--color-recovery)" }} />
            Suggested next
          </li>
        </ul>
      )}
    </div>
  );
}
