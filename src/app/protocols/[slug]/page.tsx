import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReconCalculator } from "@/components/calc/ReconCalculator";
import { GuideBody } from "@/components/protocols/GuideBody";
import { getGuide, guides, type Guide } from "@/lib/data/guides";
import { getEntry } from "@/lib/data/library";
import { categoryName, getProtocol, protocols, storeUrl } from "@/lib/data/protocols";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const slugs = new Set([...protocols.map((p) => p.slug), ...guides.map((g) => g.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  const guide = getGuide(slug);
  if (protocol) return { title: protocol.name, description: protocol.summary };
  if (guide) return { title: `${guide.name} protocol`, description: `${guide.name}: ${guide.typical}. Reconstitution, schedule, duration, and storage.` };
  return { title: "Protocol" };
}

export default async function ProtocolPage({ params }: Props) {
  const { slug } = await params;
  const protocol = getProtocol(slug);
  const guide = getGuide(slug);
  if (!protocol && !guide) notFound();
  if (!protocol) return <GuidePage guide={guide!} />;

  const related = protocol.related
    .map((item) => getProtocol(item))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        {categoryName(protocol.category)}
        {protocol.form === "blend" ? " · blend vial" : null}
        {protocol.primaryUse ? ` · ${protocol.primaryUse}` : null}
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        {protocol.name}
      </h1>
      {protocol.synonyms.length > 0 ? (
        <p className="mt-2 text-sm text-mute">{protocol.synonyms.join(", ")}</p>
      ) : null}
      <p className="mt-5 max-w-3xl">{protocol.summary}</p>
      {protocol.pepipediaSlug && getEntry(protocol.pepipediaSlug) ? (
        <p className="mt-3">
          <Link href={`/peptides/${protocol.pepipediaSlug}`} className="text-sm text-pine-deep no-underline hover:underline">
            Library entry →
          </Link>
        </p>
      ) : null}

      {protocol.effects && protocol.effects.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {protocol.effects.map((effect) => (
            <li
              key={effect}
              className="border border-rule bg-sheet px-2.5 py-1 font-mono text-[0.7rem] text-mute rounded-full"
            >
              {effect}
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden">
        <Meta label="Catalog fill" value={protocol.vialLabel ?? `${protocol.vialMg} mg`} />
        <Meta label="Typical water" value={`${protocol.typicalWaterMl} mL`} />
        <Meta label="Route" value={protocol.route} />
        <Meta label="Cycle" value={protocol.cycle} />
        {protocol.approval ? <Meta label="Approval" value={protocol.approval} /> : null}
        {protocol.legal ? <Meta label="Status" value={protocol.legal} /> : null}
        {protocol.evidence ? <Meta label="Evidence" value={protocol.evidence} /> : null}
        {protocol.researchScore != null ? (
          <Meta label="Research score" value={`${protocol.researchScore} / 100`} />
        ) : null}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-7">
          {protocol.mechanism ? (
            <section>
              <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                Mechanism
              </h2>
              <p className="mt-3 max-w-prose">{protocol.mechanism}</p>
            </section>
          ) : null}

          {protocol.safety ? (
            <section>
              <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
                Safety file
              </h2>
              <p className="mt-3 max-w-prose">{protocol.safety}</p>
              {protocol.sideEffects && protocol.sideEffects.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {protocol.sideEffects.map((item) => (
                    <li
                      key={item}
                      className="border border-warn/30 bg-warn-tint px-2.5 py-1 text-xs text-warn rounded-full"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Reconstitution
            </h2>
            <p className="mt-3 max-w-prose">{protocol.reconstitution}</p>
          </section>

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Research amounts
            </h2>
            <p className="mt-2 text-sm text-mute">{protocol.schedule}</p>
            <div className="mt-4 overflow-x-auto border border-rule rounded-3xl">
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
                  {protocol.doses.map((dose) => (
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
          </section>

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Storage
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-rule bg-sheet px-4 py-3 rounded-3xl">
                <dt className="text-xs text-mute">Lyophilized</dt>
                <dd className="mt-1">{protocol.storageLyophilized}</dd>
              </div>
              <div className="border border-rule bg-sheet px-4 py-3 rounded-3xl">
                <dt className="text-xs text-mute">After water</dt>
                <dd className="mt-1">{protocol.storageReconstituted}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Worksheet notes
            </h2>
            <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
              {protocol.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="no-print lg:col-span-5">
          <div className="mb-6 flex flex-col gap-3 border border-pine bg-sheet px-4 py-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl">
            <p className="text-sm text-mute">
              {protocol.name} · {protocol.vialLabel ?? `${protocol.vialMg} mg`} vial
            </p>
            <a
              href={storeUrl(protocol.slug)}
              className="btn-primary self-start sm:self-auto"
              rel="noreferrer"
              target="_blank"
            >
              View on NovaEvum
            </a>
          </div>
          <ReconCalculator
            compoundName={protocol.name}
            defaultVialMg={protocol.vialMg}
            defaultWaterMl={protocol.typicalWaterMl}
            defaultDoseMcg={protocol.doseMcg}
          />
          {related.length > 0 ? (
            <div className="mt-6 border border-rule bg-sheet px-4 py-4 rounded-3xl">
              <h2 className="font-display text-lg font-medium tracking-[-0.02em]">Related sheets</h2>
              <ul className="mt-3 space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/protocols/${item.slug}`}
                      className="text-pine-deep no-underline hover:underline"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {guide ? (
        <section className="mt-20 border-t border-rule pt-12" aria-labelledby="full-protocol">
          <p className="eyebrow">Full protocol</p>
          <h2 id="full-protocol" className="mt-2 font-display text-5xl font-light tracking-[-0.035em] sm:text-6xl">
            Titration, schedule, and handling
          </h2>
          <p className="mt-3 max-w-2xl text-mute">
            The complete protocol for {guide.name}. Where it differs from the
            worksheet amounts above, the worksheet reflects the NovaEvum vial.
          </p>
          <div className="mt-10">
            <GuideBody guide={guide} />
          </div>
        </section>
      ) : null}
    </article>
  );
}

function GuidePage({ guide }: { guide: Guide }) {
  const entry = guide.librarySlug ? getEntry(guide.librarySlug) : undefined;
  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        {categoryName(guide.category)}
        {entry?.primaryUse ? ` · ${entry.primaryUse}` : null}
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        {guide.name}
      </h1>
      <p className="mt-4 text-lg">{guide.typical}</p>
      {entry ? (
        <>
          <p className="mt-5 max-w-3xl text-mute">{entry.summary}</p>
          <p className="mt-3">
            <Link href={`/peptides/${entry.slug}`} className="text-sm text-pine-deep no-underline hover:underline">
              Library entry →
            </Link>
          </p>
        </>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <GuideBody guide={guide} />
        </div>
        <aside className="no-print lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <ReconCalculator
              compoundName={guide.name}
              defaultVialMg={guide.defaultVialMg}
              defaultWaterMl={guide.defaultWaterMl}
              defaultDoseMcg={guide.startDoseMcg}
            />
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
