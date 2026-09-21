"use client";

import { useMemo, useState } from "react";
import { calculateRecon, formatNumber } from "@/lib/calc";

type Props = {
  defaultVialMg?: number;
  defaultWaterMl?: number;
  defaultDoseMcg?: number;
  compoundName?: string;
};

export function ReconCalculator({
  defaultVialMg = 10,
  defaultWaterMl = 2,
  defaultDoseMcg = 250,
  compoundName,
}: Props) {
  const [vialMg, setVialMg] = useState(String(defaultVialMg));
  const [waterMl, setWaterMl] = useState(String(defaultWaterMl));
  const [doseMcg, setDoseMcg] = useState(String(defaultDoseMcg));

  const result = useMemo(
    () =>
      calculateRecon({
        vialMg: Number(vialMg),
        waterMl: Number(waterMl),
        doseMcg: Number(doseMcg),
      }),
    [vialMg, waterMl, doseMcg],
  );

  const unitPercent = result
    ? Math.min(100, Math.max(0, (result.drawUnits / 100) * 100))
    : 0;
  const overSyringe = result ? result.drawUnits > 100 : false;

  return (
    <div className="border border-rule bg-sheet rounded-3xl">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3">
        <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
          Reconstitution worksheet
        </h2>
        {compoundName ? (
          <p className="font-mono text-[0.7rem] text-mute">{compoundName}</p>
        ) : null}
      </div>

      <div className="grid gap-6 p-4 sm:grid-cols-2">
        <fieldset className="space-y-4">
          <legend className="sr-only">Vial, water, and intended amount</legend>
          <Field
            id="vial-mg"
            label="Vial fill"
            unit="mg"
            value={vialMg}
            onChange={setVialMg}
          />
          <Field
            id="water-ml"
            label="Bacteriostatic water"
            unit="mL"
            value={waterMl}
            onChange={setWaterMl}
            step="0.1"
          />
          <Field
            id="dose-mcg"
            label="Intended amount"
            unit="mcg"
            value={doseMcg}
            onChange={setDoseMcg}
            hint="1 mg = 1000 mcg"
          />
        </fieldset>

        <div className="space-y-4">
          {result ? (
            <>
              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <Stat label="Concentration" value={`${formatNumber(result.mgPerMl)} mg/mL`} />
                <Stat label="Per insulin unit" value={`${formatNumber(result.mcgPerUnit, 1)} mcg`} />
                <Stat
                  label="Draw"
                  value={`${formatNumber(result.drawUnits, 1)} units`}
                  detail={`${formatNumber(result.drawMl, 3)} mL`}
                />
                <Stat
                  label="Amounts in vial"
                  value={formatNumber(result.dosesPerVial, 1)}
                />
              </dl>

              <Syringe fillPercent={unitPercent} over={overSyringe} units={result.drawUnits} />

              {overSyringe ? (
                <p className="border border-warn/30 bg-warn-tint px-3 py-2 text-sm text-warn rounded-3xl">
                  This draw is past 100 units (1 mL). Add more water to the vial,
                  or split across syringes.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-mute">
              Enter a vial fill, water volume, and amount greater than zero.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  unit,
  value,
  onChange,
  step = "1",
  hint,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm text-ink">
        {label}
      </label>
      <div className="flex border border-rule bg-paper focus-within:border-pine rounded-xl overflow-hidden">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step={step}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
        <span className="border-l border-rule px-3 py-2 font-mono text-xs text-mute">
          {unit}
        </span>
      </div>
      {hint ? <p className="mt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="font-mono text-sm text-ink">
        {value}
        {detail ? <span className="ml-2 text-mute">({detail})</span> : null}
      </dd>
    </div>
  );
}

function Syringe({
  fillPercent,
  over,
  units,
}: {
  fillPercent: number;
  over: boolean;
  units: number;
}) {
  return (
    <div>
      <p className="mb-2 text-xs text-mute">U-100 syringe · 100 units = 1 mL</p>
      <div
        className="relative h-8 border border-ink/40 bg-paper"
        role="img"
        aria-label={`Draw mark at ${formatNumber(units, 1)} units on a 100-unit syringe`}
      >
        <div
          className={`absolute inset-y-0 left-0 ${over ? "bg-warn/50" : "bg-pine/35"}`}
          style={{ width: `${over ? 100 : fillPercent}%` }}
        />
        <div className="absolute inset-0 flex">
          {Array.from({ length: 11 }, (_, index) => (
            <div
              key={index}
              className="relative flex-1 border-r border-ink/20 last:border-r-0"
            >
              <span
                className={`absolute -bottom-5 font-mono text-[0.6rem] text-mute ${index === 0 ? "left-0" : index === 10 ? "right-0" : "left-0 -translate-x-1/2"}`}
              >
                {index * 10}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-5" />
    </div>
  );
}
