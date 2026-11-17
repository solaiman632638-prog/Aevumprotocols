import Link from "next/link";
import { Faq } from "@/components/home/Faq";
import { Figure } from "@/components/home/Figure";
import { GoalExplorer, type Goal } from "@/components/home/GoalExplorer";
import { Hero } from "@/components/home/Hero";
import { Reveal } from "@/components/home/Reveal";
import { Ticker } from "@/components/home/Ticker";
import { Wearables } from "@/components/home/Wearables";
import { compoundRows, counts } from "@/lib/data/compounds";
import { sites } from "@/lib/peptides/catalog";

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-normal tracking-[-0.04em]";
const sectionHeading = `${display} text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-7xl`;
/** Section rhythm: tighter on phones, where every screen of scroll counts. */
const band = "py-16 sm:py-24 lg:py-32";
const card = "rounded-3xl border border-rule bg-sheet";

/** Small line icons, drawn in the current text colour. */
const icons: Record<string, React.ReactNode> = {
  register: <path d="M5 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2Z" />,
  warn: <path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3v.5" />,
  sites: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  train: <path d="M3 12h3m12 0h3M6 8v8m12-8v8M9 6v12m6-12v12M9 12h6" />,
  ai: <path d="M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2m0-12-2 2m-8 8-2 2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />,
  calc: <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 3h8v3H8V6Zm0 6h2m3 0h3m-8 3h2m3 0h3m-8 3h2m3 0h3" />,
};

const features = [
  {
    icon: "register",
    title: "The evidence register",
    body: `${counts.total} compounds, each ranked on how much human evidence stands behind it and what hazards are known.`,
    href: "/peptides",
  },
  {
    icon: "warn",
    title: "Interaction warnings",
    body: "Flags when what you run works against itself, shares a mechanism, or collides with your medication.",
    href: "/peptides",
  },
  {
    icon: "sites",
    title: "Injection site rotation",
    body: `${sites.length} sites across the front and back of the body, rotated so the same spot is never hit twice running.`,
    href: "/today",
  },
  {
    icon: "train",
    title: "Training and recovery",
    body: "Sessions, sleep, soreness and side effects side by side, so overreaching shows up before it becomes an injury.",
    href: "/train",
  },
  {
    icon: "ai",
    title: "Aevum AI",
    body: "Ask in plain words. Answers come straight from the register, with the evidence behind them.",
    href: "/ai",
  },
  {
    icon: "calc",
    title: "Vial calculator",
    body: "Reconstitution math and same-syringe checks, worked out for you instead of on the back of a box.",
    href: "/calculator",
  },
];

const steps = [
  {
    title: "Tell Aevum your goal",
    body: "Recovery, strength, endurance, sleep or making weight. Aevum shows what the research covers for it.",
  },
  {
    title: "Log in thirty seconds",
    body: "What you took, where you pinned it, and how training went. Tomorrow it is already filled in.",
  },
  {
    title: "Watch the block",
    body: "Sites, side effects and recovery over weeks, so you see what a training block is really doing to you.",
  },
];

const tiers = [
  { name: "Best evidenced", body: "Approved human dosing and a trial base.", colour: "bg-recovery" },
  { name: "Reasonable evidence", body: "Human trials, with hazards worth weighing.", colour: "bg-sleep" },
  { name: "Limited evidence", body: "Widely used, mostly animal data.", colour: "bg-strain" },
  { name: "Most uncertain", body: "Known hazards, little known.", colour: "bg-warn" },
];

