"use client";

import { BodyMap } from "@/components/peptides/BodyMap";
import { getCompound, symptoms, type SiteId, type SymptomId } from "@/lib/peptides/catalog";
import type { DoseEntry, Reaction } from "@/lib/today/types";

const groups: { label: string; slugs: string[] }[] = [
  { label: "Weight and metabolic", slugs: ["retatrutide", "tirzepatide", "semaglutide", "mazdutide", "survodutide", "cagrilintide", "aod-9604", "5-amino-1mq", "slu-pp-332", "l-carnitine"] },
  { label: "Healing and recovery", slugs: ["bpc-157", "tb-500", "wolverine-stack", "kpv", "thymosin-alpha-1", "ll-37"] },
  { label: "Growth hormone", slugs: ["tesamorelin", "sermorelin", "ipamorelin", "cjc-1295-no-dac", "cjc-1295", "cjc-1295-dac", "ghrp-2", "ghrp-6", "kisspeptin-10", "igf-1-des", "igf-1-lr3"] },
  { label: "Skin, tanning, sexual health", slugs: ["ghk-cu", "glow", "klow", "melanotan-2", "melanotan-1", "pt-141"] },
  { label: "Longevity", slugs: ["mots-c", "ss-31", "epitalon", "nad-plus", "glutathione"] },
  { label: "Brain and sleep", slugs: ["semax", "selank", "semax-selank-blend", "pinealon", "dsip"] },
];

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const severityLabel = ["", "Mild", "Moderate", "Severe"] as const;

function newDose(): DoseEntry {
  return { id: Math.random().toString(36).slice(2, 10), compound: "", amount: 0, unit: "mg" };
}

export function PeptideLog({
  doses,
  reactions,
  onDoses,
  onReactions,
  suggestion,
}: {
  doses: DoseEntry[];
  reactions: Reaction[];
  onDoses: (doses: DoseEntry[]) => void;
  onReactions: (reactions: Reaction[]) => void;
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

      {doses.length === 0 ? <p className="text-sm text-mute">Nothing logged. Add each peptide you took today.</p> : null}

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
                    <select
                      id={`dose-compound-${dose.id}`}
                      value={dose.compound}
                      onChange={(event) => {
                        const picked = getCompound(event.target.value);
                        update(dose.id, { compound: event.target.value, unit: picked?.unit ?? dose.unit });
                      }}
                      className={field}
                    >
                      <option value="">Choose…</option>
                      {groups.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.slugs.map((slug) => (
                            <option key={slug} value={slug}>{getCompound(slug)?.name ?? slug}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
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
                    <p className="text-xs text-mute">
                      Protocol range {model.range[0]}–{model.range[1]} {model.unit}
                      {model.components ? " (whole blend)" : ""}.
                    </p>
                  ) : null}
                </div>
                <BodyMap value={dose.site} onChange={(site) => update(dose.id, { site })} suggestion={dose.site ? undefined : suggestion} />
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={() => onDoses([...doses, newDose()])} className="btn-secondary">
        + Add a peptide
      </button>

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

