import Link from "next/link";
import { Figure, scoreColour, TickMeter } from "@/components/today/Readout";
import type { CompoundCard, DailyReport, Driver, Recommendation, Score } from "@/lib/today/types";

/** App-scale section heading, shared by every block below the scores. */
export const sectionHeading = "font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl";

export function Dashboard({ report, peptides }: { report: DailyReport; peptides?: React.ReactNode }) {
  return (
    <div className="space-y-12 sm:space-y-16">
      <ScoreBoard scores={report.scores} />

      {peptides}

      <RecList id="lifestyle" title="Recommended today" items={report.lifestyle} />
      <RecList
        id="supplements"
        title="Supplements to review"
        items={report.supplements}
        footnote="General guidance for healthy adults. Check new supplements against your medications with a pharmacist."
      />

      <section aria-labelledby="compounds-heading">
        <h2 id="compounds-heading" className={sectionHeading}>
          Peptides for you
        </h2>
        <p className="mt-3 max-w-2xl text-mute">
          Chosen from your goals and risk tolerance, best evidence first, with
          anything your health profile rules out left off. Each shows the
          starting amount its published protocol uses. Start there, change one
          thing at a time, and stop if side effects appear.
        </p>
        {report.compoundsWithheld ? (
          <p className="mt-6 rounded-3xl border border-warn/30 bg-warn-tint px-5 py-4 text-warn">
            {report.compoundsWithheld}
          </p>
        ) : report.compounds.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-rule bg-sheet px-5 py-4 text-mute">
            Nothing clears your risk tolerance for these goals. The lifestyle
            and supplement guidance above is the whole plan, which is a
            perfectly good place to stay.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {report.compounds.map((compound) => (
              <CompoundItem key={compound.slug} compound={compound} />
            ))}
          </ul>
        )}
      </section>

      {report.notes.length > 0 ? (
        <ul className="space-y-2 text-sm text-mute">
          {report.notes.map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Today's readout: the first numeric score leads as the instrument, other
 * numeric scores sit beside it, and the categorical calls read as one list.
 */
function ScoreBoard({ scores }: { scores: Score[] }) {
  const numeric = scores.filter((score) => score.numeric != null);
  const [lead, ...rest] = numeric;
  const calls = scores.filter((score) => score.numeric == null);
  return (
    <section aria-labelledby="scores-heading" className="grid gap-3 lg:grid-cols-12">
      <h2 id="scores-heading" className="sr-only">Today&apos;s scores</h2>
      {lead ? (
        <div
          className="relative flex flex-col overflow-hidden rounded-3xl border border-rule bg-sheet p-5 sm:p-7 lg:col-span-7"
          style={{ backgroundImage: `radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, ${scoreColour(lead)} 14%, transparent), transparent 60%)` }}
        >
          <ScoreName score={lead} />
          <div className="mt-6">
            <Figure score={lead} size="lead" />
          </div>
          {lead.detail ? <p className="mt-3 max-w-md text-mute">{lead.detail}</p> : null}
          <div className="mt-auto pt-6">
            <TickMeter value={lead.numeric!} colour={scoreColour(lead)} label={lead.label} className="h-10" />
            <div className="mt-5">
              <Why drivers={lead.why} />
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:col-span-5">
        {rest.map((score) => (
          <div key={score.label} className="rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <ScoreName score={score} />
              <Figure score={score} size="compact" />
            </div>
            {score.detail ? <p className="mt-2 text-sm text-mute">{score.detail}</p> : null}
            <TickMeter value={score.numeric!} colour={scoreColour(score)} label={score.label} ticks={24} className="mt-4 h-6" />
            <div className="mt-4">
              <Why drivers={score.why} />
            </div>
          </div>
        ))}

        {calls.length > 0 ? (
          <ul className="divide-y divide-rule rounded-3xl border border-rule bg-sheet">
            {calls.map((score) => (
              <li key={score.label} className="px-5 py-4 sm:px-6">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-mute">{score.label}</p>
                  <p
                    className={`text-right font-display font-light tracking-[-0.02em] ${score.tone === "missing" ? "text-base" : "text-2xl"}`}
                    style={{ color: score.tone === "missing" ? "var(--color-mute)" : scoreColour(score) }}
                  >
                    {score.value}
                  </p>
                </div>
                {score.detail ? <p className="mt-1 text-sm text-mute">{score.detail}</p> : null}
                <div className="mt-2">
                  <Why drivers={score.why} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function ScoreName({ score }: { score: Score }) {
  return (
    <p className="flex items-center gap-2.5 text-base text-ink">
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: scoreColour(score) }} />
      {score.label}
    </p>
  );
}

function RecList({
  id,
  title,
  items,
  footnote,
}: {
  id: string;
  title: string;
  items: Recommendation[];
  footnote?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className={sectionHeading}>
        {title}
      </h2>
      <ul className="mt-6 divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-sheet">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1 px-5 py-4 sm:grid-cols-12 sm:gap-6 sm:py-5">
            <p className="text-sm text-mute sm:col-span-3 sm:pt-1.5">{item.title}</p>
            <div className="sm:col-span-9">
              <p className="font-display text-2xl font-light tracking-[-0.02em] tabular-nums">{item.value}</p>
              <p className="mt-1 text-sm text-mute">{item.detail}</p>
              {item.caution ? <p className="mt-2 text-sm text-warn">{item.caution}</p> : null}
              <div className="mt-3">
                <Why drivers={item.why} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {footnote ? <p className="mt-3 text-xs text-mute">{footnote}</p> : null}
    </section>
  );
}

function CompoundItem({ compound }: { compound: CompoundCard }) {
  return (
    <li className="flex flex-col rounded-3xl border border-rule bg-sheet p-5 sm:p-6">
      <h3 className="font-display text-3xl font-light tracking-[-0.03em]">{compound.name}</h3>
      <p className="mt-1 text-sm text-mute">For {compound.goal.toLowerCase()}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-mute">Research status</dt>
          <dd>{compound.status}</dd>
        </div>
        <div>
          <dt className="text-xs text-mute">Evidence score</dt>
          <dd>{compound.researchScore}/100</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-mute">Evidence</dt>
          <dd>{compound.evidence}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-mute">Studied for</dt>
          <dd>{compound.benefits}</dd>
        </div>
      </dl>

      {compound.protocol ? (
        <div className="mt-4 rounded-2xl border border-pine/40 px-4 py-3">
          <p className="text-xs text-mute">Starting amount</p>
          <p className="mt-0.5 font-display text-2xl font-light">{compound.protocol.start}</p>
          <p className="mt-1 text-sm text-mute">{compound.protocol.route} · typical {compound.protocol.typical}</p>
          <p className="mt-3 text-sm">{compound.protocol.how}</p>
          {compound.protocol.duration ? <p className="mt-2 text-sm text-mute">{compound.protocol.duration}</p> : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-mute">No published protocol on Aevum yet, so no starting amount.</p>
      )}

      {compound.boxedWarning ? (
        <p className="mt-4 rounded-2xl border border-warn/30 bg-warn-tint px-3 py-2 text-sm text-warn">
          Boxed warning: {compound.boxedWarning}
        </p>
      ) : null}

      {compound.risks.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-mute">Reported risks</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {compound.risks.map((risk) => (
              <li key={risk} className="rounded-full border border-warn/30 bg-warn-tint px-2.5 py-1 text-xs text-warn">
                {risk}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {compound.cautions.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-mute">For you specifically</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {compound.cautions.map((caution) => (
              <li key={caution}>· {caution}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="mt-4 rounded-2xl border border-rule px-4 py-3">
        <summary className="cursor-pointer text-sm">Questions to ask a clinician</summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-mute">
          {compound.questions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
        <Link href="/book" className="mt-3 inline-block text-sm text-ink no-underline hover:underline">
          Book a call with our expert →
        </Link>
      </details>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-5">
        <Link href={`/peptides/${compound.slug}`} className="text-sm text-pine-deep no-underline hover:underline">
          {compound.protocol ? "Full protocol and syringe math →" : "Full monograph →"}
        </Link>
        <Why drivers={compound.why} />
      </div>
    </li>
  );
}

export function Why({ drivers }: { drivers: Driver[] }) {
  return (
    <details className="group text-sm">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-mute hover:text-ink [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span>
        Why am I seeing this?
      </summary>
      <dl className="mt-3 space-y-2 text-xs">
        {drivers.map((driver) => (
          <div key={`${driver.label}-${driver.value}`} className="border-t border-rule pt-2">
            <dt className="text-mute">{driver.label}</dt>
            <dd className="mt-0.5 flex flex-wrap justify-between gap-x-3">
              <span>{driver.value}</span>
              {driver.effect ? <span className="font-mono text-mute">{driver.effect}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
