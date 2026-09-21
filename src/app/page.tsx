import Link from "next/link";
import { ReconCalculator } from "@/components/calc/ReconCalculator";
import { library, systems } from "@/lib/data/library";
import { categoryName, protocols, stacks } from "@/lib/data/protocols";

export default function Home() {
  const featured = protocols.filter((protocol) =>
    ["bpc-157", "wolverine-stack", "cjc-1295", "tirzepatide", "ghk-cu", "semax"].includes(
      protocol.slug,
    ),
  );

  const stats = [
    { value: library.length, label: "Pepipedia monographs" },
    { value: protocols.length, label: "Catalog worksheets" },
    { value: systems.length, label: "Body systems" },
    { value: stacks.length, label: "Stack sheets" },
  ];

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:pb-24">
        <p className="eyebrow">Goals · risk · catalog vials · optional Whoop / Google Fit</p>
        <h1 className="mt-5 max-w-7xl font-display text-6xl font-light leading-[0.9] tracking-[-0.04em] sm:text-8xl lg:text-[7.5rem]">
          Tell it the goal. Get the vial, the draw, the plan.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-mute">
          A matcher against the NovaEvum catalog, not a clinic. Conservative
          stays at one compound. Aggressive can stack. A connected strap tells
          you when to hold a pulse.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/plan" className="btn-primary">
            Build a worksheet
          </Link>
          <Link href="/today" className="btn-secondary">
            Open today
          </Link>
        </div>
      </section>

      <section className="border-y border-rule">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="py-8 pr-4">
              <dt className="eyebrow">{stat.label}</dt>
              <dd className="mt-2 font-display text-5xl font-light tracking-[-0.04em] sm:text-6xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl">
            Syringe math, done before you uncap.
          </h2>
          <p className="mt-6 max-w-md text-mute">
            Vial size, water, target amount. The calculator returns concentration
            and insulin-syringe units, and flags draws past the barrel.
          </p>
          <Link href="/calculator" className="btn-secondary mt-8">
            Open the calculator
          </Link>
        </div>
        <div className="lg:col-span-7">
          <ReconCalculator />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl">
            Open a compound
          </h2>
          <Link href="/protocols" className="btn-secondary self-start sm:self-auto">
            Full register
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((protocol) => (
            <li key={protocol.slug}>
              <Link
                href={`/protocols/${protocol.slug}`}
                className="group flex h-full min-h-48 flex-col justify-between rounded-3xl border border-rule bg-sheet p-6 no-underline transition-colors hover:border-pine"
              >
                <span className="eyebrow">{categoryName(protocol.category)}</span>
                <span>
                  <span className="block font-display text-3xl font-light tracking-[-0.03em] text-ink">
                    {protocol.name}
                  </span>
                  <span className="mt-2 block text-sm text-mute">
                    {protocol.doses[0]?.amount} · {protocol.route}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col gap-8 rounded-[1.875rem] bg-[#1e1e1e] px-6 py-12 sm:px-12 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <div>
            <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl">
              Not on the catalog?
            </h2>
            <p className="mt-5 max-w-xl text-mute">
              The library carries all {library.length} Pepipedia monographs:
              mechanism, evidence, status, and safety for every peptide they
              cover.
            </p>
          </div>
          <Link href="/peptides" className="btn-primary self-start lg:self-auto">
            Browse the library
          </Link>
        </div>
      </section>
    </div>
  );
}
