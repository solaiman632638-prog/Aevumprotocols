"use client";

import Link from "next/link";
import { useState } from "react";
import { buildPlan, reconFor } from "@/lib/plan/engine";
import { loadPlan } from "@/lib/plan/storage";
import { formatNumber } from "@/lib/calc";
import type { PlanProfile, PlanResult } from "@/lib/plan/types";
import { goals } from "@/lib/plan/types";

function readPlan(): { profile: PlanProfile | null; plan: PlanResult | null } {
  const profile = loadPlan();
  return { profile, plan: profile ? buildPlan(profile) : null };
}

export function PlanResults() {
  const [{ profile, plan }] = useState(readPlan);

  if (profile === null) {
    return (
      <div className="border border-rule bg-sheet px-5 py-8 rounded-3xl">
        <p>No intake saved on this device.</p>
        <Link
          href="/plan"
          className="btn-primary mt-4"
        >
          Fill in your goals
        </Link>
      </div>
    );
  }

  if (!plan) return null;

  const goalNames = profile.goals
    .map((id) => goals.find((goal) => goal.id === id)?.label ?? id)
    .join(", ");

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">
          {profile.risk} · {goalNames}
        </p>
        <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
          {plan.title}
        </h1>
        <p className="mt-3 max-w-2xl text-mute">{plan.summary}</p>
        {plan.blockReason ? (
          <p className="mt-4 border border-warn/30 bg-warn-tint px-4 py-3 text-warn rounded-3xl">
            {plan.blockReason}
          </p>
        ) : null}
      </header>

      {plan.peptides.length > 0 ? (
        <section>
          <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
            Peptides
          </h2>
          <ol className="mt-4 space-y-4">
            {plan.peptides.map((item, index) => {
              const recon = reconFor(item);
              return (
                <li key={item.slug} className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
                  <p className="eyebrow">
                    {index + 1} of {plan.peptides.length}
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-medium tracking-[-0.02em]">{item.name}</h3>
                    <Link
                      href={`/protocols/${item.slug}`}
                      className="font-mono text-[0.75rem] text-pine-deep no-underline hover:underline"
                    >
                      Full sheet
                    </Link>
                  </div>
                  <p className="mt-2">{item.why}</p>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-mute">Amount</dt>
                      <dd className="font-mono text-sm">
                        {item.amount} · {item.frequency}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-mute">Vial / water</dt>
                      <dd className="font-mono text-sm">
                        {item.vialMg} mg in {item.waterMl} mL
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-mute">U-100 draw</dt>
                      <dd className="font-mono text-sm">
                        {recon
                          ? `${formatNumber(recon.drawUnits, 1)} units (${formatNumber(recon.drawMl, 3)} mL)`
                          : "see calculator"}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section>
        <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
          Supplements
        </h2>
        <div className="mt-4 overflow-x-auto border border-rule rounded-3xl">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-rule bg-sheet">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {plan.supplements.map((item) => (
                <tr key={item.name} className="border-b border-rule last:border-b-0">
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2 font-mono text-[0.8rem]">{item.amount}</td>
                  <td className="px-3 py-2">{item.timing}</td>
                  <td className="px-3 py-2 text-mute">{item.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {plan.notes.length > 0 ? (
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {plan.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-mute">{plan.holdWhen}</p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/monitor"
          className="btn-primary"
        >
          Connect a strap
        </Link>
        <Link
          href="/plan"
          className="btn-secondary"
        >
          Change answers
        </Link>
      </div>
    </div>
  );
}
