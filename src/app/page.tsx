import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { guides } from "@/lib/data/guides";
import { library } from "@/lib/data/library";
import { getProtocol, protocols } from "@/lib/data/protocols";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-light tracking-[-0.04em]";
const sectionHeading = `${display} text-5xl leading-[0.95] sm:text-7xl lg:text-8xl`;

/**
 * Illustrative morning from a manual check-in, no wearable. Labelled "Sample"
 * wherever shown. Scores match what the Today engine returns for these inputs.
 */
const sample = {
  recovery: 85,
  sleep: 95,
  logged: [
    { label: "Slept", value: "7.6", unit: "h" },
    { label: "Energy", value: "4", unit: "/ 5" },
    { label: "Soreness", value: "2", unit: "/ 5" },
    { label: "Weight", value: "86.2", unit: "kg" },
  ],
  goal: { name: "Lose fat", verdict: "On track", detail: "−0.5 kg a week toward 82 kg" },
  plan: [
    { label: "Training", value: "Go hard if planned" },
    { label: "Protein", value: "165 g" },
    { label: "Hydration", value: "3.0 L" },
    { label: "Sleep target", value: "8 h" },
  ],
};

const pillars = [
  {
    metric: "Recovery",
    measure: "Daily score · 0–100",
    color: "var(--color-recovery)",
    body: "How ready you are for a hard day, from your sleep and how you feel. Add resting heart rate or HRV if you track them.",
  },
  {
    metric: "Sleep",
    measure: "Daily score · 0–100",
    color: "var(--color-sleep)",
    body: "Hours against what you actually need, sleep quality, and the debt you are carrying into tonight.",
  },
  {
    metric: "Training",
    measure: "Readiness · low to high",
    color: "var(--color-strain)",
    body: "Log yesterday's session and get today's intensity, so hard days are planned, not stacked.",
  },
  {
    metric: "Goals",
    measure: "Progress · week by week",
    body: "Fat loss, muscle, sleep, recovery, focus. Log your weight and see whether you are on track, stalled, or going too fast.",
  },
  {
    metric: "Fuel",
    measure: "Daily targets",
    body: "Protein, calories, and hydration set from your body, your goal, and today's training.",
  },
];

const steps = [
  {
    title: "Set your goals",
    body: "What you are working toward, your body, your training week, and anything a plan should work around. Stored on your device only.",
  },
  {
    title: "Log your morning",
    body: "Sleep, energy, soreness, stress, and weight. Thirty seconds, no device needed. Connect a heart rate monitor later if you want.",
  },
  {
    title: "Get today's plan",
    body: "Recovery and sleep scores, training intensity, and what to eat and drink. Your baseline sharpens after three check-ins.",
  },
];

