"use client";

import { useState } from "react";
import { checkPair, mixPeptides, mixStatuses, worstStatus, type MixStatus } from "@/lib/data/mixing";

const MAX = 5;
const statusInfo = new Map(mixStatuses.map((status) => [status.slug, status]));
const nameOf = new Map(mixPeptides.map((peptide) => [peptide.slug, peptide.name]));

const verdict: Record<MixStatus, string> = {
  blend: "These are sold together in one vial.",
  mixed: "People commonly mix these, but nobody has published stability data for it.",
  unknown: "At least one pair has no data. Inject those separately.",
  separate: "At least one pair is usually kept apart.",
  never: "At least one pair should not share a syringe.",
};

export function SameSyringeChecker() {
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(slug: string) {
    setPicked((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length < MAX
          ? [...current, slug]
          : current,
    );
  }

  const results = picked.flatMap((a, index) =>
    picked.slice(index + 1).map((b) => ({ a, b, ...checkPair(a, b) })),
  );
  const overall = results.length ? worstStatus(results.map((result) => result.status)) : null;

  return (
    <div className="border border-rule bg-sheet rounded-3xl">
      <div className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3">
        <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
          Same-syringe checker
        </h2>
        <p className="font-mono text-[0.7rem] text-mute">
          {picked.length} of {MAX} selected
        </p>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <p className="text-sm text-ink">Pick 2–5 peptides</p>
            {picked.length ? (
              <button
                type="button"
                onClick={() => setPicked([])}
                className="text-xs text-mute underline-offset-2 hover:text-ink hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {mixPeptides.map((peptide) => {
              const on = picked.includes(peptide.slug);
              const full = !on && picked.length >= MAX;
              return (
                <button
                  key={peptide.slug}
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => toggle(peptide.slug)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 ${
                    on
                      ? "border-ink bg-ink text-paper"
                      : "border-rule bg-paper text-ink hover:border-mute"
                  }`}
                >
                  {peptide.name}
                </button>
              );
            })}
          </div>
        </div>

        {overall ? (
          <div className="space-y-3">
            <p className="flex items-start gap-2 text-sm text-ink">
              <Dot status={overall} />
              <span>
                <strong className="font-medium">{statusInfo.get(overall)?.name}.</strong>{" "}
                {verdict[overall]}
              </span>
            </p>
            <ul className="divide-y divide-rule border-y border-rule">
              {results.map((result) => (
                <li key={`${result.a}|${result.b}`} className="flex items-start gap-2 py-2.5 text-sm">
                  <Dot status={result.status} />
                  <div>
                    <p className="text-ink">
                      {nameOf.get(result.a)} + {nameOf.get(result.b)}
                      <span className="ml-2 text-xs text-mute">{statusInfo.get(result.status)?.name}</span>
                    </p>
                    <p className="text-xs text-mute">{result.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-mute">Select at least two to see each pair.</p>
        )}

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">
          {mixStatuses.map((status) => (
            <li key={status.slug} className="flex items-center gap-1.5">
              <Dot status={status.slug} />
              {status.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Dot({ status }: { status: MixStatus }) {
  return (
    <span
      aria-hidden
      className="mt-1.5 inline-block size-2 shrink-0 rounded-full"
      style={{ backgroundColor: statusInfo.get(status)?.color }}
    />
  );
}
