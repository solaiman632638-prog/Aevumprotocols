"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "motion/react";

type Profile = {
  sport: string;
  session: string;
  /** The sample athlete's logged pin: peptide and site, never an amount. */
  peptide: string;
  site: string;
  next: string;
  recovery: number;
  sleep: number;
  strain: number;
  /** Day strain, Monday to Sunday, on the 0–21 scale. */
  week: number[];
  note: string;
};

/** Sample athletes, not anyone's data. Guidance stays on training and sleep. */
const profiles: Profile[] = [
  {
    sport: "Strength",
    session: "Heavy lower · squat 5×3",
    peptide: "BPC-157",
    site: "Belly, lower left",
    next: "Belly, lower right",
    recovery: 82,
    sleep: 7.6,
    strain: 14.2,
    week: [9, 15, 5, 16, 8, 17, 3],
    note: "Recovery is high. A good day to push the top set.",
  },
  {
    sport: "Endurance",
    session: "Tempo run · 14 km",
    peptide: "MOTS-c",
    site: "Right outer thigh",
    next: "Left outer thigh",
    recovery: 64,
    sleep: 7.1,
    strain: 17.8,
    week: [12, 9, 16, 8, 18, 20, 6],
    note: "HRV sits under baseline. Hold the pace, skip the extra rep.",
  },
  {
    sport: "Hybrid",
    session: "Engine + upper",
    peptide: "TB-500",
    site: "Belly, upper right",
    next: "Belly, upper left",
    recovery: 71,
    sleep: 6.8,
    strain: 15.6,
    week: [14, 11, 15, 7, 16, 13, 4],
    note: "Sleep came up short. Get to bed forty minutes earlier tonight.",
  },
  {
    sport: "Combat",
    session: "Sparring · 6 rounds",
    peptide: "BPC-157",
    site: "Left shoulder",
    next: "Right shoulder",
    recovery: 58,
    sleep: 6.4,
    strain: 18.9,
    week: [16, 13, 18, 9, 17, 19, 5],
    note: "Third hard day running. Keep tomorrow technical and light.",
  },
];

const days = ["M", "T", "W", "T", "F", "S", "S"];

/** Interactive readiness card: the sport chips swap the sample day in. */
export function Readiness() {
  const [index, setIndex] = useState(0);
  const profile = profiles[index];

  return (
    <div className="rounded-3xl border border-rule bg-sheet/80 p-6 backdrop-blur-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">Today · sample athlete</p>
        <span className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-dim">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-recovery" />
          Live demo
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Sport">
        {profiles.map((item, i) => (
          <button
            key={item.sport}
            type="button"
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] transition-colors ${
              i === index ? "border-ink bg-ink text-on-accent" : "border-rule text-mute hover:border-mute hover:text-ink"
            }`}
          >
            {item.sport}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xl">{profile.session}</p>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-rule px-4 py-3 text-sm">
        <div>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-dim">Logged peptide</p>
          <p className="mt-1">
            {profile.peptide} <span className="text-mute">· {profile.site}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-dim">Next site</p>
          <p className="mt-1 text-mute">{profile.next}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Ring label="Recovery" value={profile.recovery} max={100} unit="%" colour="var(--color-recovery)" />
        <Ring label="Sleep" value={profile.sleep} max={9} unit="h" decimals={1} colour="var(--color-sleep)" />
        <Ring label="Strain" value={profile.strain} max={21} decimals={1} colour="var(--color-strain)" />
      </div>

      <div className="mt-8">
        <p className="eyebrow">Training load · this week</p>
        <div className="mt-4 flex h-24 items-end gap-2" aria-hidden>
          {profile.week.map((load, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <motion.div
                className="w-full rounded-md"
                initial={false}
                animate={{
                  height: `${(load / 21) * 100}%`,
                  backgroundColor: load >= 15 ? "var(--color-strain)" : "var(--color-rule)",
                }}
                transition={{ type: "spring", stiffness: 160, damping: 20, delay: i * 0.03 }}
              />
              <span className="font-mono text-[0.6rem] text-dim">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <motion.p
        key={profile.sport}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-6 border-t border-rule pt-5 text-sm text-mute"
        aria-live="polite"
      >
        {profile.note}
      </motion.p>
    </div>
  );
}

function Ring({
  label,
  value,
  max,
  unit = "",
  decimals = 0,
  colour,
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
  decimals?: number;
  colour: string;
}) {
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const controls = animate(shown, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setShown,
    });
    return () => controls.stop();
    // Only a new target should restart the count, not every frame of it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-rule)" strokeWidth="7" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={colour}
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: Math.min(1, value / max) }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl tabular-nums sm:text-3xl"
          style={{ fontFamily: "var(--font-readout)" }}
        >
          {shown.toFixed(decimals)}
          <span className="text-sm text-mute">{unit}</span>
        </span>
      </div>
      <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-mute">{label}</p>
    </div>
  );
}
