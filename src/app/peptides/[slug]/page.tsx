import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReconCalculator } from "@/components/calc/ReconCalculator";
import { GuideBody } from "@/components/protocols/GuideBody";
import { compoundPage, compoundSlugs } from "@/lib/data/compounds";
import { library, statusName, systemName } from "@/lib/data/library";
import { storeUrl } from "@/lib/data/protocols";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return compoundSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = compoundPage(slug);
  if (!page) return { title: "Compound" };
  const name = page.entry?.name ?? page.guide?.name ?? "Compound";
  const description = page.entry?.summary ?? `${name}: ${page.guide?.typical}. Protocol, reconstitution, and storage.`;
  return { title: name, description, alternates: { canonical: `/peptides/${page.canonical}` } };
}

const heading = "font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl";

export default async function CompoundPage({ params }: Props) {
  const { slug } = await params;
  const page = compoundPage(slug);
  if (!page) notFound();

  const { entry, guide, worksheet } = page;
  const name = entry?.name ?? guide!.name;
  const related = entry
    ? library
        .filter((item) => item.system === entry.system && item.slug !== entry.slug)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 6)
    : [];

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        <Link href="/peptides" className="text-brass no-underline hover:underline">Compounds</Link>
        {entry ? ` · ${systemName(entry.system)}` : null}
        {entry?.primaryUse ? ` · ${entry.primaryUse}` : null}
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">{name}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {worksheet ? (
          <span className="rounded-full border border-pine px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-pine-deep">
            On NovaEvum
          </span>
        ) : null}
        {guide ? (
          <span className="rounded-full border border-rule px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-mute">
            Full protocol
          </span>
        ) : null}
        {entry?.isNew ? (
          <span className="rounded-full border border-rule px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-pine-deep">New</span>
        ) : null}
      </div>

      {entry?.synonyms.length ? <p className="mt-4 text-sm text-mute">{entry.synonyms.join(", ")}</p> : null}
      {entry ? <p className="mt-5 max-w-3xl">{entry.summary}</p> : null}
      {guide ? <p className="mt-3 text-lg">{guide.typical}</p> : null}
      {entry ? (
        <p className="mt-3 text-sm text-mute">Research score {entry.researchScore}/100. Reference only, not a prescription.</p>
      ) : null}

      {entry?.boxedWarning ? (
        <p className="mt-5 max-w-3xl rounded-3xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          <span className="font-medium">Boxed warning:</span> {entry.boxedWarning}
        </p>
      ) : null}

      {entry?.effects.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {entry.effects.map((effect) => (
            <li key={effect} className="rounded-full border border-rule bg-sheet px-2.5 py-1 font-mono text-[0.7rem] text-mute">
              {effect}
            </li>
          ))}
        </ul>
      ) : null}

      {entry ? (
        <dl className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="US status" value={entry.legal} />
          <Meta label="Approval" value={entry.approval} />
          <Meta label="Evidence" value={entry.evidence} />
          <Meta label="Research score" value={`${entry.researchScore} / 100`} />
          {entry.indication ? <Meta label="Indication" value={entry.indication} /> : null}
          {entry.origin ? <Meta label="Origin" value={entry.origin} /> : null}
          <Meta label="Source category" value={entry.pepipediaCategory} />
          <Meta label="Status group" value={statusName(entry.status)} />
        </dl>
      ) : null}

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="min-w-0 space-y-12 lg:col-span-7">
          {entry ? (
            <>
              <section>
                <h2 className={heading}>Mechanism</h2>
                <p className="mt-3 max-w-prose">
                  {entry.mechanism || (
                    <span className="text-mute">
                      The published mechanism text for this entry describes a different compound, so it is left out here.
                    </span>
                  )}
                </p>
              </section>
              <section>
                <h2 className={heading}>Safety file</h2>
                <p className="mt-3 max-w-prose">{entry.safety}</p>
                {entry.sideEffects.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {entry.sideEffects.map((item) => (
                      <li key={item} className="rounded-full border border-warn/30 bg-warn-tint px-2.5 py-1 text-xs text-warn">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            </>
          ) : null}

          {guide ? <GuideBody guide={guide} /> : null}

          {worksheet ? (
            <section aria-labelledby="worksheet">
              <p className="eyebrow">NovaEvum vial</p>
              <h2 id="worksheet" className="mt-2 font-display text-4xl font-light tracking-[-0.03em] sm:text-5xl">
                Worksheet
              </h2>
              <p className="mt-3 max-w-prose text-mute">{worksheet.reconstitution}</p>
              <dl className="mt-6 grid gap-px overflow-hidden rounded-3xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
                <Meta label="Catalog fill" value={worksheet.vialLabel ?? `${worksheet.vialMg} mg`} />
                <Meta label="Typical water" value={`${worksheet.typicalWaterMl} mL`} />
                <Meta label="Route" value={worksheet.route} />
                <Meta label="Cycle" value={worksheet.cycle} />
              </dl>
              <div className="mt-6 overflow-x-auto rounded-3xl border border-rule">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-rule bg-sheet">
                    <tr>
                      <th className="px-3 py-2 font-medium">Step</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Frequency</th>
                      <th className="px-3 py-2 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {worksheet.doses.map((dose) => (
                      <tr key={dose.label} className="border-b border-rule last:border-b-0">
                        <td className="px-3 py-2">{dose.label}</td>
                        <td className="px-3 py-2 font-mono text-[0.8rem]">{dose.amount}</td>
                        <td className="px-3 py-2">{dose.frequency}</td>
                        <td className="px-3 py-2 text-mute">{dose.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-6 max-w-prose list-disc space-y-2 pl-5 text-sm">
                {worksheet.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="no-print lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-32">
            {worksheet ? (
              <div className="rounded-3xl border border-pine bg-sheet px-5 py-5">
                <h2 className="font-display text-lg font-medium tracking-[-0.02em]">On the catalog</h2>
                <p className="mt-2 text-sm text-mute">
                  {worksheet.vialLabel ?? `${worksheet.vialMg} mg`} vial, with the reconstitution math below.
                </p>
                <a href={storeUrl(worksheet.slug)} className="btn-primary mt-4" rel="noreferrer" target="_blank">
                  View on NovaEvum
                </a>
              </div>
            ) : null}

            {guide || worksheet ? (
              <ReconCalculator
                compoundName={name}
                defaultVialMg={worksheet?.vialMg ?? guide!.defaultVialMg}
                defaultWaterMl={worksheet?.typicalWaterMl ?? guide!.defaultWaterMl}
                defaultDoseMcg={worksheet?.doseMcg ?? guide!.startDoseMcg}
              />
            ) : null}

            {related.length > 0 ? (
              <div className="rounded-3xl border border-rule bg-sheet px-5 py-5">
                <h2 className="font-display text-lg font-medium tracking-[-0.02em]">
                  More in {systemName(entry!.system)}
                </h2>
                <ul className="mt-3 space-y-2">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/peptides/${item.slug}`} className="text-pine-deep no-underline hover:underline">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-sheet px-4 py-3">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
