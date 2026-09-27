"use client";

import { BodyMap } from "@/components/peptides/BodyMap";
import {
  compounds,
  cycleLabel,
  getCompound,
  scheduleLabel,
  symptoms,
  urgentSymptoms,
  type SiteId,
  type SymptomId,
  type UrgentSymptomId,
} from "@/lib/peptides/catalog";
import type { DoseEntry, Reaction } from "@/lib/today/types";

/** Matches what someone types against the register, ignoring case and spacing. */
function matchCompound(text: string) {
  const needle = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return undefined;
  return compounds.find(
    (model) => model.name.toLowerCase() === needle || model.slug === needle.replace(/\s+/g, "-"),
  );
}

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const severityLabel = ["", "Mild", "Moderate", "Severe"] as const;

function newDose(): DoseEntry {
  return { id: Math.random().toString(36).slice(2, 10), compound: "", amount: 0, unit: "mg" };
}

export function PeptideLog({
  carried = 0,
  doses,
  reactions,
  urgent,
  onDoses,
  onReactions,
  onUrgent,
  suggestion,
}: {
  /** How many rows were carried over from the last check-in. */
  carried?: number;
  doses: DoseEntry[];
  reactions: Reaction[];
  urgent: UrgentSymptomId[];
  onDoses: (doses: DoseEntry[]) => void;
  onReactions: (reactions: Reaction[]) => void;
  onUrgent: (urgent: UrgentSymptomId[]) => void;
  suggestion?: SiteId;
}) {
  const update = (id: string, patch: Partial<DoseEntry>) => onDoses(doses.map((dose) => (dose.id === id ? { ...dose, ...patch } : dose)));

  function cycleSymptom(symptom: SymptomId) {
    const current = reactions.find((reaction) => reaction.symptom === symptom)?.severity ?? 0;
    const next = ((current + 1) % 4) as 0 | 1 | 2 | 3;
    const rest = reactions.filter((reaction) => reaction.symptom !== symptom);
    onReactions(next === 0 ? rest : [...rest, { symptom, severity: next }]);
  }

  return (
    <fieldset className="space-y-6">
      <legend className="eyebrow mb-3">Peptides today</legend>

      {doses.length === 0 ? (
        <p className="text-sm text-mute">Nothing logged. Add each peptide you took today.</p>
      ) : carried > 0 ? (
        <p className="rounded-2xl border border-rule px-4 py-3 text-sm text-mute">
          {carried === 1 ? "One peptide is" : `${carried} peptides are`} filled in from your last
          check-in, on the schedule each one runs on. Check it, change it, or remove anything you
          did not take — nothing is saved until you do.
        </p>
      ) : null}

      <ul className="space-y-4">
        {doses.map((dose, index) => {
          const model = getCompound(dose.compound);
          return (
            <li key={dose.id} className="rounded-2xl border border-rule p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-mute">Dose {index + 1}</p>
                <button type="button" onClick={() => onDoses(doses.filter((d) => d.id !== dose.id))} className="text-xs text-mute underline underline-offset-2 hover:text-ink">
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`dose-compound-${dose.id}`} className="mb-1.5 block text-sm">Peptide</label>
                    <input
                      id={`dose-compound-${dose.id}`}
                      list="peptide-names"
                      autoComplete="off"
                      placeholder="Type a name, e.g. BPC-157"
                      value={model?.name ?? dose.label ?? ""}
                      onChange={(event) => {
                        const text = event.target.value;
                        const picked = matchCompound(text);
                        update(dose.id, picked
                          ? { compound: picked.slug, label: undefined, unit: picked.unit }
                          : { compound: "", label: text });
                      }}
                      className={field}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor={`dose-amount-${dose.id}`} className="mb-1.5 block text-sm">Amount</label>
                      <input
                        id={`dose-amount-${dose.id}`}
                        inputMode="decimal"
                        value={dose.amount ? String(dose.amount) : ""}
                        onChange={(event) => update(dose.id, { amount: Number(event.target.value) || 0 })}
                        placeholder={model ? String(model.range[0]) : ""}
                        className={field}
                      />
                    </div>
                    <div className="w-28">
                      <label htmlFor={`dose-unit-${dose.id}`} className="mb-1.5 block text-sm">Unit</label>
                      <select id={`dose-unit-${dose.id}`} value={dose.unit} onChange={(event) => update(dose.id, { unit: event.target.value as DoseEntry["unit"] })} className={field}>
                        <option value="mg">mg</option>
                        <option value="mcg">mcg</option>
                      </select>
                    </div>
                  </div>
                  {model ? (
                    <div className="rounded-xl border border-rule px-3 py-2.5 text-xs text-mute">
                      <p>
                        <span className="text-ink">{scheduleLabel(model)}</span> · {cycleLabel(model)}
                      </p>
                      <p className="mt-1">
                        {model.evidence === "clinical" ? "Approved dosing" : "Reported research exposure"}{" "}
                        {model.range[0]}–{model.range[1]} {model.unit}
                        {model.components ? " (whole blend)" : ""}.
                        {model.evidence === "clinical" ? "" : " No amount here is established as safe."}
                      </p>
                    </div>
                  ) : dose.label ? (
                    <p className="text-xs text-mute">
                      Not in Aevum&apos;s register, so it is saved with your check-in but gets no
                      schedule or guidance.
                    </p>
                  ) : null}
                </div>
                <BodyMap value={dose.site} onChange={(site) => update(dose.id, { site })} suggestion={dose.site ? undefined : suggestion} />
              </div>
            </li>
          );
        })}
      </ul>

      <datalist id="peptide-names">
        {compounds.map((model) => (
          <option key={model.slug} value={model.name} />
        ))}
      </datalist>

      <button type="button" onClick={() => onDoses([...doses, newDose()])} className="btn-secondary">
        + Add a peptide
      </button>

      <div className="rounded-2xl border border-warn/40 bg-warn-tint p-4">
        <p className="text-sm font-medium text-warn">Anything serious today?</p>
        <p className="mt-1 text-xs text-warn/90">
          Tap anything you have had. These need medical care, not a dose change.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {urgentSymptoms.map((symptom) => {
            const on = urgent.includes(symptom.id);
            return (
              <button
                key={symptom.id}
                type="button"
                aria-pressed={on}
                onClick={() => onUrgent(on ? urgent.filter((id) => id !== symptom.id) : [...urgent, symptom.id])}
                className={`min-h-11 rounded-full border px-4 text-sm ${on ? "border-warn bg-warn text-on-accent" : "border-warn/40 text-warn hover:border-warn"}`}
              >
                {symptom.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm">Side effects today</p>
        <p className="mt-1 text-xs text-mute">Tap to cycle: mild, moderate, severe, off.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {symptoms.map((symptom) => {
            const severity = reactions.find((reaction) => reaction.symptom === symptom.id)?.severity ?? 0;
            const tone = severity === 3 ? "border-warn bg-warn text-on-accent" : severity === 2 ? "border-warn/60 bg-warn-tint text-warn" : severity === 1 ? "border-pine bg-pine/15 text-ink" : "border-rule text-mute hover:border-ink hover:text-ink";
            return (
              <button
                key={symptom.id}
                type="button"
                onClick={() => cycleSymptom(symptom.id)}
                aria-label={`${symptom.label}: ${severity ? severityLabel[severity] : "none"}`}
                className={`min-h-11 rounded-full border px-4 text-sm ${tone}`}
              >
                {symptom.label}
                {severity ? <span className="ml-1.5 text-xs opacity-80">· {severityLabel[severity]}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}

