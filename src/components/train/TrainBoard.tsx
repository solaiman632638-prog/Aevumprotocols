"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { TrendChart } from "@/components/today/TrendChart";
import { exercises, getExercise, levels, oneRepMax, rank } from "@/lib/train/exercises";
import { loadWorkoutMap, saveWorkoutDay } from "@/lib/train/storage";
import type { LiftEntry, WorkoutDay } from "@/lib/train/types";
import { useWorkouts } from "@/lib/train/useWorkouts";
import { todayIso } from "@/lib/today/storage";
import { useProfile } from "@/lib/today/useProfile";

const LB_PER_KG = 2.20462;
const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const card = "rounded-3xl border border-rule bg-sheet p-5 sm:p-8";

export type Row = { exercise: string; weight: string; reps: string; sets: string };
const blankRow = (exercise = "bench"): Row => ({ exercise, weight: "", reps: "", sets: "3" });

function daysBefore(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

/** Logging, progress, and ranks. `prefill` starts the form from a plan day. */
export function TrainBoard({ prefill }: { prefill?: Row[] }) {
  const profile = useProfile();
  const hydrated = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const days = useWorkouts();

  const imperial = profile?.units === "imperial";
  const unit = imperial ? "lb" : "kg";
  const show = (kg: number) => Math.round(imperial ? kg * LB_PER_KG : kg);
  const today = hydrated ? todayIso() : "";

  const [date, setDate] = useState("");
  const [rows, setRows] = useState<Row[]>(prefill?.length ? prefill : [blankRow()]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Bodyweight moves count the lifter's own weight, so they compare across days.
  const load = (lift: LiftEntry) => (getExercise(lift.exercise)?.bodyweight ? (profile?.weightKg ?? 0) + lift.weightKg : lift.weightKg);

  /** Best estimated max per exercise per day. */
  const progress = useMemo(() => {
    const byExercise = new Map<string, { date: string; max: number }[]>();
    for (const day of days) {
      for (const lift of day.lifts) {
        const max = oneRepMax(load(lift), lift.reps);
        const series = byExercise.get(lift.exercise) ?? [];
        const last = series.at(-1);
        if (last?.date === day.date) last.max = Math.max(last.max, max);
        else series.push({ date: day.date, max });
        byExercise.set(lift.exercise, series);
      }
    }
    return byExercise;
    // load depends only on profile weight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, profile?.weightKg]);

  const tracked = exercises.filter((exercise) => progress.has(exercise.slug));
  const [picked, setPicked] = useState<string | null>(null);
  const focus = picked && progress.has(picked) ? picked : tracked[0]?.slug;

  function save(event: React.FormEvent) {
    event.preventDefault();
    const day = date || today;
    const lifts: LiftEntry[] = [];
    for (const row of rows) {
      if (!row.weight.trim() && !row.reps.trim()) continue;
      const weight = Number(row.weight || 0);
      const reps = Number(row.reps);
      const sets = Number(row.sets || 1);
      const bodyweight = getExercise(row.exercise)?.bodyweight;
      if (!Number.isFinite(weight) || weight < 0 || (!bodyweight && weight === 0)) return setError("Add the weight you lifted.");
      if (!Number.isInteger(reps) || reps < 1 || reps > 100) return setError("Reps should be a whole number from 1 to 100.");
      if (!Number.isInteger(sets) || sets < 1 || sets > 20) return setError("Sets should be from 1 to 20.");
      lifts.push({
        id: crypto.randomUUID(),
        exercise: row.exercise,
        weightKg: Math.round((imperial ? weight / LB_PER_KG : weight) * 10) / 10,
        reps,
        sets,
      });
    }
    if (lifts.length === 0) return setError("Log at least one lift.");
    const existing = loadWorkoutMap()[day]?.lifts ?? [];
    saveWorkoutDay({ date: day, lifts: [...existing, ...lifts] });
    setError(null);
    setRows([blankRow(rows.at(-1)?.exercise)]);
    setSaved(true);
    setPicked(lifts[0].exercise);
  }

  function remove(day: WorkoutDay, id: string) {
    saveWorkoutDay({ date: day.date, lifts: day.lifts.filter((lift) => lift.id !== id) });
  }

  if (!hydrated) return <p className="text-mute">Loading your training…</p>;

  const recent = days.filter((day) => day.lifts.length).slice(-10).reverse();
  const sessionsThisMonth = days.filter((day) => day.lifts.length && day.date > daysBefore(today, 30)).length;

  return (
    <div className="space-y-10">
      <form onSubmit={save} className={`${card} space-y-5`} noValidate aria-label="Log a workout">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Log a workout</h2>
          <label className="text-sm text-mute">
            Date{" "}
            <input type="date" value={date || today} max={today} onChange={(e) => setDate(e.target.value)} className="ml-2 rounded-xl border border-rule bg-paper px-3 py-2 text-sm text-ink" />
          </label>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => {
            const bodyweight = getExercise(row.exercise)?.bodyweight;
            const set = (patch: Partial<Row>) => setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
            return (
              <div key={index} className="grid grid-cols-[1fr_1fr_1fr] gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <select aria-label="Exercise" value={row.exercise} onChange={(e) => set({ exercise: e.target.value })} className={`${field} col-span-3 sm:col-span-1`}>
                  {exercises.map((exercise) => (
                    <option key={exercise.slug} value={exercise.slug}>{exercise.name}</option>
                  ))}
                </select>
                <input aria-label={bodyweight ? `Added weight (${unit})` : `Weight (${unit})`} inputMode="decimal" placeholder={bodyweight ? `+${unit}` : unit} value={row.weight} onChange={(e) => set({ weight: e.target.value })} className={field} />
                <input aria-label="Reps" inputMode="numeric" placeholder="reps" value={row.reps} onChange={(e) => set({ reps: e.target.value })} className={field} />
                <input aria-label="Sets" inputMode="numeric" placeholder="sets" value={row.sets} onChange={(e) => set({ sets: e.target.value })} className={field} />
                {rows.length > 1 ? (
                  <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== index))} className="col-span-3 text-left text-xs text-mute hover:text-ink sm:col-span-1" aria-label="Remove this lift">
                    Remove
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {error ? <p role="alert" className="text-sm text-warn">{error}</p> : null}
        {saved && !error ? <p className="text-sm text-pine-deep">Saved. Keep going or check your progress below.</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => setRows([...rows, blankRow(rows.at(-1)?.exercise)])} className="btn-secondary !min-h-0 !px-4 !py-2">
            Add another lift
          </button>
          <button type="submit" className="btn-primary !min-h-0 !px-5 !py-2">Save workout</button>
        </div>
      </form>

      {tracked.length === 0 ? (
        <p className="text-mute">Log your first workout to see your progress and how you rank.</p>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Your lifts</h2>
              <p className="text-sm text-mute">{sessionsThisMonth} session{sessionsThisMonth === 1 ? "" : "s"} in the last 30 days</p>
            </div>
            {!profile ? (
              <p className="text-sm text-mute">
                <Link href="/today" className="text-pine-deep underline decoration-rule underline-offset-2">Set up your Today profile</Link> with your age,
                sex, and weight to see how you rank.
              </p>
            ) : null}
            <ul className="grid gap-4 sm:grid-cols-2">
              {tracked.map((exercise) => {
                const series = progress.get(exercise.slug)!;
                const best = Math.max(...series.map((point) => point.max));
                const monthAgo = daysBefore(today, 28);
                const before = series.filter((point) => point.date <= monthAgo);
                const recentBest = Math.max(0, ...series.filter((point) => point.date > monthAgo).map((point) => point.max));
                const baseline = before.length ? Math.max(...before.map((point) => point.max)) : series[0].max;
                const change = recentBest && baseline ? Math.round(((recentBest - baseline) / baseline) * 100) : null;
                const standing = profile ? rank(exercise, profile.sex, profile.weightKg, profile.age, best) : null;
                return (
                  <li key={exercise.slug}>
                    <button type="button" onClick={() => setPicked(exercise.slug)} aria-pressed={focus === exercise.slug}
                      className={`h-full w-full rounded-3xl border bg-sheet p-5 text-left ${focus === exercise.slug ? "border-pine" : "border-rule hover:border-mute"}`}>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{exercise.name}</h3>
                        {change !== null && series.length > 1 ? (
                          <span className={`font-mono text-xs ${change > 0 ? "text-pine-deep" : "text-mute"}`}>
                            {change > 0 ? "+" : ""}{change}% in 4 weeks
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-mute">
                        Estimated max <span className="font-display text-2xl font-light text-ink">{show(best)} {unit}</span>
                      </p>
                      {standing ? (
                        <div className="mt-4">
                          <div className="flex items-baseline justify-between text-sm">
                            <span>{standing.level}</span>
                            <span className="text-mute">Stronger than ~{standing.percentile}% of lifters</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-paper" aria-hidden>
                            <div className="h-2 rounded-full bg-pine" style={{ width: `${standing.percentile}%` }} />
                          </div>
                          {standing.next ? (
                            <p className="mt-2 text-xs text-mute">{standing.next.level} at {show(standing.next.kg)} {unit}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {profile ? (
              <p className="text-xs text-mute">
                Compared with {profile.sex === "male" ? "men" : "women"} who lift, adjusted for your body weight ({show(profile.weightKg)} {unit}) and
                age ({profile.age}). Levels run {levels.map((level) => level.name).join(" → ")}. Estimates from common strength standards, not a
                measured survey. Ranks cover the five main barbell lifts.
              </p>
            ) : null}
          </section>

          {focus ? (
            <section>
              <TrendChart
                title={`${getExercise(focus)?.name} · estimated max`}
                unit={` ${unit}`}
                points={progress.get(focus)!.map((point) => ({ date: point.date, value: show(point.max) }))}
                kind="line"
                color="var(--color-recovery)"
                yMin={Math.floor(Math.min(...progress.get(focus)!.map((point) => show(point.max))) * 0.9)}
                yMax={Math.ceil(Math.max(...progress.get(focus)!.map((point) => show(point.max))) * 1.1)}
              />
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Recent workouts</h2>
            <ul className="mt-4 space-y-3">
              {recent.map((day) => (
                <li key={day.date} className="rounded-3xl border border-rule bg-sheet px-5 py-4">
                  <p className="text-sm text-mute">{shortDate(day.date)}</p>
                  <ul className="mt-2 space-y-1.5">
                    {day.lifts.map((lift) => (
                      <li key={lift.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span>
                          {getExercise(lift.exercise)?.name ?? lift.exercise}{" "}
                          <span className="text-mute">
                            {lift.sets} × {lift.reps}
                            {lift.weightKg || !getExercise(lift.exercise)?.bodyweight ? ` @ ${getExercise(lift.exercise)?.bodyweight ? "+" : ""}${show(lift.weightKg)} ${unit}` : ""}
                          </span>
                        </span>
                        <button type="button" onClick={() => remove(day, lift.id)} className="text-xs text-dim hover:text-warn" aria-label={`Delete ${getExercise(lift.exercise)?.name}`}>
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