function Ring({
  label,
  value,
  max,
  display: shown,
  color,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  color: string;
}) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="relative size-36 sm:size-44">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-rule)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - value / max)}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center ${display} text-4xl sm:text-5xl`}>
          {shown}
        </span>
      </div>
      <figcaption className="eyebrow !text-mute">{label}</figcaption>
    </figure>
  );
}

export default function Home() {
  const protocolCount = protocols.length + guides.filter((guide) => !getProtocol(guide.slug)).length;

  return (
    <div>
      {/* Hero */}
      <section className={`${wrap} pb-16 pt-20 sm:pt-28`}>
        <Reveal>
          <p className="eyebrow">Goals · Recovery · Sleep</p>
        </Reveal>
        <Reveal delay={100}>
          <h1 className={`mt-6 max-w-6xl ${display} text-6xl leading-[0.9] sm:text-8xl lg:text-[8.5rem]`}>
            Know your body. Train it better.
          </h1>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-8 max-w-xl text-lg text-mute">
            Set your goals, log how you slept and how you feel, and Aevum turns
            it into a clear plan for today. Thirty seconds a morning. No device
            needed.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/today" className="btn-primary">
              Start your check-in
            </Link>
            <Link href="#how" className="btn-secondary">
              How it works
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Product preview */}
      <section className={`${wrap} pb-24`} aria-labelledby="preview-heading">
        <Reveal>
          <div className="rounded-[1.875rem] bg-panel p-6 sm:p-10 lg:p-14">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="preview-heading" className={`${display} text-3xl sm:text-4xl`}>
                Today
              </h2>
              <span className="rounded-full border border-rule px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-mute">
                Sample day
              </span>
            </div>

            <div className="mt-10 grid grid-cols-1 items-center justify-items-center gap-10 sm:grid-cols-3">
              <Ring label="Recovery" value={sample.recovery} max={100} display={`${sample.recovery}%`} color="var(--color-recovery)" />
              <Ring label="Sleep" value={sample.sleep} max={100} display={`${sample.sleep}%`} color="var(--color-sleep)" />
              <div className="w-full max-w-56 rounded-2xl border border-rule p-5 text-center sm:text-left">
                <p className="eyebrow !text-mute">Goal</p>
                <p className="mt-2 text-lg">{sample.goal.name}</p>
                <p className={`mt-1 ${display} text-4xl`}>{sample.goal.verdict}</p>
                <p className="mt-2 text-sm text-mute">{sample.goal.detail}</p>
              </div>
            </div>

            <p className="eyebrow mt-12">Logged this morning</p>
            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-rule lg:grid-cols-4">
              {sample.logged.map((item) => (
                <div key={item.label} className="bg-panel p-5">
                  <dt className="text-sm text-mute">{item.label}</dt>
                  <dd className={`mt-1 ${display} text-4xl`}>
                    {item.value}
                    <span className="ml-1 text-base text-mute">{item.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <p className="eyebrow">Recommended today</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {sample.plan.map((item) => (
                  <li key={item.label} className="rounded-2xl border border-rule p-5">
                    <p className="text-sm text-mute">{item.label}</p>
                    <p className="mt-1 text-xl">{item.value}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Stats */}
      <section className="border-y border-rule">
        <dl className={`${wrap} grid grid-cols-2 lg:grid-cols-4`}>
          {[
            { value: "30s", label: "Daily check-in" },
            { value: "8", label: "Goals to choose from" },
            { value: "0", label: "Devices required" },
            { value: String(library.length), label: "Compounds researched" },
          ].map((stat) => (
            <div key={stat.label} className="py-10 pr-4">
              <dt className="eyebrow">{stat.label}</dt>
              <dd className={`mt-2 ${display} text-6xl sm:text-7xl`}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Pillars */}
      <section className={`${wrap} py-24 lg:py-32`}>
        <Reveal>
          <h2 className={`max-w-5xl ${sectionHeading}`}>Get a complete picture of your health</h2>
        </Reveal>
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <li key={pillar.metric} className={index === 0 ? "lg:row-span-2" : undefined}>
              <Reveal delay={index * 80} className="h-full">
                <div className="flex h-full min-h-56 flex-col justify-between rounded-[1.875rem] bg-panel p-7">
                  <p className="flex items-center gap-2.5 text-sm text-mute">
                    {pillar.color ? (
                      <span aria-hidden className="size-2.5 rounded-full" style={{ background: pillar.color }} />
                    ) : null}
                    {pillar.measure}
                  </p>
                  {index === 0 ? (
                    <div className="my-8 flex justify-center">
                      <Ring
                        label="Sample"
                        value={sample.recovery}
                        max={100}
                        display={`${sample.recovery}%`}
                        color="var(--color-recovery)"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h3 className={`${display} text-4xl`}>{pillar.metric}</h3>
                    <p className="mt-3 text-mute">{pillar.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-28 border-t border-rule">
        <div className={`${wrap} py-24 lg:py-32`}>
          <Reveal>
            <h2 className={sectionHeading}>How it works</h2>
          </Reveal>
          <ol className="mt-16 grid gap-10 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 100}>
                  <p className={`${display} text-7xl text-pine-deep`}>{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-6 text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-mute">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Transparency */}
      <section className="border-t border-rule">
        <div className={`${wrap} grid gap-12 py-24 lg:grid-cols-2 lg:items-center lg:py-32`}>
          <Reveal>
            <h2 className={sectionHeading}>Every number, explained.</h2>
            <p className="mt-8 max-w-md text-lg text-mute">
              No black box. Tap &ldquo;Why am I seeing this?&rdquo; on any score
              or recommendation and see exactly which of your answers moved it,
              and by how much. Add heart-rate data and it shows up here too.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <figure className="rounded-[1.875rem] bg-panel p-7 sm:p-9">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow !text-mute">Recovery</p>
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-mute">Sample</span>
              </div>
              <p className={`mt-3 ${display} text-7xl`}>
                85<span className="text-2xl text-mute">/100</span>
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-mute">
                Why am I seeing this?
              </p>
              <dl className="mt-3 divide-y divide-rule text-sm">
                {[
                  ["Sleep vs need", "7.6 of 8 h", "95 × 50%"],
                  ["How you feel", "quality 4, energy 4, soreness 2, stress 2", "75 × 50%"],
                ].map(([label, value, effect]) => (
                  <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 py-3">
                    <dt className="text-mute">{label}</dt>
                    <dd className="flex gap-4">
                      <span>{value}</span>
                      <span className="font-mono text-mute">{effect}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Research */}
      <section className="border-t border-rule">
        <div className={`${wrap} py-24 lg:py-32`}>
          <Reveal>
            <h2 className={`max-w-4xl ${sectionHeading}`}>Research, not hype.</h2>
            <p className="mt-8 max-w-xl text-lg text-mute">
              Thinking about a peptide or supplement? Read the evidence, the
              risks, and the questions to ask a clinician first.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/peptides",
                value: library.length,
                title: "Research library",
                body: "Mechanism, evidence grade, regulatory status, and side effects for every compound.",
              },
              {
                href: "/protocols",
                value: protocolCount,
                title: "Protocols",
                body: "Reconstitution tables, schedules, storage, and a built-in syringe calculator.",
              },
            ].map((card, index) => (
              <Reveal key={card.href} delay={index * 100}>
                <Link
                  href={card.href}
                  className="group flex min-h-64 flex-col justify-between rounded-[1.875rem] bg-panel p-8 no-underline transition-colors hover:bg-[#262626]"
                >
                  <p className={`${display} text-7xl text-ink`}>{card.value}</p>
                  <div>
                    <p className="text-2xl text-ink">
                      {card.title}
                      <span aria-hidden className="ml-2 inline-block text-mute transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </p>
                    <p className="mt-2 max-w-md text-mute">{card.body}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-rule">
        <div className={`${wrap} flex flex-col items-start gap-10 py-24 lg:py-32`}>
          <Reveal>
            <h2 className={`${display} text-6xl leading-[0.9] sm:text-8xl lg:text-[8.5rem]`}>Start with today.</h2>
          </Reveal>
          <Reveal delay={150}>
            <Link href="/today" className="btn-primary">
              Start your check-in
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
