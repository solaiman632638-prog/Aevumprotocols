"use client";

import { useState } from "react";
import { PeptideLog } from "@/components/peptides/PeptideLog";
import type { SiteId } from "@/lib/peptides/catalog";
import type { DayState, DoseEntry, Reaction, UserContext } from "@/lib/today/types";

const LB_PER_KG = 2.20462;

const loads = [
  { value: 4, label: "Rest" },
  { value: 9, label: "Light" },
  { value: 13, label: "Moderate" },
  { value: 17, label: "Hard" },
] as const;

type Scale = "sleepQuality" | "energy" | "soreness" | "stress";

const scales: { key: Scale; label: string; low: string; high: string }[] = [
  { key: "sleepQuality", label: "Sleep quality", low: "Poor", high: "Great" },
  { key: "energy", label: "Energy", low: "Drained", high: "Fresh" },
  { key: "soreness", label: "Soreness", low: "None", high: "Very sore" },
  { key: "stress", label: "Stress", low: "Calm", high: "Very stressed" },
];

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";

export function CheckinForm({
  date,
  profile,
  previous,
  onSave,
  onCancel,
  siteSuggestion,
}: {
  date: string;
  profile: UserContext;
  previous?: DayState;
  siteSuggestion?: SiteId;
  onSave: (day: DayState) => void;
  onCancel?: () => void;
}) {
  const imperial = profile.units === "imperial";
  const sameDay = previous?.date === date;
  const [sleepHours, setSleepHours] = useState(previous?.sleepHours != null ? String(previous.sleepHours) : "");
  const [values, setValues] = useState<Partial<Record<Scale, number>>>(
    sameDay ? { sleepQuality: previous?.sleepQuality, energy: previous?.energy, soreness: previous?.soreness, stress: previous?.stress } : {},
  );
  const [load, setLoad] = useState<number | undefined>(sameDay ? previous?.yesterdayLoad : undefined);
  const [rhr, setRhr] = useState(sameDay && previous?.rhr != null ? String(previous.rhr) : "");
  const [hrv, setHrv] = useState(sameDay && previous?.hrv != null ? String(previous.hrv) : "");
  const [weight, setWeight] = useState(
    sameDay && previous?.weightKg != null ? (imperial ? (previous.weightKg * LB_PER_KG).toFixed(1) : String(previous.weightKg)) : "",
  );
  const [doses, setDoses] = useState<DoseEntry[]>(sameDay ? previous?.doses ?? [] : []);
  const [reactions, setReactions] = useState<Reaction[]>(sameDay ? previous?.reactions ?? [] : []);
  const [error, setError] = useState<string | null>(null);

  function num(value: string, min: number, max: number): number | undefined | null {
    if (value.trim() === "") return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const hours = num(sleepHours, 0, 16);
    const restingHr = num(rhr, 30, 120);
    const variability = num(hrv, 5, 250);
    const rawWeight = num(weight, imperial ? 66 : 30, imperial ? 660 : 300);
    if (hours === null) return setError("Sleep should be between 0 and 16 hours.");
    if (restingHr === null) return setError("Resting heart rate should be between 30 and 120 bpm.");
    if (variability === null) return setError("HRV should be between 5 and 250 ms.");
    if (rawWeight === null) return setError("Weight is out of range.");
    const incomplete = doses.find((dose) => !dose.compound || !(dose.amount > 0));
    if (incomplete) return setError("Each peptide needs a name and an amount, or remove the empty row.");
    if (hours === undefined && Object.keys(values).length === 0 && doses.length === 0) {
      return setError("Log your sleep, one of the sliders, or a peptide.");
    }
    setError(null);
    onSave({
      date,
      source: "manual",
      sleepHours: hours,
      ...values,
      yesterdayLoad: load,
      rhr: restingHr,
      hrv: variability,
      weightKg: rawWeight === undefined ? undefined : Math.round((imperial ? rawWeight / LB_PER_KG : rawWeight) * 10) / 10,
      doses: doses.length ? doses : undefined,
      reactions: reactions.length ? reactions : undefined,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8 rounded-3xl border border-rule bg-sheet p-5 sm:p-8" noValidate>
      <div>
        <p className="eyebrow">Check-in · {date}</p>
        <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">How did you wake up?</h2>
        <p className="mt-2 max-w-prose text-sm text-mute">
          How you slept, how you feel, and the peptides you took. Check in
          daily and your scores and dose guidance build from your own history.
        </p>
      </div>

      <div className="max-w-xs">
        <label htmlFor="c-sleep" className="mb-1.5 block text-sm">Hours slept last night</label>
        <input id="c-sleep" inputMode="decimal" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} placeholder="7.5" className={field} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {scales.map((scale) => (
          <fieldset key={scale.key}>
            <legend className="mb-2 text-sm">{scale.label}</legend>
            <div className="flex gap-1.5" role="radiogroup" aria-label={scale.label}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = values[scale.key] === n;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${n}${n === 1 ? ` (${scale.low})` : n === 5 ? ` (${scale.high})` : ""}`}
                    onClick={() => setValues((current) => ({ ...current, [scale.key]: n }))}
                    className={`size-11 rounded-xl border text-sm ${active ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 flex justify-between text-xs text-mute" style={{ maxWidth: "15.5rem" }}>
              <span>{scale.low}</span>
              <span>{scale.high}</span>
            </p>
          </fieldset>
        ))}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm">Yesterday&apos;s training</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Yesterday's training">
          {loads.map((option) => (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={load === option.value}
              onClick={() => setLoad(option.value)}
              className={`min-h-11 rounded-full border px-4 text-sm ${load === option.value ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <PeptideLog doses={doses} reactions={reactions} onDoses={setDoses} onReactions={setReactions} suggestion={siteSuggestion} />

      <details className="rounded-2xl border border-rule px-4 py-3">
        <summary className="cursor-pointer text-sm">Optional: heart rate, HRV, weight</summary>
        <p className="mt-2 text-xs text-mute">
          If you track them with a watch, ring, or phone app. These unlock the
          cardiovascular score and the weight trend.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="c-rhr" className="mb-1.5 block text-sm">Resting HR (bpm)</label>
            <input id="c-rhr" inputMode="numeric" value={rhr} onChange={(e) => setRhr(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="c-hrv" className="mb-1.5 block text-sm">HRV (ms)</label>
            <input id="c-hrv" inputMode="numeric" value={hrv} onChange={(e) => setHrv(e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="c-weight" className="mb-1.5 block text-sm">Weight ({imperial ? "lb" : "kg"})</label>
            <input id="c-weight" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} className={field} />
          </div>
        </div>
      </details>

      {error ? (
        <p role="alert" className="rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">See today</button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        ) : null}
      </div>
    </form>
  );
}
