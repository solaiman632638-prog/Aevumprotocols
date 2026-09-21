import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides",
  description: "How reconstitution, storage, and syringe math work on these worksheets.",
};

const guides = [
  {
    href: "/guides/reconstitution",
    title: "Reconstitution",
    body: "Water volume, swirling, labelling, and why the cake is never shaken.",
  },
  {
    href: "/guides/storage",
    title: "Storage",
    body: "Freezer-preferred powder, 45-day BAC vials, room-temp diluent, nasal fridge rules.",
  },
  {
    href: "/calculator",
    title: "Syringe math",
    body: "mg, mL, mcg, and units on a U-100 syringe.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Guides</h1>
      <p className="mt-3 text-mute">
        Shared method for every sheet. Compound-specific amounts live on the
        protocol pages.
      </p>
      <ul className="mt-8 divide-y divide-rule border border-rule bg-sheet rounded-3xl">
        {guides.map((guide) => (
          <li key={guide.href}>
            <Link href={guide.href} className="block px-5 py-4 no-underline hover:bg-paper">
              <span className="font-medium text-ink">{guide.title}</span>
              <span className="mt-1 block text-sm text-mute">{guide.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
