import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/home/Faq";
import { Reveal } from "@/components/home/Reveal";
import { WaitlistForm } from "@/components/labs/WaitlistForm";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Aevum Labs is coming: a blood test built for performance, reviewed by a licensed practitioner, with a plan made for your body. Join the waitlist.",
};

const wrap = "mx-auto max-w-7xl px-4 sm:px-6";
const display = "font-display font-normal tracking-[-0.04em]";
const centeredHeading = `${display} text-center text-4xl leading-[1.02] sm:text-6xl`;
const subhead = "mx-auto mt-4 max-w-xl text-center text-lg text-mute";
const band = "py-16 sm:py-24 lg:py-28";

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

/** Sample results for the mockups. Not a real person. */
const sample = [
  { name: "IGF-1", value: "182", unit: "ng/mL", position: 48, tone: "bg-recovery", label: "In range" },
  { name: "hs-CRP", value: "2.4", unit: "mg/L", position: 72, tone: "bg-strain", label: "Watch" },
  { name: "Vitamin D", value: "48", unit: "nmol/L", position: 22, tone: "bg-strain", label: "Low" },
  { name: "HbA1c", value: "5.2", unit: "%", position: 40, tone: "bg-recovery", label: "In range" },
  { name: "Ferritin", value: "96", unit: "µg/L", position: 55, tone: "bg-recovery", label: "In range" },
];

