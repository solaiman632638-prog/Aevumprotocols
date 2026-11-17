import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/home/Faq";
import { Reveal } from "@/components/home/Reveal";
import { WaitlistForm } from "@/components/labs/WaitlistForm";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Aevum Labs is coming: a blood test built for performance, reviewed by a licensed practitioner who can prescribe regulated, Health Canada-approved peptides matched to your results. Join the waitlist.",
};

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-normal tracking-[-0.04em]";
const sectionHeading = `${display} text-[2.6rem] leading-[0.98] sm:text-6xl lg:text-7xl`;
const band = "py-16 sm:py-24 lg:py-32";
const card = "rounded-3xl border border-rule bg-sheet";

/** Marker groups the panel is planned around. What each says, in plain words. */
const panels = [
  {
    title: "Metabolic health",
    markers: ["Glucose", "HbA1c", "Insulin"],
    body: "How well you handle sugar and fuel. The starting point for body composition and making weight.",
  },
  {
    title: "Recovery & inflammation",
    markers: ["hs-CRP", "Creatine kinase"],
    body: "Whether training is outpacing recovery, and how much background inflammation you carry.",
  },
  {
    title: "Growth & hormones",
    markers: ["IGF-1", "Testosterone", "Cortisol"],
    body: "The growth hormone axis and the hormones behind strength, lean mass and stress.",
  },
  {
    title: "Thyroid",
    markers: ["TSH", "Free T4"],
    body: "Energy, temperature and metabolic rate, which shape how hard you can train.",
  },
  {
    title: "Heart",
    markers: ["ApoB", "LDL", "HDL", "Triglycerides"],
    body: "Cardiovascular risk, worth knowing before and during any protocol.",
  },
  {
    title: "Nutrients & organs",
    markers: ["Ferritin", "Vitamin D", "B12", "ALT", "eGFR"],
    body: "Iron, vitamins, liver and kidney function: the basics that quietly cap performance.",
  },
];

const steps = [
  { title: "Test", body: "One blood draw at a partner lab near you, ordered by a licensed practitioner." },
  { title: "Understand", body: "Every marker in plain words, with colour-coded ranges and what it means for training." },
  { title: "Your prescription", body: "A licensed practitioner reviews your results and, where it fits, prescribes regulated, Health Canada-approved peptides." },
  { title: "Retest", body: "Test again in three to six months and see what actually changed." },
];

/** Sample results for the preview card. Not a real person. */
const sample = [
  { name: "IGF-1", value: "182 ng/mL", position: 48, tone: "bg-recovery", label: "In range" },
  { name: "hs-CRP", value: "2.4 mg/L", position: 72, tone: "bg-strain", label: "Watch" },
  { name: "Vitamin D", value: "48 nmol/L", position: 22, tone: "bg-strain", label: "Low" },
  { name: "HbA1c", value: "5.2 %", position: 40, tone: "bg-recovery", label: "In range" },
  { name: "Ferritin", value: "96 µg/L", position: 55, tone: "bg-recovery", label: "In range" },
];

const faqs = [
  {
    q: "When does Aevum Labs open?",
    a: "We're lining up a partner lab and practitioners now. Join the waitlist and you'll get one email the day it opens.",
  },
  {
    q: "How much will it cost?",
    a: "Pricing isn't set yet. Waitlist members will see it first.",
  },
  {
    q: "Will I get a prescription?",
    a: "If it's right for you. A licensed practitioner reviews your bloodwork and health history and decides whether a peptide fits. Not everyone will need or qualify for one.",
  },
  {
    q: "Which peptides can be prescribed?",
    a: "Only regulated peptides approved by Health Canada, from licensed pharmacies. Never research chemicals, and never anything sold as not for human use.",
  },
  {
    q: "Is this a DNA test?",
    a: "No. It's a blood test. Your blood shows what's happening in your body right now and changes as you train. No genetic test can currently tell you which peptides you need.",
  },
  {
    q: "Who sees my results?",
    a: (
      <>
        You and the practitioner who orders your test. Results are never sold.{" "}
        <Link href="/privacy" className="text-ink underline decoration-rule underline-offset-4">
          Read the privacy policy
        </Link>
        .
      </>
    ),
  },
];

