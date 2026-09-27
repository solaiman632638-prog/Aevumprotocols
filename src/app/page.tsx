import Link from "next/link";
import { Figure } from "@/components/home/Figure";
import { Hero } from "@/components/home/Hero";
import { Reveal } from "@/components/home/Reveal";
import { Tiers } from "@/components/home/Tiers";
import { Ticker } from "@/components/home/Ticker";
import { compoundRows, counts } from "@/lib/data/compounds";
import { sites } from "@/lib/peptides/catalog";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-light tracking-[-0.04em]";
const sectionHeading = `${display} text-5xl leading-[0.95] sm:text-7xl`;

const capabilities = [
  {
    title: "Protocol guidance",
    body: "Reported exposure, how often it goes in, and how long a run lasts before a break — for every compound in the register.",
  },
  {
    title: "Interaction warnings",
    body: "Flags when what you run works against itself, shares a mechanism, or collides with your medication.",
  },
  {
    title: "Injection mapping",
    body: "Sites across the front and back of the body, with rotation tracked so the same spot is not used twice running.",
  },
  {
    title: "Recommended pairings",
    body: "What the human evidence says about running two compounds together, including where it says nothing at all.",
  },
];

const steps = [
  {
    title: "Log what you took",
    body: "Type the peptide, the amount, and tap where you pinned it. Next time it is already filled in, on the schedule that compound runs on.",
  },
  {
    title: "See the review",
    body: "Aevum ranks your regimen by evidence, warns on interactions, and says when to hold, lower, or take a break.",
  },
  {
    title: "Track the pattern",
    body: "Sites, side effects, and trends over weeks, so a problem shows up as a pattern rather than as a bad morning.",
  },
];

export default function HomePage() {
  const names = compoundRows.slice(0, 18).map((row) => row.name);

  return (
    <div>
      <Hero compounds={counts.total} />

      <Ticker names={names} />

      <section className={wrap} aria-label="Aevum in numbers">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          <Figure value={String(counts.total)} label="Compounds with protocols" />
          <Figure value={String(counts.stocked)} label="On NovaEvum" />
          <Figure value={String(sites.length)} label="Injection sites mapped" />
          <Figure value="30s" label="Daily check-in" />
        </dl>
      </section>

      <Tiers />

      <section className={`${wrap} py-24 lg:py-32`} aria-labelledby="capabilities-heading">
        <Reveal>
          <h2 id="capabilities-heading" className={sectionHeading}>
            One register.
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
            <h2 className={sectionHeading}>Thirty seconds a day.</h2>
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

      <section className="border-t border-rule">
        <div className={`${wrap} py-28 text-center lg:py-40`}>
          <Reveal>
            <h2 className={`${display} text-6xl leading-[0.95] sm:text-8xl`}>
              Peptides.
              <br />
              Reimagined.
            </h2>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/today" className="btn-primary">
                Start tracking
              </Link>
              <Link href="/peptides" className="btn-secondary">
                Browse compounds
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
