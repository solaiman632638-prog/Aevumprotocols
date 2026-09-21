import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntry,
  library,
  statusName,
  systemName,
  worksheetFor,
} from "@/lib/data/library";
import { guideForLibrary } from "@/lib/data/guides";
import { storeUrl } from "@/lib/data/protocols";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return library.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return { title: "Peptide" };
  return {
    title: entry.name,
    description: entry.summary,
  };
}

export default async function PeptidePage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const worksheet = worksheetFor(entry.slug);
  const guide = worksheet ? undefined : guideForLibrary(entry.slug);
  const related = library
    .filter((item) => item.system === entry.system && item.slug !== entry.slug)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        <Link href="/peptides" className="text-brass no-underline hover:underline">
          Library
        </Link>
        {" · "}
        {systemName(entry.system)}
        {entry.primaryUse ? ` · ${entry.primaryUse}` : null}
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        {entry.name}
        {entry.isNew ? (
          <span className="ml-3 align-middle font-mono text-[0.7rem] font-normal text-pine-deep">
            new
          </span>
        ) : null}
      </h1>
      {entry.synonyms.length > 0 ? (
        <p className="mt-2 text-sm text-mute">{entry.synonyms.join(", ")}</p>
      ) : null}
      <p className="mt-5 max-w-3xl">{entry.summary}</p>
      <p className="mt-3 text-sm text-mute">
        Research score {entry.researchScore}/100. Reference only, not a dose.
      </p>

      {entry.boxedWarning ? (
        <p className="mt-5 max-w-3xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn rounded-3xl">
          <span className="font-medium">Boxed warning:</span> {entry.boxedWarning}
        </p>
      ) : null}

      {entry.effects.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {entry.effects.map((effect) => (
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
        <Meta label="US status" value={entry.legal} />
        <Meta label="Approval" value={entry.approval} />
        <Meta label="Evidence" value={entry.evidence} />
        <Meta label="Research score" value={`${entry.researchScore} / 100`} />
        {entry.indication ? <Meta label="Indication" value={entry.indication} /> : null}
        {entry.origin ? <Meta label="Origin" value={entry.origin} /> : null}
        <Meta label="Source category" value={entry.pepipediaCategory} />
        <Meta label="Status group" value={statusName(entry.status)} />
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 space-y-8 lg:col-span-7">
          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Mechanism
            </h2>
            <p className="mt-3 max-w-prose">
              {entry.mechanism || (
                <span className="text-mute">
                  The published mechanism text for this entry describes a
                  different compound, so it is left out here.
                </span>
              )}
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              Safety file
            </h2>
            <p className="mt-3 max-w-prose">{entry.safety}</p>
            {entry.sideEffects.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {entry.sideEffects.map((item) => (
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
        </div>

        <aside className="no-print space-y-6 lg:col-span-5">
          {worksheet ? (
            <div className="border border-pine bg-sheet px-4 py-4 rounded-3xl">
              <h2 className="font-display text-lg font-medium tracking-[-0.02em]">On the catalog</h2>
              <p className="mt-2 text-sm text-mute">
                NovaEvum stocks this compound. The worksheet has vial math,
                storage, and a pre-filled calculator.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={storeUrl(worksheet)}
                  className="btn-primary"
                  rel="noreferrer"
                  target="_blank"
                >
                  View on NovaEvum
                </a>
                <Link
                  href={`/protocols/${worksheet}`}
                  className="btn-secondary"
                >
                  Open worksheet
                </Link>
              </div>
            </div>
          ) : guide ? (
            <div className="rounded-3xl border border-rule bg-sheet px-4 py-4">
              <h2 className="font-display text-lg font-medium tracking-[-0.02em]">Protocol</h2>
              <p className="mt-2 text-sm text-mute">
                {guide.typical}. Reconstitution, schedule, duration, and a
                pre-filled calculator.
              </p>
              <Link href={`/protocols/${guide.slug}`} className="btn-secondary mt-4">
                Open protocol
              </Link>
            </div>
          ) : null}
          {related.length > 0 ? (
            <div className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
              <h2 className="font-display text-lg font-medium tracking-[-0.02em]">
                More in {systemName(entry.system)}
              </h2>
              <ul className="mt-3 space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/peptides/${item.slug}`}
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
