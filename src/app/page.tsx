import Link from "next/link";
import { Figure } from "@/components/home/Figure";
import { GoalExplorer, type Goal } from "@/components/home/GoalExplorer";
import { Hero } from "@/components/home/Hero";
import { Reveal } from "@/components/home/Reveal";
import { Tiers } from "@/components/home/Tiers";
import { Ticker } from "@/components/home/Ticker";
import { Wearables } from "@/components/home/Wearables";
import { compoundRows, counts } from "@/lib/data/compounds";
import { sites } from "@/lib/peptides/catalog";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-light tracking-[-0.04em]";
const sectionHeading = `${display} text-5xl leading-[0.95] sm:text-7xl`;

const capabilities = [
  {
    title: "Protocol guidance",
    body: "Reported exposure, how often it goes in, and how long a run lasts before a break, so a cycle fits around your training block.",
  },
  {
    title: "Interaction warnings",
    body: "Flags when what you run works against itself, shares a mechanism, or collides with your medication.",
  },
  {
    title: "Injection mapping",
    body: "Sites across the front and back of the body, rotated so the same spot is never hit twice running.",
  },
  {
    title: "Recovery trends",
    body: "Sleep, soreness, and side effects logged beside your sessions, so overreaching shows up as a pattern before it shows up as an injury.",
  },
];

const steps = [
  {
    title: "Log the peptide",
    body: "What you took, where you pinned it, and how training went, in thirty seconds. Tomorrow it is already filled in.",
  },
  {
    title: "Read the evidence",
    body: "Aevum ranks what you run by human evidence, warns on interactions, and says when to hold or take a break.",
  },
  {
    title: "Watch the block",
    body: "Sites, side effects, and recovery over weeks, so you see what a training block is doing to you, not just one morning.",
  },
];

/** Training goals and the register entries researched for each. No amounts. */
const goalPicks: { key: string; label: string; blurb: string; slugs: string[] }[] = [
  {
    key: "recovery",
    label: "Recovery & repair",
    blurb: "Tendons, ligaments, and soft tissue. The most asked-about corner of the register, and mostly animal data.",
    slugs: ["bpc-157", "tb-500", "ghk-cu", "kpv"],
  },
  {
    key: "strength",
    label: "Strength & lean mass",
    blurb: "Growth hormone secretagogues and releasing hormones. Two are approved drugs; the rest are research chemicals.",
    slugs: ["tesamorelin", "sermorelin", "ipamorelin", "cjc-1295"],
  },
  {
    key: "engine",
    label: "Engine & endurance",
    blurb: "Mitochondria and exercise mimetics. Striking results in mice, very little in people.",
    slugs: ["mots-c", "slu-pp-332", "ss-31", "aicar"],
  },
  {
    key: "sleep",
    label: "Sleep & regeneration",
    blurb: "Where recovery actually happens. Sleep and circadian peptides, with thin human evidence behind most.",
    slugs: ["dsip", "epitalon", "pinealon", "mk-677"],
  },
  {
    key: "focus",
    label: "Focus & composure",
    blurb: "Nootropic peptides for the mental side of competing. Studied mostly in Russia, rarely replicated elsewhere.",
    slugs: ["semax", "selank", "n-acetyl-semax-amidate", "cerebrolysin"],
  },
  {
    key: "weight",
    label: "Making weight",
    blurb: "Body composition for weight-class and aesthetic athletes. The best-evidenced compounds in the register.",
    slugs: ["tirzepatide", "semaglutide", "retatrutide", "aod-9604"],
  },
];

const rowsBySlug = new Map(compoundRows.map((row) => [row.slug, row]));

const goals: Goal[] = goalPicks.map(({ slugs, ...goal }) => ({
  ...goal,
  compounds: slugs.flatMap((slug) => {
    const row = rowsBySlug.get(slug);
    return row
      ? [{ slug: row.slug, name: row.name, status: row.status, statusLabel: row.statusLabel, score: row.score, primaryUse: row.primaryUse }]
      : [];
  }),
}));

