import type { Metadata } from "next";
import Link from "next/link";
import { getProtocol, stacks } from "@/lib/data/protocols";

export const metadata: Metadata = {
  title: "Stacks",
  description: "Combined research worksheets for compounds that are often run together.",
};

export default function StacksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Stacks</h1>
      <p className="mt-3 text-mute">
        These are pairings, not extra vials you have to buy. Blend products
        already contain more than one peptide — do not add the singles on the
        same days unless you mean to.
      </p>
      <div className="mt-8 space-y-8">
        {stacks.map((stack) => (
          <article key={stack.slug} className="border border-rule bg-sheet px-5 py-5 rounded-3xl">
            <h2 className="font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
              {stack.name}
            </h2>
            <p className="mt-2">{stack.intent}</p>
            <p className="mt-3 text-sm">
              <span className="text-mute">Schedule. </span>
              {stack.schedule}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stack.compounds.map((slug) => {
                const protocol = getProtocol(slug);
                if (!protocol) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/protocols/${slug}`}
                      className="border border-rule bg-paper px-2 py-1 text-sm text-pine-deep no-underline hover:border-pine rounded-full"
                    >
                      {protocol.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-mute">
              {stack.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
