import type { AevumAnswer } from "@/lib/aevum-ai/schema";

const riskTone: Record<string, string> = {
  low: "border-recovery/50 text-[color:var(--color-recovery)]",
  moderate: "border-rule text-mute",
  elevated: "border-[color:var(--color-strain)]/60 text-[color:var(--color-strain)]",
  urgent: "border-warn text-warn",
  unknown: "border-rule text-mute",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule pt-5">
      <h3 className="eyebrow">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-mute">
      {items.map((item) => (
        <li key={item}>· {item}</li>
      ))}
    </ul>
  );
}

/** One answer, rendered as sections rather than a wall of text. */
export function AnswerCards({ answer }: { answer: AevumAnswer }) {
  return (
    <div className="space-y-6">
      {answer.urgentRedFlags.length > 0 ? (
        <div className="rounded-3xl border-2 border-warn bg-warn-tint p-5 text-warn sm:p-6">
          <p className="eyebrow !text-warn">Urgent</p>
          <h3 className="mt-2 font-display text-2xl font-light tracking-[-0.02em]">
            Urgent medical attention may be needed
          </h3>
          <p className="mt-3 text-sm">{answer.answer}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {answer.urgentRedFlags.map((flag) => (
              <li key={flag} className="rounded-full border border-warn/60 px-3 py-1 text-xs">
                {flag}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-[1.0625rem] leading-relaxed">{answer.answer}</p>
      )}

      {answer.regimenSummary.length > 0 ? (
        <Section title="Your reported regimen">
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2">
            {answer.regimenSummary.map((item) => (
              <li key={item.compound} className="bg-sheet p-4">
                <p className="font-medium">{item.compound}</p>
                <p className="mt-1 text-sm text-mute">
                  {item.reportedAmount} · {item.reportedFrequency}
                </p>
                <p className="mt-2 text-lg" style={{ fontFamily: "var(--font-readout)" }}>
                  {item.weeklyTotal}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {answer.urgentRedFlags.length === 0 ? (
        <Section title="Risk review">
          <p className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${riskTone[answer.risk.level] ?? riskTone.unknown}`}>
            {answer.risk.level}
          </p>
          <p className="mt-3 text-sm text-mute">{answer.risk.summary}</p>
        </Section>
      ) : null}

      {answer.sideEffects.length > 0 ? (
        <Section title="Side effects">
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-rule sm:grid-cols-2">
            {answer.sideEffects.map((item) => (
              <li key={item.name} className="bg-sheet p-4">
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-mute">
                  {item.severity} · {item.evidenceQuality}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {answer.interactions.length > 0 ? (
        <Section title="Interactions">
          <ul className="space-y-3">
            {answer.interactions.map((item) => (
              <li key={item.title} className="rounded-2xl border border-rule p-4">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-mute">{item.description}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-dim">{item.severity}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {answer.referenceRegimens.length > 0 ? (
        <Section title="Published protocols">
          <ul className="space-y-3">
            {answer.referenceRegimens.map((item, index) => (
              <li key={`${item.sourceId}-${index}`} className="rounded-2xl border border-rule p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-dim">
                  {item.sourceType.replace(/_/g, " ")}
                </p>
                <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  {[
                    ["Amount", item.amount],
                    ["Frequency", item.frequency],
                    ["Duration", item.duration],
                    ["Population", item.population],
                  ].map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3 sm:block">
                      <dt className="text-mute">{key}</dt>
                      <dd className="sm:mt-0.5">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-mute">
                  This describes the protocol, not a personalised recommendation.
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {answer.monitoringConsiderations.length > 0 ? (
        <Section title="Monitoring">
          <Bullets items={answer.monitoringConsiderations} />
        </Section>
      ) : null}

      {answer.evidenceLimitations.length > 0 ? (
        <Section title="Evidence limitations">
          <Bullets items={answer.evidenceLimitations} />
        </Section>
      ) : null}

      {answer.clinicianQuestions.length > 0 ? (
        <Section title="Worth asking a clinician">
          <Bullets items={answer.clinicianQuestions} />
        </Section>
      ) : null}

      {answer.citations.length > 0 ? (
        <Section title="Sources">
          <ul className="space-y-2">
            {answer.citations.map((item, index) => (
              <li key={`${item.sourceId}-${index}`} className="rounded-2xl border border-rule p-4">
                <p className="text-sm">{item.title}</p>
                {/^https?:\/\//.test(item.url) ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-block text-xs text-pine-deep underline decoration-rule underline-offset-2"
                  >
                    View source →
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-dim">{item.sourceId}</p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
