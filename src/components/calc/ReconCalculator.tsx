"use client";

import { useId, useMemo, useState } from "react";
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

// Horizontal U-100 syringe, drawn to match the NovaEvum calculator: plunger
// left, needle right, fill growing from the seal. A tick every 5 units and a
// number every 10. The draw is always in real text beside it.
const BARREL_X = 56;
const BARREL_W = 364;
const BARREL_Y = 22;
const BARREL_H = 26;
const CAPACITY = 100;
const TICKS = Array.from({ length: CAPACITY / 5 }, (_, index) => (index + 1) * 5);

function Syringe({
  fillPercent,
  over,
  units,
}: {
  fillPercent: number;
  over: boolean;
  units: number;
}) {
  const clipId = `syringe-clip-${useId().replace(/:/g, "")}`;
  const fillW = ((over ? 100 : fillPercent) / 100) * BARREL_W;
  const drawX = BARREL_X + fillW;

  return (
    <figure className="m-0">
      <svg
        viewBox="0 0 480 82"
        role="img"
        aria-label={`Draw mark at ${formatNumber(units, 1)} units on a 100-unit syringe`}
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${clipId}-shine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} />
          </clipPath>
        </defs>

        {/* Plunger: thumb rest, shaft, finger flanges */}
        <rect x="4" y="20" width="8" height="30" rx="2" fill="#8a8e93" />
        <rect x="0" y="16" width="16" height="6" rx="1.5" fill="#5c6168" />
        <rect x="0" y="48" width="16" height="6" rx="1.5" fill="#5c6168" />
        <rect x="12" y="32" width="36" height="6" rx="1.5" fill="#8a8e93" />
        <rect x="46" y="10" width="6" height="10" rx="1.5" fill="#8a8e93" />
        <rect x="46" y="50" width="6" height="10" rx="1.5" fill="#8a8e93" />

        {/* Barrel */}
        <rect
          x="50"
          y={BARREL_Y}
          width="370"
          height={BARREL_H}
          rx="3"
          fill="#fcfbf8"
          stroke="#d6d2c4"
          strokeWidth="1"
        />

        {/* Fluid and glass highlight, clipped to the measurable barrel */}
        <g clipPath={`url(#${clipId})`}>
          {fillW > 0 ? (
            <>
              <rect
                x={BARREL_X}
                y={BARREL_Y}
                width={fillW}
                height={BARREL_H}
                fill={over ? "#ff6b6b" : "#3f9e93"}
                opacity="0.5"
              />
              <rect
                x={drawX - 2}
                y={BARREL_Y}
                width="2"
                height={BARREL_H}
                fill={over ? "#c0392b" : "#256b62"}
                opacity="0.85"
              />
            </>
          ) : null}
          <rect
            x={BARREL_X}
            y={BARREL_Y}
            width={BARREL_W}
            height="9"
            fill={`url(#${clipId}-shine)`}
          />
        </g>

        {/* Rubber seal: the leading edge you read */}
        <rect x="50" y={BARREL_Y} width="6" height={BARREL_H} fill="#0e1621" />

        {/* Scale */}
        <g stroke="var(--color-mute)" strokeWidth="1">
          {TICKS.map((at) => {
            const x = BARREL_X + (at / CAPACITY) * BARREL_W;
            return (
              <line
                key={at}
                x1={x}
                y1={BARREL_Y + BARREL_H}
                x2={x}
                y2={BARREL_Y + BARREL_H + (at % 10 === 0 ? 7 : 3.5)}
              />
            );
          })}
        </g>
        <g
          fill="var(--color-mute)"
          fontSize="11"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
        >
          {TICKS.filter((at) => at % 10 === 0).map((at) => (
            <text key={at} x={BARREL_X + (at / CAPACITY) * BARREL_W} y="68">
              {at}
            </text>
          ))}
        </g>

        {/* Draw point */}
        {fillW > 0 ? (
          <g fill="var(--color-ink)">
            <line
              x1={drawX}
              y1="13"
              x2={drawX}
              y2={BARREL_Y}
              stroke="var(--color-ink)"
              strokeWidth="1.5"
            />
            <circle cx={drawX} cy="12" r="3" />
            <text
              x={drawX}
              y="8"
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {formatNumber(units, 1)}u
            </text>
          </g>
        ) : null}

        {/* Hub and needle */}
        <rect x="420" y="33" width="5" height="4" rx="1" fill="#8a8e93" />
        <rect x="425" y="34.4" width="22" height="1.8" rx="0.4" fill="#8a8e93" />
        <polygon points="447,34.4 450,35.3 447,36.2" fill="#5c6168" />
      </svg>

      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs text-mute">
        <span>
          <strong className="font-mono font-medium text-ink">{formatNumber(units, 1)} u</strong>{" "}
          draw point
        </span>
        <span className="text-right">
          <strong className="font-mono font-medium text-ink">100-unit</strong> syringe ·{" "}
          {formatNumber(units / 100, 3)} mL
        </span>
      </figcaption>
    </figure>
  );
}
