"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ageBands,
  experienceLevels,
  flags,
  goals,
  riskLevels,
  type AgeBand,
  type Experience,
  type FlagId,
  type GoalId,
  type PlanProfile,
  type RiskLevel,
} from "@/lib/plan/types";
import { loadPlan, savePlan } from "@/lib/plan/storage";

const STEPS = ["Goals", "Risk", "You", "Confirm"] as const;

const empty: PlanProfile = {
  goals: [],
  risk: "moderate",
  ageBand: "30-39",
  experience: "some",
  flags: [],
};

export function PlanWizard({ initial }: { initial?: PlanProfile | null }) {
  const router = useRouter();
  const [profile, setProfile] = useState<PlanProfile>(
    () => initial ?? loadPlan() ?? empty,
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canNext = useMemo(() => {
    if (step === 0) return profile.goals.length > 0;
    return true;
  }, [step, profile.goals.length]);

  function toggleGoal(id: GoalId) {
    setProfile((current) => {
      const has = current.goals.includes(id);
      if (has) return { ...current, goals: current.goals.filter((item) => item !== id) };
      if (current.goals.length >= 3) return current;
      return { ...current, goals: [...current.goals, id] };
    });
    setError(null);
  }

  function toggleFlag(id: FlagId) {
    setProfile((current) => {
      const has = current.flags.includes(id);
      return {
        ...current,
        flags: has ? current.flags.filter((item) => item !== id) : [...current.flags, id],
      };
    });
  }

  function goNext() {
    if (!canNext) {
      setError("Pick at least one goal. The first one you pick is primary.");
      return;
    }
    if (step < STEPS.length - 1) setStep((value) => value + 1);
  }

  function finish() {
    savePlan(profile);
    router.push("/plan/results");
  }

  return (
    <div className="border border-rule bg-sheet rounded-3xl">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <p className="eyebrow">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
        <ol className="flex gap-1" aria-hidden="true">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={`h-1.5 w-8 ${index <= step ? "bg-pine" : "bg-rule"}`}
            />
          ))}
        </ol>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {step === 0 ? (
          <fieldset>
            <legend className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              What are you working on?
            </legend>
            <p className="mt-2 text-sm text-mute">
              Up to three. The first one you select is primary — it gets the first vial.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {goals.map((goal) => {
                const selected = profile.goals.includes(goal.id);
                const primary = profile.goals[0] === goal.id;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`min-h-11 border px-4 py-3 text-left ${selected ? "border-pine bg-paper" : "border-rule bg-sheet hover:border-ink"} rounded-3xl`}
                    aria-pressed={selected}
                  >
                    <span className="block font-medium">
                      {goal.label}
                      {primary ? (
                        <span className="ml-2 font-mono text-[0.65rem] text-brass">
                          primary
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-sm text-mute">{goal.blurb}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset>
            <legend className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              How aggressive should the matcher be?
            </legend>
            <p className="mt-2 text-sm text-mute">
              This caps how many vials you get and which dose row on each sheet.
            </p>
            <div className="mt-5 space-y-2">
              {riskLevels.map((level) => (
                <label
                  key={level.id}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 border px-4 py-3 ${profile.risk === level.id ? "border-pine bg-paper" : "border-rule hover:border-ink"} rounded-2xl`}
                >
                  <input
                    type="radio"
                    name="risk"
                    value={level.id}
                    checked={profile.risk === level.id}
                    onChange={() =>
                      setProfile((current) => ({ ...current, risk: level.id as RiskLevel }))
                    }
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{level.label}</span>
                    <span className="text-sm text-mute">{level.blurb}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <div className="space-y-8">
            <fieldset>
              <legend className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                Age band
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {ageBands.map((band) => (
                  <label
                    key={band.id}
                    className={`min-h-11 cursor-pointer border px-3 py-2 text-sm ${profile.ageBand === band.id ? "border-pine bg-paper" : "border-rule hover:border-ink"} rounded-2xl`}
                  >
                    <input
                      type="radio"
                      name="age"
                      value={band.id}
                      checked={profile.ageBand === band.id}
                      onChange={() =>
                        setProfile((current) => ({ ...current, ageBand: band.id as AgeBand }))
                      }
                      className="sr-only"
                    />
                    {band.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-medium">Reconstitution experience</legend>
              <div className="mt-3 space-y-2">
                {experienceLevels.map((item) => (
                  <label
                    key={item.id}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 border px-4 py-2 ${profile.experience === item.id ? "border-pine bg-paper" : "border-rule hover:border-ink"} rounded-2xl`}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={item.id}
                      checked={profile.experience === item.id}
                      onChange={() =>
                        setProfile((current) => ({
                          ...current,
                          experience: item.id as Experience,
                        }))
                      }
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="font-medium">Flags that change the match</legend>
              <p className="mt-1 text-sm text-mute">Leave blank if none apply.</p>
              <div className="mt-3 space-y-2">
                {flags.map((flag) => (
                  <label
                    key={flag.id}
                    className="flex min-h-11 cursor-pointer items-center gap-3 border border-rule px-4 py-2 hover:border-ink rounded-2xl"
                  >
                    <input
                      type="checkbox"
                      checked={profile.flags.includes(flag.id)}
                      onChange={() => toggleFlag(flag.id)}
                    />
                    {flag.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">Confirm</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-mute">Goals</dt>
                <dd>{profile.goals.join(" → ") || "None"}</dd>
              </div>
              <div>
                <dt className="text-mute">Risk</dt>
                <dd>{profile.risk}</dd>
              </div>
              <div>
                <dt className="text-mute">Age / experience</dt>
                <dd>
                  {profile.ageBand} · {profile.experience}
                </dd>
              </div>
              <div>
                <dt className="text-mute">Flags</dt>
                <dd>{profile.flags.length ? profile.flags.join(", ") : "None"}</dd>
              </div>
            </dl>
            <p className="mt-6 text-sm text-mute">
              This matcher emits catalog worksheets and supplement rows. It is not a
              prescription and not medical advice.
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-warn">{error}</p> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule px-4 py-3">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
          className="btn-secondary disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="btn-primary"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="btn-primary"
          >
            Build my worksheet
          </button>
        )}
      </div>
    </div>
  );
}