export default function LabsPage() {
  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-40 h-[38rem] w-[38rem] rounded-full bg-glow/25 blur-3xl" />
          <div className="absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-[#ffc79a]/40 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-[22rem] w-[22rem] rounded-full bg-[#c9c4ff]/30 blur-3xl" />
        </div>
        <div className={`${wrap} grid items-center gap-12 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-32`}>
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-rule bg-sheet/70 px-3.5 py-1.5 text-sm text-mute backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-glow" />
              Aevum Labs · Coming soon
            </p>
            <h1 className="mt-6 font-display text-[3.2rem] font-normal leading-[0.95] tracking-[-0.045em] sm:text-7xl lg:text-[5.5rem]">
              Peptides, prescribed for your body.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-mute sm:mt-8 sm:text-xl">
              One blood test built for training and recovery. A licensed
              practitioner reviews your results and, where it fits, prescribes
              regulated peptides matched to what your body actually shows.
            </p>
            <div className="mt-8 sm:mt-10">
              <WaitlistForm id="join" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <figure className={`${card} p-6 shadow-[0_30px_80px_-30px_rgba(60,40,20,0.35)] sm:p-8`}>
              <div className="flex items-center justify-between gap-4">
                <figcaption className="eyebrow">Your results · sample</figcaption>
                <span className="rounded-full bg-panel px-3 py-1 text-xs text-mute">Not a real person</span>
              </div>
              <ul className="mt-6 divide-y divide-rule">
                {sample.map((marker) => (
                  <li key={marker.name} className="py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span>{marker.name}</span>
                      <span className="tabular-nums text-mute">{marker.value}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {/* Range bar: amber at the edges, green in the healthy middle, a dot for this result. */}
                      <div className="relative h-1.5 flex-1" aria-hidden>
                        <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_right,var(--color-strain)_0%,var(--color-recovery)_30%,var(--color-recovery)_65%,var(--color-strain)_100%)] opacity-40" />
                        <span
                          className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sheet ${marker.tone}`}
                          style={{ left: `${marker.position}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-mute">{marker.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </figure>
          </div>
        </div>
      </section>

      <section className={`${wrap} ${band}`} aria-labelledby="panel-heading">
        <Reveal>
          <p className="eyebrow">What we&apos;ll test</p>
          <h2 id="panel-heading" className={`mt-5 max-w-3xl ${sectionHeading}`}>
            The markers that matter for training.
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {panels.map((panel, index) => (
            <li key={panel.title}>
              <Reveal delay={index * 70} className="h-full">
                <div className={`h-full ${card} p-6 sm:p-8`}>
                  <h3 className="text-2xl tracking-[-0.02em]">{panel.title}</h3>
                  <p className="mt-3 text-mute">{panel.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {panel.markers.map((marker) => (
                      <li key={marker} className="rounded-full bg-panel px-3 py-1 text-sm">
                        {marker}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-sheet">
        <div className={`${wrap} ${band}`}>
          <Reveal>
            <p className="eyebrow">How it will work</p>
            <h2 className={`mt-5 ${sectionHeading}`}>From blood draw to protocol.</h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className={`${wrap} ${band}`} aria-labelledby="labs-faq-heading">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow">Questions</p>
            <h2 id="labs-faq-heading" className={`mt-5 ${sectionHeading}`}>
              Good to know.
            </h2>
          </Reveal>
          <div className="lg:col-span-8">
            <Faq items={faqs} />
          </div>
        </div>
      </section>

      <section className={`${wrap} pb-16 sm:pb-24`}>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center text-on-accent sm:px-12 sm:py-24">
          <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-glow/40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full bg-[#c9c4ff]/25 blur-3xl" />
          <h2 className={`${display} text-5xl leading-[0.98] sm:text-7xl`}>Be first in line.</h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-on-accent/70">
            Join the waitlist and we&apos;ll email you once, the day Aevum Labs opens.
          </p>
          <a
            href="#join"
            className="mt-10 inline-flex min-h-11 items-center rounded-full bg-on-accent px-7 py-3.5 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-ink no-underline hover:bg-paper"
          >
            Join the waitlist
          </a>
        </div>
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
