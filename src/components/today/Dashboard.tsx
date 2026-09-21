import Link from "next/link";
import type { CompoundCard, DailyReport, Driver, Recommendation, Score } from "@/lib/today/types";

const toneText: Record<Score["tone"], string> = {
  good: "text-brass",
  neutral: "text-pine-deep",
  caution: "text-warn",
  missing: "text-mute",
};

const toneFill: Record<Score["tone"], string> = {
  good: "bg-brass",
  neutral: "bg-pine",
  caution: "bg-warn",
  missing: "bg-rule",
};

export function Dashboard({ report }: { report: DailyReport }) {
  return (
    <div className="space-y-14">
      <section aria-labelledby="scores-heading">
        <h2 id="scores-heading" className="sr-only">Today&apos;s scores</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {report.scores.map((score) => (
            <li key={score.label} className="flex flex-col rounded-3xl border border-rule bg-sheet p-5">
              <p className="eyebrow !text-mute">{score.label}</p>
              <p
                className={`mt-3 font-display font-light tracking-[-0.03em] ${toneText[score.tone]} ${
                  score.numeric != null ? "text-5xl" : score.tone === "missing" ? "text-xl" : "text-3xl"
                }`}
              >
                {score.numeric != null ? (
                  <>
                    {score.numeric}
                    <span className="text-lg text-mute">/100</span>
                  </>
                ) : (
                  score.value
                )}
              </p>
              {score.detail ? <p className="mt-1 text-sm text-mute">{score.detail}</p> : null}
              {score.numeric != null ? (
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-rule"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={score.numeric}
                  aria-label={score.label}
                >
                  <div className={`h-full rounded-full ${toneFill[score.tone]}`} style={{ width: `${score.numeric}%` }} />
                </div>
              ) : null}
              <div className="mt-auto pt-4">
                <Why drivers={score.why} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <RecList id="lifestyle" title="Recommended today" eyebrow="Lifestyle" items={report.lifestyle} />
      <RecList
        id="supplements"
        title="Supplements to review"
        eyebrow="Supplements"
        items={report.supplements}
        footnote="General guidance for healthy adults. Check new supplements against your medications with a pharmacist."
      />

      <section aria-labelledby="compounds-heading">
        <p className="eyebrow">Research compounds · educational</p>
        <h2 id="compounds-heading" className="mt-2 font-display text-4xl font-light tracking-[-0.03em] sm:text-5xl">
          Being studied for your goals
        </h2>
        <p className="mt-3 max-w-2xl text-mute">
          Picked from your goals and risk tolerance, never from today&apos;s
          metrics. No amounts: whether and how much is a decision for you and a
          clinician. Take the questions with you.
        </p>
        {report.compoundsWithheld ? (
          <p className="mt-6 rounded-3xl border border-warn/30 bg-warn-tint px-5 py-4 text-warn">
            {report.compoundsWithheld}
          </p>
        ) : report.compounds.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-rule bg-sheet px-5 py-4 text-mute">
            Nothing clears your risk tolerance for these goals. Lifestyle and
            supplements above are the whole plan.
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

function RecList({
  id,
  title,
  eyebrow,
  items,
  footnote,
}: {
  id: string;
  title: string;
  eyebrow: string;
  items: Recommendation[];
  footnote?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby={`${id}-heading`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-2 font-display text-4xl font-light tracking-[-0.03em] sm:text-5xl">
        {title}
      </h2>
      <ul className="mt-6 divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-sheet">
        {items.map((item) => (
          <li key={item.id} className="grid gap-2 px-5 py-5 sm:grid-cols-12 sm:gap-6">
            <p className="text-sm text-mute sm:col-span-3 sm:pt-1.5">{item.title}</p>
            <div className="sm:col-span-9">
              <p className="font-display text-2xl font-light tracking-[-0.02em]">{item.value}</p>
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
      <p className="eyebrow">For {compound.goal.toLowerCase()}</p>
      <h3 className="mt-2 font-display text-3xl font-light tracking-[-0.03em]">{compound.name}</h3>
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
      </details>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-5">
        <Link href={`/peptides/${compound.slug}`} className="text-sm text-pine-deep no-underline hover:underline">
          Full monograph →
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
