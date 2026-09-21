"use client";

import { useState } from "react";
import { goals, type GoalId } from "@/lib/plan/types";
import {
  conditions,
  sexes,
  tolerances,
  type ConditionId,
  type Sex,
  type Tolerance,
  type UserContext,
} from "@/lib/today/types";

const LB_PER_KG = 2.20462;
const CM_PER_IN = 2.54;
const MAX_GOALS = 3;

type Draft = {
  units: "metric" | "imperial";
  age: string;
  sex: Sex | "";
  heightCm: string;
  heightFt: string;
  heightIn: string;
  weight: string;
  targetWeight: string;
  trainingDays: string;
  goals: GoalId[];
  tolerance: Tolerance;
  conditions: ConditionId[];
  medications: string;
  supplements: string;
  allergies: string;
};

function toDraft(profile: UserContext | null): Draft {
  if (!profile) {
    return {
      units: "metric",
      age: "",
      sex: "",
      heightCm: "",
      heightFt: "",
      heightIn: "",
      weight: "",
      targetWeight: "",
      trainingDays: "3",
      goals: [],
      tolerance: "moderate",
      conditions: [],
      medications: "",
      supplements: "",
      allergies: "",
    };
  }
  const imperial = profile.units === "imperial";
  const totalIn = profile.heightCm / CM_PER_IN;
  const toUnit = (kg: number) => (imperial ? (kg * LB_PER_KG).toFixed(1) : kg.toFixed(1));
  return {
    units: profile.units,
    age: String(profile.age),
    sex: profile.sex,
    heightCm: String(Math.round(profile.heightCm)),
    heightFt: String(Math.floor(totalIn / 12)),
    heightIn: String(Math.round(totalIn % 12)),
    weight: toUnit(profile.weightKg),
    targetWeight: toUnit(profile.targetWeightKg),
    trainingDays: String(profile.trainingDays),
    goals: profile.goals,
    tolerance: profile.tolerance,
    conditions: profile.conditions,
    medications: profile.medications,
    supplements: profile.supplements,
    allergies: profile.allergies,
  };
}

function parse(draft: Draft): { profile?: UserContext; error?: string } {
  const imperial = draft.units === "imperial";
  const age = Number(draft.age);
  const heightCm = imperial
    ? (Number(draft.heightFt) * 12 + Number(draft.heightIn || 0)) * CM_PER_IN
    : Number(draft.heightCm);
  const toKg = (value: string) => (imperial ? Number(value) / LB_PER_KG : Number(value));
  const weightKg = toKg(draft.weight);
  const targetWeightKg = draft.targetWeight ? toKg(draft.targetWeight) : weightKg;

  if (!Number.isFinite(age) || age < 13 || age > 100) return { error: "Enter an age between 13 and 100." };
  if (!draft.sex) return { error: "Choose the sex used for the calorie estimate." };
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) return { error: "Enter a height between 120 and 230 cm (3′11″–7′6″)." };
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 300) return { error: "Enter a current weight between 30 and 300 kg (66–660 lb)." };
  if (!Number.isFinite(targetWeightKg) || targetWeightKg < 30 || targetWeightKg > 300) return { error: "Target weight is out of range." };
  if (draft.goals.length === 0) return { error: "Pick at least one goal." };

  return {
    profile: {
      age: Math.round(age),
      sex: draft.sex,
      heightCm: Math.round(heightCm),
      weightKg: Math.round(weightKg * 10) / 10,
      targetWeightKg: Math.round(targetWeightKg * 10) / 10,
      trainingDays: Number(draft.trainingDays),
      goals: draft.goals,
      tolerance: draft.tolerance,
      conditions: draft.conditions,
      medications: draft.medications.trim(),
      supplements: draft.supplements.trim(),
      allergies: draft.allergies.trim(),
      units: draft.units,
    },
  };
}

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const label = "mb-1.5 block text-sm";