const faqs = [
  {
    q: "Is Aevum really free?",
    a: "Yes. Every feature is free and there is no card to enter. Your log works straight away in your browser, and a free account saves your history so you can see it on any device.",
  },
  {
    q: "Does Aevum tell me how much to take?",
    a: "Aevum shows what is published in the research for each compound, and says plainly when no established human dosing exists. It never works out an amount from your own daily numbers. It is educational, not medical advice.",
  },
  {
    q: "How is the evidence ranked?",
    a: "Every compound sits in one of four tiers, from best evidenced to most uncertain, based on how much human evidence stands behind it and what hazards are known. Popular does not mean safe, and the register says so.",
  },
  {
    q: "Can I use it on my phone?",
    a: (
      <>
        Yes. Aevum installs from the website onto your home screen and opens full-screen like any other app.{" "}
        <Link href="/app" className="text-ink underline decoration-rule underline-offset-4">
          See how to install it
        </Link>
        .
      </>
    ),
  },
  {
    q: "I compete in tested sport. Is that a problem?",
    a: "Most of these compounds are on the WADA Prohibited List. Check the list for your sport before you run anything.",
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

      <section className={`${wrap} ${band}`} aria-labelledby="features-heading">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 id="features-heading" className={`mt-5 max-w-3xl ${sectionHeading}`}>
            Everything you run, in one place.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 70} className="h-full">
                <Link
                  href={item.href}
                  className={`group flex h-full flex-col ${card} p-6 no-underline transition-shadow hover:shadow-[0_20px_50px_-25px_rgba(0,0,0,0.3)] sm:p-8`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-ink">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {icons[item.icon]}
                    </svg>
                  </span>
                  <h3 className="mt-8 text-2xl tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 text-mute">{item.body}</p>
                  <span aria-hidden className="mt-auto pt-6 text-dim transition-transform group-hover:translate-x-1 group-hover:text-ink">
                    →
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section id="how" className="scroll-mt-28 bg-sheet">
        <div className={`${wrap} ${band}`}>
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className={`mt-5 ${sectionHeading}`}>Three steps. Thirty seconds a day.</h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:mt-14 lg:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 100} className="h-full">
                  <div className="h-full rounded-3xl bg-paper p-6 sm:p-8">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-accent">
                      {index + 1}
                    </span>
                    <h3 className="mt-8 text-2xl tracking-[-0.02em]">{step.title}</h3>
                    <p className="mt-3 text-mute">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="goals" className={`${wrap} scroll-mt-28 ${band}`} aria-labelledby="goals-heading">
        <Reveal>
          <p className="eyebrow">Peptides by goal</p>
          <h2 id="goals-heading" className={`mt-5 ${sectionHeading}`}>
            Start with your goal.
          </h2>
        </Reveal>
        <GoalExplorer goals={goals} />
        <p className="mt-8 max-w-2xl text-sm text-dim">
          Evidence, not prescriptions. Competing in tested sport? Most of these
          are on the WADA Prohibited List.
        </p>
      </section>

      <section className="border-t border-rule">
        <div className={`${wrap} grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center ${band}`}>
          <Reveal>
            <p className="eyebrow">Your results, explained</p>
            <h2 className={`mt-5 ${sectionHeading}`}>Every claim, sourced.</h2>
            <p className="mt-6 max-w-md text-lg text-mute">
              No compound is called safe because it is popular. Each one is
              ranked in four plain tiers, and where human dosing does not exist,
              Aevum says so instead of inventing a number.
            </p>
            <ul className="mt-8 space-y-4">
              {tiers.map((tier) => (
                <li key={tier.name} className="flex items-start gap-4">
                  <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${tier.colour}`} />
                  <p>
                    {tier.name}
                    <span className="text-mute"> · {tier.body}</span>
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/peptides" className="btn-secondary mt-10">
              Read the register
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <figure className={`${card} p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.3)] sm:p-10`}>
              <div className="flex items-center justify-between gap-4">
                <figcaption className="eyebrow">Sample entry</figcaption>
                <span className="rounded-full bg-strain/15 px-3 py-1 text-xs text-strain">Limited evidence</span>
              </div>
              <p className={`mt-4 ${display} text-5xl`}>BPC-157</p>
              <div className="mt-6 grid grid-cols-4 gap-1.5" aria-hidden>
                {tiers.map((tier, index) => (
                  <span key={tier.name} className={`h-2 rounded-full ${index === 2 ? tier.colour : "bg-rule"}`} />
                ))}
              </div>
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

      <section className={`${wrap} ${band}`} aria-labelledby="faq-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 id="faq-heading" className={`mt-5 ${sectionHeading}`}>
              Good to know.
            </h2>
          </Reveal>
          <div className="lg:col-span-8">
            <Faq items={faqs} />
          </div>
        </div>
      </section>

      <section className={`${wrap} pb-16 sm:pb-24`}>
        <Reveal>
          <div className="stage overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12 sm:py-24">
            <h2 className={`${display} text-5xl leading-[0.98] sm:text-7xl`}>
              Peptides, built for performance.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-lg text-white/70">
              Free to start, every feature included. Your first log takes thirty seconds.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/today"
                className="inline-flex min-h-11 items-center rounded-full bg-on-accent px-7 py-3.5 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-ink no-underline hover:bg-paper"
              >
                Start free
              </Link>
              <Link
                href="/peptides"
                className="inline-flex min-h-11 items-center rounded-full border border-on-accent/30 px-7 py-3.5 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-on-accent no-underline hover:border-on-accent"
              >
                Browse peptides
              </Link>
            </div>
          </div>
        </Reveal>
        <p className="mt-8 text-center text-sm text-dim">
          Educational only. Not medical advice.{" "}
          <Link href="/disclaimer" className="underline decoration-rule underline-offset-4">
            Full disclaimer
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
