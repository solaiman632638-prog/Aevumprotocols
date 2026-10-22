"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { siteDetail, siteLabel, sites, type SiteId } from "@/lib/peptides/catalog";

type Usage = Partial<Record<SiteId, { lastDate: string; count: number }>>;
type View = "front" | "back";

/** One muscle section. `site` makes it tappable; `mark` is where its marker sits. */
type Part = { key: string; d: string; site?: SiteId; mark?: [number, number] };

/*
 * Anatomy on a 420 × 700 grid, mirrored about x = 210. Shapes are written for
 * one side as distances from the midline; `m` is -1 for the viewer's left and
 * +1 for the viewer's right. From the front the viewer's left is the person's
 * right; from the back it is their left, so site sides flip with the view.
 */
const MID = 210;

function sideOf(view: View, m: number): "left" | "right" {
  return (view === "front") === (m < 0) ? "right" : "left";
}

function limbs(view: View, m: number): Part[] {
  const t = (x: number) => MID + m * x;
  const side = sideOf(view, m);
  const front = view === "front";
  const at = (x: number, y: number): [number, number] => [t(x), y];
  return [
    {
      key: `deltoid-${m}`,
      d: `M${t(49)} 118 Q${t(79)} 118 ${t(94)} 146 L${t(106)} 181 Q${t(93)} 196 ${t(78)} 198 L${t(64)} 163Z`,
      site: front ? (`deltoid-${side}` as SiteId) : undefined,
      mark: at(80, 160),
    },
    {
      key: `upper-arm-${m}`,
      d: `M${t(92)} 193 Q${t(112)} 189 ${t(117)} 211 L${t(132)} 269 ${t(114)} 285 ${t(92)} 243 ${t(79)} 201Z`,
      site: (front ? `arm-outer-${side}` : `triceps-${side}`) as SiteId,
      mark: at(106, 236),
    },
    { key: `forearm-${m}`, d: `M${t(117)} 281 Q${t(134)} 268 ${t(140)} 291 L${t(166)} 376 Q${t(162)} 395 ${t(147)} 395 L${t(116)} 325Z` },
    {
      key: `outer-thigh-${m}`,
      d: `M${t(29)} 364 L${t(81)} 353 Q${t(87)} 398 ${t(87)} 439 L${t(75)} 508 ${t(54)} 513 ${t(50)} 450Z`,
      site: front ? (`thigh-${side}` as SiteId) : undefined,
      mark: at(66, 432),
    },
    {
      key: `inner-thigh-${m}`,
      d: `M${t(6)} 369 L${t(29)} 364 ${t(50)} 450 ${t(54)} 513 ${t(28)} 502 ${t(10)} 421Z`,
      site: front ? (`thigh-front-${side}` as SiteId) : undefined,
      mark: at(30, 436),
    },
    { key: `knee-${m}`, d: `M${t(28)} 506 L${t(73)} 511 ${t(72)} 551 ${t(48)} 566 ${t(27)} 541Z` },
    { key: `shin-${m}`, d: `M${t(27)} 553 L${t(45)} 570 ${t(51)} 637 ${t(44)} 670 ${t(23)} 667 ${t(18)} 609Z` },
    { key: `calf-${m}`, d: `M${t(49)} 566 L${t(75)} 547 Q${t(87)} 583 ${t(71)} 620 L${t(53)} 655 ${t(51)} 637Z` },
  ];
}

