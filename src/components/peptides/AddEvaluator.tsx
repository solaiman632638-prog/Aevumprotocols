"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getCompound } from "@/lib/peptides/catalog";
import type { RiskTier } from "@/lib/peptides/catalog";
import { addableCompounds, evaluateAddition } from "@/lib/peptides/engine";
import type { UserContext } from "@/lib/today/types";

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";

const tierTone: Record<RiskTier, string> = {
  "Best evidenced": "text-[color:var(--color-recovery)]",
  "Reasonable evidence": "text-mute",
  "Limited evidence": "text-[color:var(--color-strain)]",
  "Most uncertain": "text-warn",
};

const levelTone: Record<string, string> = {
  High: "text-warn",
  Moderate: "text-[color:var(--color-strain)]",
  Low: "text-brass",
  Some: "text-brass",
  Limited: "text-[color:var(--color-strain)]",
  "None identified": "text-warn",
};

/** "I'm considering adding…" — answers whether adding anything is justified. */
export function AddEvaluator({ activeSlugs, context }: { activeSlugs: string[]; context: UserContext }) {
  const [slug, setSlug] = useState("");
  const active = useMemo(
    () => activeSlugs.map((item) => getCompound(item)).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [activeSlugs],
  );
  const options = useMemo(() => addableCompounds(active), [active]);
  const review = useMemo(() => (slug ? evaluateAddition(slug, active, context) : null), [slug, active, context]);

  return (
    <section aria-labelledby="add-heading" className="rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
      <h3 id="add-heading" className="font-display text-2xl font-light tracking-[-0.02em]">
        Considering adding something?
      </h3>
      <p className="mt-2 max-w-prose text-sm text-mute">
        Check it against what you already run before you buy it. Adding nothing
        is often the lower-risk answer.
      </p>

      <div className="mt-4 max-w-sm">
        <label htmlFor="add-compound" className="mb-1.5 block text-sm">Compound</label>
        <select id="add-compound" value={slug} onChange={(event) => setSlug(event.target.value)} className={field}>
          <option value="">Choose…</option>
          {options.map((model) => (
            <option key={model.slug} value={model.slug}>{model.name}</option>
          ))}
        </select>
      </div>

      {review ? (
        <div className="mt-6 space-y-4">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-3">
            <div className="bg-sheet p-4">
              <dt className="text-xs text-mute">Overlap with your regimen</dt>
              <dd className={`mt-1 text-lg ${levelTone[review.overlap]}`}>{review.overlap}</dd>
            </div>
            <div className="bg-sheet p-4">
              <dt className="text-xs text-mute">Human combination evidence</dt>
              <dd className={`mt-1 text-lg ${levelTone[review.combinationEvidence]}`}>{review.combinationEvidence}</dd>
            </div>
            <div className="bg-sheet p-4">
              <dt className="text-xs text-mute">Added complexity</dt>
              <dd className={`mt-1 text-lg ${levelTone[review.addedComplexity]}`}>{review.addedComplexity}</dd>
            </div>
            <div className="bg-sheet p-4 sm:col-span-3">
              <dt className="text-xs text-mute">Evidence ranking</dt>
              <dd className={`mt-1 text-lg ${tierTone[review.risk.tier]}`}>{review.risk.tier}</dd>
              <dd className="mt-1 text-sm text-mute">{review.risk.reasons.join(". ")}.</dd>
            </div>
          </dl>

          <div className="rounded-2xl border border-rule p-4">
            <p className="eyebrow !text-mute">Aevum recommendation</p>
            <p className="mt-2">{review.recommendation}</p>
            {review.reasons.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-mute">
                {review.reasons.map((reason) => (
                  <li key={reason}>· {reason}</li>
                ))}
              </ul>
            ) : null}
            {review.betterEvidenced.length > 0 ? (
              <p className="mt-4 text-sm text-mute">
                Covering similar ground with better human evidence:{" "}
                {review.betterEvidenced.map((item, index) => (
                  <span key={item.slug}>
                    {index > 0 ? ", " : ""}
                    <Link href={`/peptides/${item.slug}`} className="text-pine-deep underline decoration-rule underline-offset-2">
                      {item.name}
                    </Link>{" "}
                    ({item.tier.toLowerCase()})
                  </span>
                ))}
                . Better evidenced does not mean safe, and adding nothing stays an option.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