export function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: UserContext | null;
  onSave: (profile: UserContext) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const imperial = draft.units === "imperial";
  const weightUnit = imperial ? "lb" : "kg";

  function toggleGoal(goal: GoalId) {
    setDraft((current) => {
      if (current.goals.includes(goal)) return { ...current, goals: current.goals.filter((g) => g !== goal) };
      if (current.goals.length >= MAX_GOALS) return current;
      return { ...current, goals: [...current.goals, goal] };
    });
  }

  function toggleCondition(id: ConditionId) {
    setDraft((current) => ({
      ...current,
      conditions: current.conditions.includes(id)
        ? current.conditions.filter((c) => c !== id)
        : [...current.conditions, id],
    }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = parse(draft);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    onSave(result.profile!);
  }

  return (
    <form onSubmit={submit} className="space-y-10 rounded-3xl border border-rule bg-sheet p-5 sm:p-8" noValidate>
      <div>
        <p className="eyebrow">Your context</p>
        <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
          {initial ? "Edit profile" : "Set up your profile"}
        </h2>
        <p className="mt-2 max-w-prose text-sm text-mute">
          Stored in this browser only. Nothing is sent to a server. It sets your
          targets and hides compounds that do not fit your history.
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="eyebrow mb-3">Body</legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Units">
          {(["metric", "imperial"] as const).map((unit) => (
            <Chip key={unit} active={draft.units === unit} onClick={() => set("units", unit)} role="radio">
              {unit === "metric" ? "kg · cm" : "lb · ft"}
            </Chip>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="p-age" className={label}>Age</label>
            <input id="p-age" inputMode="numeric" value={draft.age} onChange={(e) => set("age", e.target.value)} className={field} />
          </div>
          <div>
            <span className={label} id="p-sex">Sex (for the calorie formula)</span>
            <div className="flex gap-2" role="radiogroup" aria-labelledby="p-sex">
              {sexes.map((sex) => (
                <Chip key={sex.id} active={draft.sex === sex.id} onClick={() => set("sex", sex.id)} role="radio">
                  {sex.label}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            {imperial ? (
              <>
                <span className={label} id="p-height">Height</span>
                <div className="flex gap-2" aria-labelledby="p-height" role="group">
                  <input aria-label="Feet" placeholder="ft" inputMode="numeric" value={draft.heightFt} onChange={(e) => set("heightFt", e.target.value)} className={field} />
                  <input aria-label="Inches" placeholder="in" inputMode="numeric" value={draft.heightIn} onChange={(e) => set("heightIn", e.target.value)} className={field} />
                </div>
              </>
            ) : (
              <>
                <label htmlFor="p-height-cm" className={label}>Height (cm)</label>
                <input id="p-height-cm" inputMode="numeric" value={draft.heightCm} onChange={(e) => set("heightCm", e.target.value)} className={field} />
              </>
            )}
          </div>
          <div>
            <label htmlFor="p-weight" className={label}>Current weight ({weightUnit})</label>
            <input id="p-weight" inputMode="decimal" value={draft.weight} onChange={(e) => set("weight", e.target.value)} className={field} />
          </div>
          <div>
            <label htmlFor="p-target" className={label}>Target weight ({weightUnit})</label>
            <input id="p-target" inputMode="decimal" value={draft.targetWeight} onChange={(e) => set("targetWeight", e.target.value)} placeholder="Same as current" className={field} />
          </div>
          <div>
            <label htmlFor="p-days" className={label}>Training days per week</label>
            <select id="p-days" value={draft.trainingDays} onChange={(e) => set("trainingDays", e.target.value)} className={field}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-1">Goals</legend>
        <p className="mb-3 text-sm text-mute">Up to three. The first one you pick is primary.</p>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => {
            const index = draft.goals.indexOf(goal.id);
            return (
              <Chip key={goal.id} active={index >= 0} onClick={() => toggleGoal(goal.id)}>
                {index >= 0 ? `${index + 1}. ` : ""}
                {goal.label}
              </Chip>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Risk tolerance</legend>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
          {tolerances.map((level) => (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={draft.tolerance === level.id}
              onClick={() => set("tolerance", level.id)}
              className={`rounded-2xl border px-4 py-3 text-left ${draft.tolerance === level.id ? "border-pine bg-pine/10" : "border-rule hover:border-ink"}`}
            >
              <span className="block font-medium">{level.label}</span>
              <span className="mt-1 block text-sm text-mute">{level.blurb}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow mb-3">Health history</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {conditions.map((condition) => (
            <label key={condition.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border border-rule px-4 py-2 hover:border-ink">
              <input
                type="checkbox"
                checked={draft.conditions.includes(condition.id)}
                onChange={() => toggleCondition(condition.id)}
                className="size-4 accent-pine"
              />
              <span className="text-sm">{condition.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="p-meds" className={label}>Medications</label>
            <textarea id="p-meds" rows={3} value={draft.medications} onChange={(e) => set("medications", e.target.value)} placeholder="e.g. lisinopril, metformin" className={field} />
          </div>
          <div>
            <label htmlFor="p-supps" className={label}>Current supplements</label>
            <textarea id="p-supps" rows={3} value={draft.supplements} onChange={(e) => set("supplements", e.target.value)} placeholder="e.g. creatine, vitamin D" className={field} />
          </div>
          <div>
            <label htmlFor="p-allergies" className={label}>Allergies</label>
            <textarea id="p-allergies" rows={3} value={draft.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="e.g. shellfish" className={field} />
          </div>
        </div>
      </fieldset>

      {error ? (
        <p role="alert" className="rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary">Save profile</button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        ) : null}
      </div>
    </form>
  );
}

export function Chip({
  active,
  onClick,
  children,
  role,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  role?: "radio";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      aria-checked={role ? active : undefined}
      aria-pressed={role ? undefined : active}
      className={`min-h-11 rounded-full border px-4 text-sm ${active ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
    >
      {children}
    </button>
  );
}