function torso(view: View, m: number): Part[] {
  const t = (x: number) => MID + m * x;
  const side = sideOf(view, m);
  const at = (x: number, y: number): [number, number] => [t(x), y];
  if (view === "front") {
    const ab = (y1: number, y2: number) => `M${t(37)} ${y1} Q${t(20)} ${y1 - 3} ${t(5)} ${y1} L${t(5)} ${y2} ${t(36)} ${y2 + 1}Z`;
    return [
      { key: `pec-${m}`, d: `M${t(36)} 120 Q${t(67)} 116 ${t(91)} 144 L${t(73)} 189 ${t(8)} 191 ${t(5)} 157Z` },
      // Upper and middle rows sit above the navel line; the lower row below it.
      { key: `ab-upper-${m}`, d: ab(200, 235), site: `abdomen-upper-${side}` as SiteId, mark: at(21, 236) },
      { key: `ab-middle-${m}`, d: ab(238, 273), site: `abdomen-upper-${side}` as SiteId },
      { key: `ab-lower-${m}`, d: ab(276, 311), site: `abdomen-lower-${side}` as SiteId, mark: at(21, 293) },
      {
        key: `oblique-${m}`,
        d: `M${t(75)} 197 L${t(40)} 205 ${t(37)} 316 ${t(24)} 344 ${t(58)} 358 Q${t(73)} 328 ${t(77)} 295Z`,
        site: `flank-${side}` as SiteId,
        mark: at(56, 282),
      },
    ];
  }
  return [
    { key: `trap-${m}`, d: `M${t(26)} 103 L${t(6)} 136 ${t(7)} 193 ${t(43)} 165 ${t(82)} 149Z` },
    { key: `upper-back-${m}`, d: `M${t(85)} 158 L${t(9)} 198 ${t(7)} 252 ${t(60)} 231 ${t(81)} 193Z` },
    { key: `lat-${m}`, d: `M${t(64)} 237 L${t(7)} 260 ${t(5)} 335 ${t(36)} 343 ${t(72)} 302Z` },
    {
      key: `lower-back-${m}`,
      d: `M${t(33)} 345 L${t(0)} 345 ${t(0)} 373 ${t(48)} 373Z`,
      site: `lowback-${side}` as SiteId,
      mark: at(22, 359),
    },
    {
      key: `hip-${m}`,
      d: `M${t(70)} 345 L${t(33)} 345 ${t(48)} 373 ${t(63)} 413 ${t(74)} 380Z`,
      site: `hip-${side}` as SiteId,
      mark: at(60, 372),
    },
    {
      key: `glute-${m}`,
      d: `M${t(47)} 376 Q${t(23)} 365 ${t(3)} 386 L${t(3)} 433 Q${t(22)} 456 ${t(53)} 443 L${t(63)} 413Z`,
      site: `glute-${side}` as SiteId,
      // Upper outer quarter, where the site actually is.
      mark: at(44, 396),
    },
  ];
}

/** Head, neck, hands and feet: drawn but never tappable. */
function silhouette(): string[] {
  const out = [
    "M186 83 L184 111 159 119 155 155 185 160 210 170 235 160 265 155 261 119 236 111 234 83 225 91 195 91Z",
  ];
  for (const m of [-1, 1]) {
    const t = (x: number) => MID + m * x;
    out.push(`M${t(147)} 397 Q${t(163)} 388 ${t(171)} 403 L${t(184)} 440 Q${t(185)} 451 ${t(171)} 448 L${t(145)} 419Z`);
    out.push(`M${t(23)} 667 L${t(44)} 670 ${t(50)} 686 Q${t(55)} 699 ${t(36)} 698 L${t(12)} 698Z`);
  }
  return out;
}

function partsFor(view: View): Part[] {
  const sides = [-1, 1].flatMap((m) => [...limbs(view, m), ...torso(view, m)]);
  // The midline below the navel is not a site, but the front needs it drawn.
  return view === "front" ? [...sides, { key: "lower-abdomen", d: "M188 320 L232 320 256 358 210 373 164 358Z" }] : sides;
}

function daysAgo(date: string, today: string): number {
  return Math.round((Date.parse(today) - Date.parse(date)) / 86_400_000);
}

const SKIN = "#cfd1d2";
const SKIN_ALT = "#dcdedf";
const INERT = "#8f9398";
const SHADOW = "#6f7378";
const OUTLINE = "#25272a";
const WEEK = "color-mix(in srgb, var(--color-strain) 45%, #cfd1d2)";