const included = [
  ["Performance blood panel", "Hormones, recovery, metabolic, heart, thyroid and nutrients"],
  ["Practitioner review", "A licensed practitioner reads every result"],
  ["Your plan", "Built around what your body actually needs"],
  ["Results dashboard", "Every marker in plain words, with clear ranges"],
  ["Training and recovery tracking", "Sessions, sleep and recovery beside your results"],
  ["Aevum AI", "Ask questions anytime"],
  ["Retesting", "See what changed every three to six months"],
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
    q: "What will my plan include?",
    a: "That depends on your results. A licensed practitioner reviews your bloodwork and health history and decides what fits you. Waitlist members get the full details first, when Aevum Labs opens.",
  },
  {
    q: "Is this a DNA test?",
    a: "No. It's a blood test. Your blood shows what's happening in your body right now and changes as you train. No genetic test can currently tell you what your body needs.",
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

/** A marker's value as a dot on a range bar: amber at the edges, green in the healthy middle. */
function RangeBar({ position, tone }: { position: number; tone: string }) {
  return (
    <div className="relative h-1.5 flex-1" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_right,var(--color-strain)_0%,var(--color-recovery)_30%,var(--color-recovery)_65%,var(--color-strain)_100%)] opacity-35" />
      <span
        className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${tone}`}
        style={{ left: `${position}%` }}
      />
    </div>
  );
}

/** The Aevum results screen on a phone, as the hero's product shot. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[17.5rem] rotate-[4deg] rounded-[2.75rem] bg-[#1a1b1f] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15 sm:w-[19rem]">
      <div className="overflow-hidden rounded-[2.25rem] bg-white text-ink">
        <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[0.65rem] font-semibold">
          <span>9:41</span>
          <span className="h-4 w-16 rounded-full bg-[#1a1b1f]" />
          <span>100%</span>
        </div>
        <div className="px-5 pb-6 pt-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em]">Aevum</p>
          <p className="mt-3 text-sm text-mute">Your results</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="font-display text-5xl tracking-[-0.04em]">82</p>
            <p className="pb-1.5 text-right text-xs text-mute">
              Performance score
              <br />
              <span className="text-recovery">3 to improve</span>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1.5 text-center text-[0.65rem]">
            {[
              ["17", "In range", "text-recovery"],
              ["2", "Watch", "text-strain"],
              ["1", "Low", "text-strain"],
            ].map(([count, label, colour]) => (
              <div key={label} className="rounded-xl bg-sheet py-2">
                <p className={`text-base font-semibold ${colour}`}>{count}</p>
                <p className="text-mute">{label}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-rule">
            {sample.map((marker) => (
              <li key={marker.name} className="py-2.5">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium">{marker.name}</span>
                  <span className="tabular-nums text-mute">
                    {marker.value} {marker.unit}
                  </span>
                </div>
                <div className="mt-2">
                  <RangeBar position={marker.position} tone={marker.tone} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const miniCard = "w-full max-w-[15rem] rounded-2xl bg-white p-4 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)]";

/** Small product moments shown at the top of each How it works card. */
const stepVisuals: React.ReactNode[] = [
  <div key="test" className={miniCard}>
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-recovery/15 text-recovery">
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-medium">Blood draw booked</p>
        <p className="text-xs text-mute">Partner lab · 10 minutes</p>
      </div>
    </div>
  </div>,
  <div key="understand" className={miniCard}>
    {sample.slice(0, 3).map((marker) => (
      <div key={marker.name} className="py-1.5">
        <div className="flex justify-between text-xs">
          <span>{marker.name}</span>
          <span className="text-mute">{marker.label}</span>
        </div>
        <div className="mt-1.5">
          <RangeBar position={marker.position} tone={marker.tone} />
        </div>
      </div>
    ))}
  </div>,
  <div key="plan" className={miniCard}>
    <p className="text-xs text-mute">Reviewed by your practitioner</p>
    <p className="mt-1 text-sm font-medium">Your plan is ready</p>
    <ul className="mt-3 space-y-2 text-xs">
      {["Recovery", "Sleep", "Nutrients"].map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          {item}
        </li>
      ))}
    </ul>
  </div>,
  <div key="retest" className={miniCard}>
    <p className="text-xs text-mute">Vitamin D</p>
    <svg viewBox="0 0 200 70" className="mt-2 w-full" aria-hidden>
      <path d="M8 58 C 60 54, 90 36, 192 14" fill="none" stroke="var(--color-recovery)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="58" r="4" fill="white" stroke="var(--color-strain)" strokeWidth="2.5" />
      <circle cx="100" cy="34" r="4" fill="white" stroke="var(--color-recovery)" strokeWidth="2.5" />
      <circle cx="192" cy="14" r="4" fill="var(--color-recovery)" />
    </svg>
    <div className="mt-1 flex justify-between text-[0.65rem] text-mute">
      <span>Today</span>
      <span>3 months</span>
      <span>6 months</span>
    </div>
  </div>,
];

const steps = [
  { title: "Get tested", body: "One quick blood draw at a partner lab near you, ordered by a licensed practitioner." },
  { title: "See what matters", body: "Your dashboard shows what's working, what needs attention, and where to focus first." },
  { title: "Get your plan", body: "A licensed practitioner reviews your results and builds a plan around what your body needs." },
  { title: "Track and retest", body: "Test again in three to six months and watch the numbers move." },
];

export default function LabsPage() {
  return (
    <div>
      {/* Hero: a dark rounded stage with the results screen as the product shot. */}
      <section className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="stage relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-14 sm:px-10 sm:py-20 lg:min-h-[80vh] lg:grid-cols-12 lg:py-16">
            <div className="lg:col-span-6">
              <p className="text-sm text-white/70">Aevum Labs · Coming soon</p>
              <h1 className="mt-5 font-display text-[2.9rem] font-normal leading-[1] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Prescribed for your body.
              </h1>
              <p className="mt-6 max-w-md text-lg text-white/70">
                One blood test built for training and recovery. A licensed
                practitioner reviews your results and builds a plan around what
                your body actually needs.
              </p>
              <div className="mt-8">
                <WaitlistForm id="join" tone="dark" />
              </div>
            </div>
            <div className="lg:col-span-6">
              <PhoneMock />
            </div>
          </div>
        </div>
      </section>

      <section className={`${wrap} ${band}`} aria-labelledby="how-heading">
        <Reveal>
          <h2 id="how-heading" className={centeredHeading}>
            How it works
          </h2>
          <p className={subhead}>One blood draw, then a plan that keeps up with you.</p>
        </Reveal>
        <ol className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 90}>
                <div className="relative flex aspect-[4/3.4] items-center justify-center overflow-hidden rounded-3xl bg-sheet p-5">
                  <span className="absolute left-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold shadow-sm">
                    {index + 1}
                  </span>
                  {stepVisuals[index]}
                </div>
                <h3 className="mt-5 text-xl tracking-[-0.01em]">{step.title}</h3>
                <p className="mt-2 text-mute">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sheet" aria-labelledby="panel-heading">
        <div className={`${wrap} ${band}`}>
          <Reveal>
            <h2 id="panel-heading" className={centeredHeading}>
              What we&apos;ll test
            </h2>
            <p className={subhead}>The markers that matter for training, across six areas of your health.</p>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {panels.map((panel, index) => (
              <li key={panel.title}>
                <Reveal delay={index * 70} className="h-full">
                  <div className="h-full rounded-3xl bg-white p-6 sm:p-8">
                    <h3 className="text-xl tracking-[-0.01em]">{panel.title}</h3>
                    <p className="mt-3 text-mute">{panel.body}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {panel.markers.map((marker) => (
                        <li key={marker} className="rounded-full bg-sheet px-3 py-1 text-sm">
                          {marker}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${wrap} ${band}`} aria-labelledby="included-heading">
        <Reveal>
          <p className="text-center text-mute">Aevum Labs membership</p>
          <h2 id="included-heading" className={`mt-3 ${centeredHeading}`}>
            Everything that&apos;s included
          </h2>
        </Reveal>
        <dl className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl">
          {included.map(([name, detail], index) => (
            <div
              key={name}
              className={`grid gap-1 px-5 py-3.5 sm:grid-cols-[1fr_1.4fr] sm:gap-6 ${index % 2 === 0 ? "bg-sheet" : ""}`}
            >
              <dt>{name}</dt>
              <dd className="text-mute">{detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-center text-sm text-mute">Pricing announced at launch.</p>
        <div className="mt-8 flex justify-center">
          <a href="#join" className="btn-primary">
            Join the waitlist
          </a>
        </div>
      </section>

      <section className="border-t border-rule">
        <div className={`${wrap} ${band}`}>
          <Reveal>
            <h2 className={centeredHeading}>Questions</h2>
          </Reveal>
          <div className="mx-auto mt-10 max-w-3xl">
            <Faq items={faqs} />
          </div>
        </div>
      </section>

      <section className="px-2 pb-2 sm:px-3 sm:pb-3">
        <div className="stage rounded-[2rem] px-6 py-20 text-center sm:rounded-[2.5rem] sm:py-28">
          <h2 className={`${display} text-5xl leading-[1] sm:text-7xl`}>Be first in line.</h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/70">
            Join the waitlist and we&apos;ll email you once, the day Aevum Labs opens.
          </p>
          <a href="#join" className="btn-light mt-10">
            Join the waitlist
          </a>
          <p className="mt-10 text-sm text-white/50">
            Educational only. Not medical advice.{" "}
            <Link href="/disclaimer" className="underline decoration-white/30 underline-offset-4">
              Full disclaimer
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
