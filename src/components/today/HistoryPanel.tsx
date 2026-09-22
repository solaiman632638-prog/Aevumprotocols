"use client";

import { useMemo, useState } from "react";
import { CheckinForm } from "@/components/today/CheckinForm";
import { TrendChart, type TrendPoint } from "@/components/today/TrendChart";
import { buildReport } from "@/lib/today/engine";
import type { DayState, UserContext } from "@/lib/today/types";

const LB_PER_KG = 2.20462;
const RANGES = [7, 30] as const;

function isoDaysBefore(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - days);
  const offset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Trends over the last 7 or 30 days, built by replaying the Today engine on
 * each day's history so past scores match what the user saw that morning.
 */
export function HistoryPanel({
  profile,
  history,
  today,
  manual,
  onSaveDay,
}: {
  profile: UserContext;
  history: DayState[];
  today: string;
  manual: boolean;
  onSaveDay: (day: DayState) => void;
}) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(7);
  const [backfill, setBackfill] = useState<string | null>(null);
  const imperial = profile.units === "imperial";

  const sorted = useMemo(() => [...history].sort((a, b) => a.date.localeCompare(b.date)), [history]);

  const scored = useMemo(
    () =>
      sorted.map((day, index) => {
        const report = buildReport(profile, sorted.slice(0, index + 1), []);
        return { day, recovery: report?.scores[0]?.numeric ?? null, sleepScore: report?.scores[1]?.numeric ?? null };
      }),
    [sorted, profile],
  );

  const byDate = useMemo(() => new Map(scored.map((entry) => [entry.day.date, entry])), [scored]);
  const dates = useMemo(
    () => Array.from({ length: range }, (_, i) => isoDaysBefore(today, range - 1 - i)),
    [range, today],
  );

  const series = (pick: (entry: (typeof scored)[number]) => number | null | undefined): TrendPoint[] =>
    dates.map((date) => {
      const entry = byDate.get(date);
      const value = entry ? pick(entry) : null;
      return { date, value: value ?? null };
    });

  const recovery = series((e) => e.recovery);
  const sleep = series((e) => e.day.sleepHours);
  const toUnit = (kg: number) => (imperial ? kg * LB_PER_KG : kg);
  const weight = series((e) => (e.day.weightKg != null ? toUnit(e.day.weightKg) : null));
  const weights = weight.map((p) => p.value).filter((v): v is number => v != null);
  const target = toUnit(profile.targetWeightKg);
  const weightMin = Math.floor(Math.min(target, ...weights, toUnit(profile.weightKg)) - 2);
  const weightMax = Math.ceil(Math.max(target, ...weights, toUnit(profile.weightKg)) + 2);
  const need = profile.age < 18 ? 9 : 8;
  const logged = scored.filter((entry) => entry.day.date >= dates[0]).reverse();
  const entries = useMemo(() => new Map(sorted.map((day) => [day.date, day])), [sorted]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="radiogroup" aria-label="Range">
          {RANGES.map((days) => (
            <button
              key={days}
              type="button"
              role="radio"
              aria-checked={range === days}
              onClick={() => setRange(days)}
              className={`min-h-11 rounded-full border px-4 text-sm ${range === days ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
            >
              {days} days
            </button>
          ))}
        </div>
        {manual ? (
          <button type="button" onClick={() => setBackfill(backfill ? null : isoDaysBefore(today, 1))} className="btn-secondary !min-h-0 !px-4 !py-2">
            {backfill ? "Close" : "Log a missed day"}
          </button>
        ) : null}
      </div>

      {backfill ? (
        <div className="space-y-4">
          <div className="max-w-xs">
            <label htmlFor="backfill-date" className="mb-1.5 block text-sm">Day to log</label>
            <input
              id="backfill-date"
              type="date"
              value={backfill}
              max={today}
              onChange={(event) => event.target.value && setBackfill(event.target.value)}
              className="w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine"
            />
          </div>
          <CheckinForm
            key={backfill}
            date={backfill}
            profile={profile}
            previous={entries.get(backfill)}
            onSave={(day) => {
              onSaveDay(day);
              setBackfill(null);
            }}
            onCancel={() => setBackfill(null)}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart title="Recovery" unit="/100" points={recovery} kind="line" color="var(--color-recovery)" yMin={0} yMax={100} format={(v) => String(Math.round(v))} />
        <TrendChart title="Sleep" unit=" h" points={sleep} kind="bar" color="var(--color-sleep)" yMin={0} yMax={Math.max(10, need + 1)} reference={{ value: need, label: `Need ${need} h` }} />
        <TrendChart
          title="Weight"
          unit={imperial ? " lb" : " kg"}
          points={weight}
          kind="line"
          color="var(--color-ink)"
          yMin={weightMin}
          yMax={weightMax}
          reference={{ value: target, label: `Target ${Math.round(target * 10) / 10}` }}
        />
      </div>

      <section aria-labelledby="log-heading">
        <h2 id="log-heading" className="font-display text-3xl font-light tracking-[-0.03em]">Day by day</h2>
        {logged.length === 0 ? (
          <p className="mt-3 text-mute">No check-ins in the last {range} days yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-3xl border border-rule">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-rule bg-sheet text-mute">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Day</th>
                  <th scope="col" className="px-4 py-3 font-medium">Recovery</th>
                  <th scope="col" className="px-4 py-3 font-medium">Sleep</th>
                  <th scope="col" className="px-4 py-3 font-medium">Energy</th>
                  <th scope="col" className="px-4 py-3 font-medium">Soreness</th>
                  <th scope="col" className="px-4 py-3 font-medium">Stress</th>
                  <th scope="col" className="px-4 py-3 font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {logged.map(({ day, recovery: score }) => (
                  <tr key={day.date} className="border-b border-rule last:border-b-0">
                    <th scope="row" className="px-4 py-3 font-normal">{longDate(day.date)}</th>
                    <td className="px-4 py-3">{score ?? "—"}</td>
                    <td className="px-4 py-3">{day.sleepHours != null ? `${day.sleepHours} h` : "—"}</td>
                    <td className="px-4 py-3">{day.energy ?? "—"}</td>
                    <td className="px-4 py-3">{day.soreness ?? "—"}</td>
                    <td className="px-4 py-3">{day.stress ?? "—"}</td>
                    <td className="px-4 py-3">
                      {day.weightKg != null ? `${(Math.round(toUnit(day.weightKg) * 10) / 10).toString()} ${imperial ? "lb" : "kg"}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