/**
 * Front and back of the body as muscle sections. Sections that are injection
 * sites are bright and tappable; the rest are shaded and inert. The chosen
 * site lights up with a marker on it, recent sites are tinted, and the
 * suggested next one pulses.
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
  const [view, setView] = useState<View>(() => sites.find((site) => site.id === value)?.view ?? "front");
  const reduced = useReducedMotion();
  const picker = Boolean(onChange);
  const parts = partsFor(view);

  const ageOf = (site: SiteId) => {
    const used = usage[site];
    return used && today ? daysAgo(used.lastDate, today) : null;
  };

  const fillFor = (part: Part, index: number) => {
    if (!part.site) return INERT;
    if (part.site === value) return "#ffffff";
    const age = ageOf(part.site);
    if (age != null && age <= 2) return "var(--color-strain)";
    if (age != null && age <= 7) return WEEK;
    return index % 2 ? SKIN_ALT : SKIN;
  };

  const nameFor = (site: SiteId) => {
    const age = ageOf(site);
    return `${siteLabel(site)}, ${siteDetail(site)}${
      age != null ? `, used ${age === 0 ? "today" : `${age} day${age === 1 ? "" : "s"} ago`}` : ""
    }${suggestion === site ? ", suggested next" : ""}`;
  };

  const markers = parts.filter((part) => part.mark && part.site && (part.site === value || part.site === suggestion));

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
              className={`min-h-9 rounded-full border px-4 text-xs font-semibold uppercase tracking-[0.1em] ${
                view === side ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:text-ink"
              }`}
            >
              {side === "front" ? "Front" : "Back"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-between font-mono text-[0.6rem] uppercase tracking-[0.18em] text-dim">
          <span>Their {view === "front" ? "right" : "left"}</span>
          <span>Their {view === "front" ? "left" : "right"}</span>
        </div>

        <svg
          viewBox="0 0 420 700"
          className="mx-auto block h-[28rem] w-auto max-w-full overflow-visible"
          role="group"
          aria-label={`${label}, ${view} of body`}
          style={{ filter: "drop-shadow(0 0 24px rgb(255 255 255 / 0.07))" }}
        >
          <ellipse cx="210" cy="52" rx="34" ry="43" fill={SHADOW} stroke={OUTLINE} strokeWidth="2" />
          {silhouette().map((d) => (
            <path key={d} d={d} fill={SHADOW} stroke={OUTLINE} strokeWidth="2" />
          ))}

          {parts.map((part, index) => {
            const shape = (
              <path
                d={part.d}
                fill={fillFor(part, index)}
                stroke={OUTLINE}
                strokeWidth="2.3"
                strokeLinejoin="round"
                style={part.site === value ? { filter: "drop-shadow(0 0 8px rgb(255 255 255 / 0.6))" } : undefined}
                className="transition-[fill] duration-200"
              />
            );
            if (!part.site) return <g key={part.key}>{shape}</g>;
            const site = part.site;
            return picker ? (
              <g
                key={part.key}
                role="radio"
                aria-checked={value === site}
                aria-label={nameFor(site)}
                tabIndex={part.mark ? 0 : -1}
                className="cursor-pointer outline-none [&:hover>path]:fill-white [&:focus-visible>path]:fill-white"
                onClick={() => onChange?.(site)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onChange?.(site);
                  }
                }}
              >
                {shape}
              </g>
            ) : (
              <g key={part.key} role={part.mark ? "img" : undefined} aria-label={part.mark ? nameFor(site) : undefined}>
                {shape}
              </g>
            );
          })}

          {markers.map((part) => {
            const [x, y] = part.mark!;
            const chosen = part.site === value;
            const colour = chosen ? "#ffffff" : "var(--color-recovery)";
            return (
              <g key={`mark-${part.key}`} transform={`translate(${x} ${y})`} className="pointer-events-none">
                {reduced ? null : (
                  <motion.circle
                    fill="none"
                    stroke={colour}
                    strokeWidth="1.7"
                    initial={{ r: 9, opacity: 0.9 }}
                    animate={{ r: 26, opacity: 0 }}
                    transition={{ duration: 2, ease: "easeOut", repeat: Infinity }}
                  />
                )}
                <circle r="9" fill="#090a0c" stroke={colour} strokeWidth="2.8" strokeDasharray={chosen ? undefined : "4 3"} />
                <circle r="2.8" fill={colour} />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-center text-sm">
        {value ? (
          <>
            {siteLabel(value)}
            <span className="block text-xs text-mute">{siteDetail(value)}</span>
          </>
        ) : picker ? (
          <span className="text-mute">Tap a bright section where you injected</span>
        ) : null}
      </p>

      {picker ? null : (
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-mute">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: "var(--color-strain)" }} />
            Last 2 days
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: WEEK }} />
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
