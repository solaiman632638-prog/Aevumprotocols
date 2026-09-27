import Link from "next/link";
import { AddEvaluator } from "@/components/peptides/AddEvaluator";
import { BodyMap } from "@/components/peptides/BodyMap";
import { Why } from "@/components/today/Dashboard";
import { cycleLabel, getCompound, scheduleLabel, siteLabel } from "@/lib/peptides/catalog";
import type { RiskTier } from "@/lib/peptides/catalog";
import type { GuidanceStatus, PeptideReport } from "@/lib/peptides/engine";
import type { UserContext } from "@/lib/today/types";

const statusStyle: Record<GuidanceStatus, { label: string; tone: string }> = {
  start: { label: "Below range", tone: "border-rule text-mute" },
  keep: { label: "No change", tone: "border-recovery/60 text-brass" },
  reference: { label: "Hold", tone: "border-rule text-mute" },
  "step-up": { label: "Prescriber step", tone: "border-pine text-pine-deep" },
  hold: { label: "Hold", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  "step-down": { label: "Lower", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  "above-researched": { label: "Above reported", tone: "border-warn/60 text-warn" },
  break: { label: "Break due", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  stop: { label: "Stop", tone: "border-warn bg-warn-tint text-warn" },
};

const evidenceLabel = {
  clinical: "Approved dosing",
  trial: "Trial data only",
  community: "No established dosing",
};

const interactionTone = {
  warning: "border-warn/40 bg-warn-tint text-warn",
  caution: "border-[color:var(--color-strain)]/50 text-ink",
  info: "border-rule text-mute",
};

const strengthLabel = {
  trial: "Randomised human trials",
  "human-acute": "Human data, short-term marker only",
  none: "No human data for the pair",
} as const;

const strengthTone = {
  trial: "border-recovery/60 text-brass",
  "human-acute": "border-rule text-mute",
  none: "border-warn/60 text-warn",
} as const;

const tierTone: Record<RiskTier, string> = {
  "Best evidenced": "border-recovery/60 text-[color:var(--color-recovery)]",
  "Reasonable evidence": "border-rule text-mute",
  "Limited evidence": "border-[color:var(--color-strain)]/60 text-[color:var(--color-strain)]",
  "Most uncertain": "border-warn/60 text-warn",
};

const levelTone: Record<string, string> = {
  Higher: "text-warn",
  High: "text-warn",
  Moderate: "text-[color:var(--color-strain)]",
  Lower: "text-brass",
  Low: "text-brass",
  Some: "text-brass",
  Limited: "text-[color:var(--color-strain)]",
  "None identified": "text-warn",
};

/** Regimen review, per-compound guidance, warnings, and injection sites. */
export function PeptidePanel({
  report,
  today,
  context,
  activeSlugs,
}: {
  report: PeptideReport;
  today: string;
  context: UserContext;
  activeSlugs: string[];
}) {
  const { sites, review } = report;

  if (report.urgent) {
    return (
      <section aria-labelledby="urgent-heading" className="rounded-3xl border-2 border-warn bg-warn-tint p-6 text-warn sm:p-8">
        <p className="eyebrow !text-warn">Get medical care</p>
        <h2 id="urgent-heading" className="mt-2 font-display text-4xl font-light tracking-[-0.03em]">
          Stop and get checked
        </h2>
        <p className="mt-4 max-w-prose">
          You reported {report.urgent.labels.join(", ").toLowerCase()} on {report.urgent.date}. Symptoms
          like these need a clinician, not a regimen adjustment. If they are severe or
          getting worse, call emergency services or go to urgent care now.
        </p>
        <p className="mt-3 max-w-prose">
          Aevum has paused all regimen guidance. It comes back when the red flag is
          cleared from your check-in.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="peptides-heading" className="space-y-6">
      <div>
        <p className="eyebrow">Peptides</p>
        <h2 id="peptides-heading" className="mt-2 font-display text-4xl font-light tracking-[-0.03em] sm:text-5xl">
          Aevum risk review
        </h2>
      </div>

      {report.interactions.length > 0 ? (
        <ul className="space-y-3" aria-label="Warnings">
          {report.interactions.map((item) => (
            <li key={item.title + item.compounds.join()} className={`rounded-3xl border px-5 py-4 ${interactionTone[item.level]}`}>
              <p className="font-medium">
                {item.level === "warning" ? "Warning: " : item.level === "caution" ? "Caution: " : ""}
                {item.title}
              </p>
              <p className="mt-1 text-sm">{item.detail}</p>
              <p className="mt-2 text-xs opacity-80">{item.compounds.join(" · ")}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {report.withheld ? (
        <p className="rounded-3xl border border-warn/30 bg-warn-tint px-5 py-4 text-warn">{report.withheld}</p>
      ) : null}

      {review ? (
        <div className="rounded-3xl border border-rule bg-sheet p-5 sm:p-7">
          <dl className="grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Active compounds" value={String(review.active)} />
            <Stat label="Complexity" value={review.complexity} tone={levelTone[review.complexity]} />
            <Stat label="Mechanism overlap" value={review.overlap} tone={levelTone[review.overlap]} />
            <Stat label="Combination evidence" value={review.combinationEvidence} tone={levelTone[review.combinationEvidence]} />
          </dl>
          <p className="eyebrow mt-6">Risk-minimising recommendation</p>
          <p className="mt-2 max-w-prose text-lg">{review.recommendation}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.08em] text-mute">Why</p>
          <ul className="mt-2 space-y-1 text-sm text-mute">
            {review.why.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-mute">
            Complexity describes how hard your regimen is to read, not how dangerous it is. It is not a medical safety score.
          </p>
        </div>
      ) : null}

      {report.guidance.length > 0 ? (
        <>
        <p className="text-sm text-mute">
          Ordered by evidence: best-evidenced with the fewest known hazards
          first, most uncertain last. That order ranks how much is known, not
          how safe anything is.
        </p>
        <ul className="grid gap-4 lg:grid-cols-2">
          {report.guidance.map((item) => {
            const style = statusStyle[item.status];
            const model = getCompound(item.slug);
            return (
              <li key={item.slug} className="flex flex-col rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-light tracking-[-0.02em]">{item.name}</h3>
                    <p className="mt-1 text-sm text-mute">You reported {item.current}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] ${style.tone}`}>
                    {style.label}
                  </span>
                </div>
                <p className="mt-4 text-lg">{item.headline}</p>
                <p className="mt-1 text-sm text-mute">{item.detail}</p>
                <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2">
                  <Stat label="Reference exposure" value={item.reference} small />
                  <Stat label="Evidence" value={evidenceLabel[item.evidence]} small />
                  {model ? <Stat label="How often" value={scheduleLabel(model)} small /> : null}
                  {model ? <Stat label="Cycle" value={cycleLabel(model)} small /> : null}
                </dl>
                <p className="mt-3 text-xs text-mute">
                  <span className={`mr-2 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${tierTone[item.risk.tier]}`}>
                    {item.risk.tier}
                  </span>
                  {item.risk.reasons.slice(0, 2).join(". ")}.
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                  <Link href={`/peptides/${item.slug}`} className="text-sm text-pine-deep no-underline hover:underline">
                    Research and protocol →
                  </Link>
                  <Why drivers={item.why} />
                </div>
              </li>
            );
          })}
        </ul>
        </>
      ) : report.withheld ? null : (
        <p className="rounded-3xl border border-rule bg-sheet px-5 py-4 text-mute">No peptides logged in the last week.</p>
      )}

      {report.pairings.length > 0 ? (
        <section aria-labelledby="pairings-heading" className="rounded-3xl border border-rule bg-sheet p-5 sm:p-7">
          <h3 id="pairings-heading" className="font-display text-2xl font-light tracking-[-0.02em]">
            Recommended pairings
          </h3>
          <ul className="mt-5 divide-y divide-rule">
            {report.pairings.map((item) => (
              <li key={item.title} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <p className="font-medium">{item.title}</p>
                  <span className={`rounded-full border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] ${strengthTone[item.strength]}`}>
                    {strengthLabel[item.strength]}
                  </span>
                </div>
                <p className="mt-2 text-lg">{item.verdict}</p>
                <p className="mt-2 text-sm text-mute">{item.mechanism}</p>
                <dl className="mt-3 grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2">
                  <Stat label="What the data shows" value={item.shows} small />
                  <Stat label="What it does not show" value={item.limits} small />
                </dl>
                <p className="mt-3 text-xs text-mute">{item.source}</p>
                <p className="mt-3 text-sm">
                  {item.partnerRunning ? (
                    <>You already run both: {item.running} with {item.partnerRunning}.</>
                  ) : item.options.length > 0 ? (
                    <>
                      You run {item.running}. The other half:{" "}
                      {item.options.map((option, index) => (
                        <span key={option.slug}>
                          {index > 0 ? ", " : ""}
                          <Link href={`/peptides/${option.slug}`} className="text-pine-deep underline decoration-rule underline-offset-2">
                            {option.name}
                          </Link>
                        </span>
                      ))}
                      . Amounts come from your prescriber.
                    </>
                  ) : (
                    <>You run {item.running}.</>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.simplifications.length > 0 ? (
        <section aria-labelledby="simplify-heading" className="rounded-3xl border border-rule bg-sheet p-5 sm:p-7">
          <h3 id="simplify-heading" className="font-display text-2xl font-light tracking-[-0.02em]">
            Opportunities to simplify
          </h3>
          <ul className="mt-5 divide-y divide-rule">
            {report.simplifications.map((item) => (
              <li key={item.title} className="py-4 first:pt-0 last:pb-0">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-mute">{item.detail}</p>
                <p className="mt-2 text-sm">{item.recommendation}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.withheld ? null : <AddEvaluator activeSlugs={activeSlugs} context={context} />}

      <div className="grid gap-6 rounded-3xl border border-rule bg-sheet p-5 sm:p-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h3 className="font-display text-2xl font-light tracking-[-0.02em]">Injection sites</h3>
          <p className="mt-2 text-sm text-mute">
            Rotating sites prevents lumps and irritation. Next suggested:{" "}
            <span className="text-ink">{siteLabel(sites.suggestion)}</span>.
          </p>
          {sites.repeats.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-warn">
              {sites.repeats.map((repeat) => (
                <li key={repeat.site + repeat.compound}>
                  {repeat.compound} went into {siteLabel(repeat.site).toLowerCase()} again within two days. Rotate next time.
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <BodyMap usage={sites.usage} suggestion={sites.suggestion} today={today} label="Recent sites" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone, small }: { label: string; value: string; tone?: string; small?: boolean }) {
  return (
    <div className="bg-sheet p-4">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className={`mt-1 ${small ? "text-sm" : "text-lg"} ${tone ?? ""}`}>{value}</dd>
    </div>
  );
}
