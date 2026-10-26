import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YourAmount } from "@/components/supplements/YourAmount";
import { evidenceNotes, getSupplement, goalName, supplements } from "@/lib/data/supplements";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return supplements.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = getSupplement((await params).slug);
  if (!item) return { title: "Supplement" };
  return { title: item.name, description: item.summary };
}

const heading = "font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl";

export default async function SupplementPage({ params }: Props) {
  const item = getSupplement((await params).slug);
  if (!item) notFound();
  const { dose } = item;

  const facts: [string, string][] = [
    ["How much", dose.amount],
    ["When", dose.timing],
    ["What to buy", dose.form],
    ["How long", dose.takesEffect],
    ...(dose.upperLimit ? ([["Upper limit", dose.upperLimit]] as [string, string][]) : []),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        <Link href="/supplements" className="text-brass no-underline hover:underline">Supplements</Link>
        {` · ${item.goals.map(goalName).join(" · ")}`}
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">{item.name}</h1>
      {item.aka ? <p className="mt-3 text-sm text-mute">{item.aka}</p> : null}
      <p className="mt-5 text-lg">{item.summary}</p>
      <p className="mt-3 text-sm text-mute">
        <span className="text-ink">{item.evidence} evidence.</span> {evidenceNotes[item.evidence]}
      </p>

      <section className="mt-10">
        <h2 className={heading}>What it does</h2>
        <p className="mt-3">{item.whatItDoes}</p>
        <h3 className="mt-6 font-display text-xl font-medium tracking-[-0.02em]">How it works</h3>
        <p className="mt-2 text-mute">{item.howItWorks}</p>
        <h3 className="mt-6 font-display text-xl font-medium tracking-[-0.02em]">Who it helps most</h3>
        <p className="mt-2 text-mute">{item.whoBenefits}</p>
      </section>

      <section className="mt-10 rounded-3xl border border-rule bg-sheet p-5 sm:p-8">
        <h2 className={heading}>How much to take</h2>
        <div className="mt-4">
          <YourAmount slug={item.slug} />
        </div>
        <dl className="mt-6 space-y-4">
          {facts.map(([label, value]) => (
            <div key={label} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
              <dt className="text-sm text-mute">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Side effects</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-mute">
            {item.sideEffects.map((effect) => <li key={effect}>{effect}</li>)}
          </ul>
        </div>
        {item.interactions.length ? (
          <div>
            <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Medicines and cautions</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mute">
              {item.interactions.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-10 text-sm text-mute">
        Educational only, not medical advice. Supplements are not tested like drugs; choose third-party tested brands
        (NSF Certified for Sport, Informed Sport, USP) and tell your doctor what you take.
      </p>
    </article>
  );
}
