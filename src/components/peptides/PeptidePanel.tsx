import Link from "next/link";
import { BodyMap } from "@/components/peptides/BodyMap";
import { Why } from "@/components/today/Dashboard";
import { siteLabel } from "@/lib/peptides/catalog";
import type { GuidanceStatus, PeptideReport } from "@/lib/peptides/engine";

const statusStyle: Record<GuidanceStatus, { label: string; tone: string }> = {
  start: { label: "Below protocol", tone: "border-rule text-mute" },
  keep: { label: "Keep", tone: "border-recovery/60 text-brass" },
  "step-up": { label: "Next step", tone: "border-pine text-pine-deep" },
  hold: { label: "Hold", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  "step-down": { label: "Step down", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  "above-max": { label: "Above max", tone: "border-warn/60 text-warn" },
  break: { label: "Break due", tone: "border-strain/70 text-[color:var(--color-strain)]" },
  stop: { label: "Stop", tone: "border-warn bg-warn-tint text-warn" },
};

const interactionTone = {
  warning: "border-warn/40 bg-warn-tint text-warn",
  caution: "border-[color:var(--color-strain)]/50 text-ink",
  info: "border-rule text-mute",
};

/** Protocol guidance, interaction warnings, and injection sites for logged peptides. */
export function PeptidePanel({ report, today }: { report: PeptideReport; today: string }) {
  const { sites } = report;
  return (
    <section aria-labelledby="peptides-heading" className="space-y-6">
      <div>
        <p className="eyebrow">Peptides</p>
        <h2 id="peptides-heading" className="mt-2 font-display text-4xl font-light tracking-[-0.03em] sm:text-5xl">
          Your peptides
        </h2>
        <p className="mt-3 max-w-2xl text-mute">
          Guidance follows each peptide&apos;s published protocol and the side
          effects you log. It never goes above a protocol&apos;s maximum. It is
          not medical advice: confirm changes with a clinician.
        </p>
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
      ) : report.guidance.length === 0 ? (
        <p className="rounded-3xl border border-rule bg-sheet px-5 py-4 text-mute">
          No peptides logged in the last week.
        </p>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {report.guidance.map((item) => {
            const style = statusStyle[item.status];
            return (
              <li key={item.slug} className="flex flex-col rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-light tracking-[-0.02em]">{item.name}</h3>
                    <p className="mt-1 text-sm text-mute">Last dose {item.current}</p>
                  </div>
                  <span className={`shrink-0 rounded-full border px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] ${style.tone}`}>
                    {style.label}
                  </span>
                </div>
                <p className="mt-4 text-lg">{item.headline}</p>
                <p className="mt-1 text-sm text-mute">{item.detail}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                  <Link href={`/protocols/${item.slug}`} className="text-sm text-pine-deep no-underline hover:underline">
                    Full protocol →
                  </Link>
                  <Why drivers={item.why} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
