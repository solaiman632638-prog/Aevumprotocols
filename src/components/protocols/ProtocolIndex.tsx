"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { categories, type CategorySlug } from "@/lib/types";
import { categoryName } from "@/lib/data/protocols";

/** One register line: a NovaEvum worksheet, or a protocol-only compound. */
export type RegisterRow = {
  slug: string;
  name: string;
  category: CategorySlug;
  amount: string;
  route: string;
  score?: number;
  stocked: boolean;
  blend: boolean;
  /** Extra text the search box matches: synonyms, uses, effects. */
  keywords: string;
};

export function ProtocolIndex({ protocols }: { protocols: RegisterRow[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return protocols.filter((protocol) => {
      const inCategory = category === "all" || protocol.category === category;
      if (!inCategory) return false;
      if (!needle) return true;
      const haystack = [protocol.name, protocol.slug, protocol.route, protocol.keywords]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [protocols, query, category]);

  return (
    <div>
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-72">
          <label htmlFor="protocol-search" className="mb-1 block text-sm">
            Search
          </label>
          <input
            id="protocol-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or synonym"
            className="w-full border border-rule bg-sheet px-3 py-2 text-sm outline-none focus:border-pine rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
            All
          </FilterChip>
          {categories.map((item) => (
            <FilterChip
              key={item.slug}
              active={category === item.slug}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border border-rule bg-sheet rounded-3xl">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className="px-4 py-3 font-medium">Compound</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Typical amount</th>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Pepipedia</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((protocol) => (
              <tr key={protocol.slug} className="border-b border-rule last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/protocols/${protocol.slug}`}
                    className="font-medium text-pine-deep no-underline hover:underline"
                  >
                    {protocol.name}
                  </Link>
                  {protocol.stocked ? (
                    <span className="ml-2 rounded-full border border-pine px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-pine-deep">
                      NovaEvum
                    </span>
                  ) : null}
                  {protocol.blend ? (
                    <span className="ml-2 font-mono text-[0.65rem] text-mute">
                      blend
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-mute">
                  {categoryName(protocol.category)}
                </td>
                <td className="px-4 py-3 font-mono text-[0.8rem]">
                  {protocol.amount}
                </td>
                <td className="px-4 py-3 text-mute">{protocol.route}</td>
                <td className="px-4 py-3 font-mono text-[0.8rem] text-mute">
                  {protocol.score != null ? `${protocol.score}/100` : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-mute">
                  No protocols match that search. Clear the filter or try another name.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-1.5 text-xs ${active ? "border-pine bg-pine text-on-accent" : "border-rule bg-sheet text-mute hover:border-ink hover:text-ink"} rounded-full`}
    >
      {children}
    </button>
  );
}