export default function HomePage() {
  const names = goals.flatMap((goal) => goal.compounds.map((compound) => compound.name.replace(/\s*\(.*\)\s*$/, "")));

  return (
    <div>
      <Hero compounds={counts.total} />

      <Ticker names={names} />

      <section className={wrap} aria-label="Aevum in numbers">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          <Figure value={String(counts.total)} label="Compounds" />
          <Figure value={String(counts.stocked)} label="On NovaEvum" />
          <Figure value={String(sites.length)} label="Injection sites mapped" />
          <Figure value="30s" label="Daily check-in" />
        </dl>
      </section>

      <section id="goals" className={`${wrap} scroll-mt-28 py-24 lg:py-32`} aria-labelledby="goals-heading">
        <Reveal>
          <p className="eyebrow">Peptides by goal</p>
          <h2 id="goals-heading" className={`mt-6 ${sectionHeading}`}>
            Peptides for
            <br />
            every goal.
          </h2>
        </Reveal>
        <GoalExplorer goals={goals} />
        <p className="mt-8 max-w-2xl text-sm text-dim">
          Evidence, not prescriptions: Aevum shows research status and what is
          known, never an amount for your goal. Competing in tested sport? Most of
          these are on the WADA Prohibited List.
        </p>
      </section>

      <Tiers />

      <section className={`${wrap} py-24 lg:py-32`} aria-labelledby="capabilities-heading">
        <Reveal>
          <h2 id="capabilities-heading" className={sectionHeading}>
            Every peptide.
            <br />
            Every protocol.
          </h2>
        </Reveal>
        <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-rule lg:grid-cols-2">
          {capabilities.map((item, index) => (
            <li key={item.title} className="bg-paper">
              <Reveal delay={index * 90} className="h-full">
                <div className="flex h-full min-h-56 flex-col justify-between bg-sheet p-8 lg:p-10">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-dim">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="mt-10">
                    <h3 className={`${display} text-3xl sm:text-4xl`}>{item.title}</h3>
                    <p className="mt-4 max-w-md text-mute">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="scroll-mt-28 border-t border-rule">
        <div className={`${wrap} py-24 lg:py-32`}>
          <Reveal>
            <h2 className={sectionHeading}>Thirty seconds after training.</h2>
          </Reveal>
          <ol className="mt-16 grid gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 100}>
                  <p className="text-5xl font-light text-dim" style={{ fontFamily: "var(--font-readout)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-6 text-2xl">{step.title}</h3>
                  <p className="mt-3 max-w-sm text-mute">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className={`${wrap} grid gap-12 py-24 lg:grid-cols-2 lg:items-center lg:py-32`}>
          <Reveal>
            <h2 className={sectionHeading}>
              Every claim,
              <br />
              sourced.
            </h2>
            <p className="mt-8 max-w-md text-lg text-mute">
              No compound is called safe because it is popular. Where human
              dosing does not exist, Aevum says so and shows reported research
              exposure instead of inventing a number.
            </p>
            <Link href="/peptides" className="btn-secondary mt-10">
              Read the register
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <figure className="rounded-3xl border border-rule bg-sheet p-8 sm:p-10">
              <figcaption className="eyebrow">Sample entry</figcaption>
              <p className={`mt-4 ${display} text-4xl`}>BPC-157</p>
              <dl className="mt-8 divide-y divide-rule text-sm">
                {[
                  ["Evidence", "No established dosing"],
                  ["Reported exposure", "250–500 mcg"],
                  ["How often", "Every day"],
                  ["Cycle", "8 weeks, then a break"],
                ].map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-mute">{key}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </figure>
          </Reveal>
        </div>
      </section>

      <Wearables wrap={wrap} heading={sectionHeading} />

      <section className="border-t border-rule">
        <div className={`${wrap} py-28 text-center lg:py-40`}>
          <Reveal>
            <h2 className={`${display} text-6xl leading-[0.95] sm:text-8xl`}>
              Peptides.
              <br />
              Built for performance.
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/today" className="btn-primary">
                Start tracking
              </Link>
              <Link href="/peptides" className="btn-secondary">
                Browse peptides
              </Link>
            </div>
            <p className="mt-10 text-sm text-dim">
              Educational only. Not medical advice.{" "}
              <Link href="/disclaimer" className="underline decoration-rule underline-offset-4">
                Full disclaimer
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
