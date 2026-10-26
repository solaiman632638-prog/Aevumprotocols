"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Row } from "@/components/train/TrainBoard";
import { goalsFromProfile, supplements } from "@/lib/data/supplements";
import { getExercise, muscleName } from "@/lib/train/exercises";
import { buildPlan, strengthFocus, type Focus } from "@/lib/train/plan";
import type { SavedAnalysis } from "@/lib/train/bodyAnalysis";
import { useWorkouts } from "@/lib/train/useWorkouts";
import { compounds, type CompoundSource } from "@/lib/today/engine";
import { todayIso } from "@/lib/today/storage";
import { useProfile } from "@/lib/today/useProfile";

const LB_PER_KG = 2.20462;
const chip = "min-h-9 min-w-9 rounded-full border px-3 text-sm";

/** Focus areas from the lifts and from the last photo, photo first, no repeats. */
export function combinedFocus(lifts: Focus[], photo: SavedAnalysis | null): Focus[] {
  const fromPhoto: Focus[] = (photo?.focus ?? []).map((item) => ({ ...item, source: "photo" }));
  const merged: Focus[] = [];
  for (const item of [...fromPhoto, ...lifts]) {
    if (!merged.some((existing) => existing.muscle === item.muscle)) merged.push(item);
  }
  return merged.slice(0, 3);
}

export function PlanPanel({ photo, pool, onLog }: { photo: SavedAnalysis | null; pool: CompoundSource[]; onLog: (rows: Row[]) => void }) {
  const profile = useProfile();
  const days = useWorkouts();
  const [perWeek, setPerWeek] = useState<number | null>(null);
  const count = perWeek ?? Math.min(6, Math.max(2, profile?.trainingDays || 3));
  const imperial = profile?.units === "imperial";
  const unit = imperial ? "lb" : "kg";

  const focus = useMemo(() => combinedFocus(strengthFocus(profile, days, todayIso()), photo), [profile, days, photo]);
  const plan = useMemo(() => buildPlan(profile, count, days, focus), [profile, count, days, focus]);

  const goalSlugs = new Set([...(profile?.goals ?? []).flatMap((goal) => goalsFromProfile[goal] ?? []), "muscle"]);
  const picks = supplements.filter((item) => item.evidence !== "Early" && item.goals.some((goal) => goalSlugs.has(goal))).slice(0, 4);

  const peptides = profile ? compounds(profile, pool) : null;

  const show = (kg: number) => (imperial ? Math.round(kg * LB_PER_KG) : kg);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rule bg-sheet p-5 sm:p-8">
        <h2 className="font-display text-3xl font-light tracking-[-0.03em]">How often do you train?</h2>
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Days per week">
          {[2, 3, 4, 5, 6].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={count === n} onClick={() => setPerWeek(n)}
              className={`${chip} ${count === n ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}>
              {n} days
            </button>
          ))}
        </div>
        <p className="mt-4">{plan.split}</p>
        <p className="mt-1 text-sm text-mute">{plan.style}</p>
        {focus.length ? (
          <div className="mt-5">
            <p className="text-sm">Extra sets for your focus areas:</p>
            <ul className="mt-2 space-y-1.5 text-sm text-mute">
              {focus.map((item) => (
                <li key={item.muscle}>
                  <span className="text-ink">{muscleName(item.muscle)}</span> · {item.reason}
                  {item.source === "photo" ? " (from your photo)" : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-5 text-sm text-mute">
            No weak spots yet. Log a few workouts or run a body analysis and the plan will lean into what needs it.
          </p>
        )}
      </section>

      <ol className="grid gap-4 sm:grid-cols-2">
        {plan.days.map((day, index) => (
          <li key={`${day.name}-${index}`} className="flex flex-col rounded-3xl border border-rule bg-sheet p-5">
            <p className="eyebrow">Day {index + 1}</p>
            <h3 className="mt-1 font-display text-2xl font-light tracking-[-0.02em]">{day.name}</h3>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {day.exercises.map((item) => (
                <li key={item.exercise} className="flex items-baseline justify-between gap-3">
                  <span>
                    {getExercise(item.exercise)?.name}
                    {item.focus ? <span className="ml-2 text-xs text-pine-deep">focus</span> : null}
                  </span>
                  <span className="shrink-0 text-mute">
                    {item.sets} × {item.reps}
                    {item.weightKg ? ` @ ${show(item.weightKg)} ${unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                onLog(day.exercises.map((item) => ({
                  exercise: item.exercise,
                  weight: item.weightKg ? String(show(item.weightKg)) : "",
                  reps: "",
                  sets: String(item.sets),
                })))
              }
              className="btn-secondary mt-5 self-start !min-h-0 !px-4 !py-2"
            >
              Log this workout
            </button>
          </li>
        ))}
      </ol>

      <section className="space-y-2 text-sm text-mute">
        <p>{plan.progression}</p>
        {plan.extra ? <p>{plan.extra}</p> : null}
        <p>Weights come from your logged lifts. Log a lift once and its suggested weight appears here.</p>
      </section>

      <section className="rounded-3xl border border-rule bg-sheet p-5 sm:p-8">
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Supplements that fit this plan</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {picks.map((item) => (
            <li key={item.slug}>
              <Link href={`/supplements/${item.slug}`} className="block rounded-2xl border border-rule bg-paper p-4 text-ink no-underline hover:border-pine">
                <span className="font-medium">{item.name}</span>
                <span className="mt-1 block text-sm text-mute">{item.dose.amount}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-rule bg-sheet p-5 sm:p-8">
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Peptides that fit your goals</h2>
        {!peptides ? (
          <p className="mt-3 text-sm text-mute">
            <Link href="/today" className="text-pine-deep underline decoration-rule underline-offset-2">Set up your Today profile</Link> so
            Aevum can pick peptides for your goals and screen them against your health.
          </p>
        ) : peptides.withheld ? (
          <p className="mt-3 text-sm text-mute">{peptides.withheld}</p>
        ) : peptides.cards.length === 0 ? (
          <p className="mt-3 text-sm text-mute">Nothing fits your goals and risk tolerance. Training, food, and sleep are the whole plan.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {peptides.cards.slice(0, 4).map((card) => (
              <li key={card.slug}>
                <Link href={`/peptides/${card.slug}`} className="block h-full rounded-2xl border border-rule bg-paper p-4 text-ink no-underline hover:border-pine">
                  <span className="text-xs text-mute">For {card.goal.toLowerCase()}</span>
                  <span className="mt-1 block font-medium">{card.name}</span>
                  <span className="mt-1 block text-sm text-mute">
                    {card.protocol ? `Start at ${card.protocol.start} · typical ${card.protocol.typical}` : "No published protocol yet"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {peptides?.notes.length ? <p className="mt-3 text-xs text-mute">{peptides.notes.join(" ")}</p> : null}
        <p className="mt-3 text-xs text-mute">
          Starting amounts are each published protocol&apos;s first step. Most of these are research compounds with limited
          human data; stop and see a clinician if side effects appear.
        </p>
      </section>
    </div>
  );
}
