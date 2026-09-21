import Link from "next/link";
import { Reveal } from "@/components/home/Reveal";
import { ScrollVideo } from "@/components/home/ScrollVideo";
import { guides } from "@/lib/data/guides";
import { library } from "@/lib/data/library";
import { getProtocol, protocols } from "@/lib/data/protocols";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260729_102822_0e6c87e8-c141-4744-bf32-ad30db296371.mp4";

const services = ["Peptide protocols", "Recovery tracking", "Research library"];

const pad = "px-5 sm:px-8 md:px-12";
const shell = `flex min-h-[calc(100vh-4.5rem)] supports-[height:100svh]:min-h-[calc(100svh-4.5rem)] flex-col justify-between ${pad} pt-10 sm:pt-12 pb-12 md:pb-16`;
const headline =
  "font-display text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl";
const monoLabel = "text-xs uppercase tracking-[0.15em]";

function Chevron({ size = 14, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] text-white backdrop-blur-md">
      {children}
    </span>
  );
}

export default function Home() {
  const protocolCount = protocols.length + guides.filter((guide) => !getProtocol(guide.slug)).length;

  const capabilities = [
    {
      title: "Daily readout",
      body: "Recovery, sleep, and readiness scored against your own baseline, from a check-in or a heart rate monitor.",
      href: "/today",
    },
    {
      title: "Protocol library",
      body: `${protocolCount} protocols with reconstitution tables, titration schedules, and a built-in calculator.`,
      href: "/protocols",
    },
    {
      title: "Research first",
      body: `Evidence, risks, and questions to ask a clinician for ${library.length} peptides, before you commit to anything.`,
      href: "/peptides",
    },
  ];

  return (
    <>
      <ScrollVideo src={HERO_VIDEO} />

      <div className="relative z-10">
        {/* Section one: hero */}
        <section className={shell}>
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <ul className="flex flex-col gap-2">
              {services.map((service, index) => (
                <li key={service}>
                  <Reveal delay={150 + index * 120}>
                    <span className={`${monoLabel} text-white/90 drop-shadow-md`}>/ {service}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
            <Reveal delay={300} className="max-w-xs sm:text-right">
              <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                We turn peptide research into clear protocols and your daily
                signals into a plan you can read.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Reveal delay={150} className="mb-5">
                <Badge>{library.length} peptides researched</Badge>
              </Reveal>
              <Reveal delay={280}>
                <h1 className={headline}>
                  Clear. Precise.
                  <br />
                  Measured.
                </h1>
              </Reveal>
            </div>

            <Reveal delay={420}>
              <div className="flex items-center gap-4 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                <ReadoutTile />
                <div className="flex flex-col gap-1.5 pr-2">
                  <p className="text-sm font-medium text-white">Your daily readout</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">
                    Recovery · Sleep · Readiness
                  </p>
                  <Link
                    href="/today"
                    className="mt-1.5 inline-flex items-center gap-1 self-start rounded-full bg-white px-4 py-2 text-xs font-medium text-black no-underline transition-colors duration-300 hover:bg-white/85"
                  >
                    Check in today
                    <Chevron />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Room for the scroll to scrub the video between sections. */}
        <div aria-hidden className="h-[80vh]" />

        {/* Section two: capability */}
        <section className={shell}>
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <Reveal delay={120}>
              <Badge>Recovery on demand</Badge>
            </Reveal>
            <Reveal delay={220} className="max-w-sm sm:text-right">
              <p className="text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                Aevum doesn&apos;t just log numbers. It reads your sleep, heart
                rate, and training load, and tells you what they mean today.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-1 flex-col justify-end gap-12 pt-12 md:flex-row md:items-end md:justify-between md:gap-16">
            <div className="max-w-xl">
              <Reveal delay={180}>
                <h2 className={headline}>
                  Learn to read
                  <br />
                  your body.
                </h2>
              </Reveal>
              <Reveal delay={320}>
                <p className="mt-6 max-w-md text-sm text-white/80 drop-shadow-md sm:text-base">
                  From a thirty-second check-in or a connected heart rate
                  monitor, Aevum turns daily signals into clear guidance on
                  sleep, training, hydration, and nutrition, and shows you
                  exactly why.
                </p>
              </Reveal>
              <Reveal delay={420}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/today"
                    className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black no-underline transition-colors duration-300 hover:bg-white/85 sm:text-sm"
                  >
                    Start today&apos;s check-in
                    <Chevron />
                  </Link>
                  <Link
                    href="/protocols"
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs text-white no-underline backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
                  >
                    Browse protocols
                  </Link>
                </div>
              </Reveal>
            </div>

            <ul className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6">
              {capabilities.map((item, index) => (
                <li key={item.title} className="border-b border-white/15 last:border-b-0">
                  <Reveal delay={300 + index * 110}>
                    <Link href={item.href} className="group flex gap-5 py-5 no-underline">
                      <span className="text-[11px] tracking-[0.15em] text-white/55">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="flex items-center gap-1.5 text-base font-medium text-white sm:text-lg">
                          {item.title}
                          <Chevron
                            size={16}
                            className="text-white/40 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                          />
                        </span>
                        <span className="mt-1.5 block text-sm leading-relaxed text-white/70">{item.body}</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}

/** Illustrative recovery ring in the portrait slot. Labelled as a sample. */
function ReadoutTile() {
  const value = 72;
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="relative flex h-24 w-20 flex-col items-center justify-center rounded-lg border border-white/20 bg-black/30"
      role="img"
      aria-label={`Sample recovery score ${value} out of 100`}
    >
      <svg viewBox="0 0 64 64" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="var(--color-brass)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="absolute top-[1.9rem] text-sm font-medium text-white">{value}</span>
      <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/60">Sample</span>
    </div>
  );
}
