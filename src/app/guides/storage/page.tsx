import type { Metadata } from "next";
import Link from "next/link";
import { pepipediaStorage } from "@/lib/data/pepipedia";

export const metadata: Metadata = {
  title: "Storage",
};

export default function StorageGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="eyebrow">
        <Link href="/guides" className="text-brass no-underline hover:text-ink">
          Guides
        </Link>
      </p>
      <h1 className="mt-2 font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">
        Storage
      </h1>
      <p className="mt-4 max-w-prose">
        Two states, two rules, taken from Pepipedia’s reconstitution guide. Dry
        powder is stable if it stays dry and cold. Once water is in the vial, the
        clock starts.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
          <h2 className="font-display text-xl font-medium tracking-[-0.02em]">Lyophilized</h2>
          <p className="mt-2 text-sm text-mute">{pepipediaStorage.lyophilized}</p>
        </section>
        <section className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
          <h2 className="font-display text-xl font-medium tracking-[-0.02em]">Reconstituted</h2>
          <p className="mt-2 text-sm text-mute">{pepipediaStorage.reconstituted}</p>
        </section>
        <section className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
          <h2 className="font-display text-xl font-medium tracking-[-0.02em]">Bacteriostatic water</h2>
          <p className="mt-2 text-sm text-mute">{pepipediaStorage.bacWater}</p>
        </section>
        <section className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
          <h2 className="font-display text-xl font-medium tracking-[-0.02em]">Nasal sprays</h2>
          <p className="mt-2 text-sm text-mute">{pepipediaStorage.nasal}</p>
        </section>
      </div>

      <h2 className="mt-10 font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
        Discard if
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>The solution is cloudy, flecked, or will not clear after swirling.</li>
        <li>GHK-Cu loses its blue-green colour or throws a precipitate.</li>
        <li>Glutathione darkens — thiols oxidise even when the molecule’s safety file is otherwise quiet.</li>
        <li>The stopper has been punctured so often it cores or leaks.</li>
        <li>You cannot read the concentration on the label you wrote.</li>
      </ul>
    </div>
  );
}
