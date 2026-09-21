"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import {
  statusName,
  statuses,
  systemName,
  systems,
  type LibraryRow,
} from "@/lib/data/library";

type Sort = "name" | "score" | "popularity";

export function LibraryIndex({
  entries,
  worksheets,
}: {
  entries: LibraryRow[];
  worksheets: string[];
}) {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<Sort>("name");

  const hasSheet = useMemo(() => new Set(worksheets), [worksheets]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = entries.filter((entry) => {
      if (system !== "all" && entry.system !== system) return false;
      if (status !== "all" && entry.status !== status) return false;
      if (!needle) return true;
      const haystack = [
        entry.name,
        entry.slug,
        ...entry.synonyms,
        entry.primaryUse,
        entry.indication,
        ...entry.effects,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
    const sorted =
      sort === "score"
        ? rows.toSorted((a, b) => b.researchScore - a.researchScore)
        : sort === "popularity"
          ? rows.toSorted((a, b) => b.popularity - a.popularity)
          : rows;
    // NovaEvum stock leads; the chosen sort applies within each group.
    return sorted.toSorted(
      (a, b) => Number(hasSheet.has(b.slug)) - Number(hasSheet.has(a.slug)),
    );
  }, [entries, query, system, status, sort, hasSheet]);

  const stockedCount = filtered.filter((entry) =>
    hasSheet.has(entry.slug),
  ).length;

  return (
    <div>
      <div className="no-print mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="sm:w-80">
            <label htmlFor="library-search" className="mb-1 block text-sm">
              Search
            </label>
            <input
              id="library-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, brand, effect, or use"
              className="w-full border border-rule bg-sheet px-3 py-2 text-sm outline-none focus:border-pine rounded-xl"
            />
          </div>
          <div className="sm:w-56">
            <label htmlFor="library-status" className="mb-1 block text-sm">
              Status
            </label>
            <select
              id="library-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full border border-rule bg-sheet px-3 py-2 text-sm outline-none focus:border-pine rounded-xl"
            >
              <option value="all">Any status</option>
              {statuses.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <label htmlFor="library-sort" className="mb-1 block text-sm">
              Sort
            </label>
            <select
              id="library-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              className="w-full border border-rule bg-sheet px-3 py-2 text-sm outline-none focus:border-pine rounded-xl"
            >
              <option value="name">A–Z</option>
              <option value="score">Research score</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={system === "all"}
            onClick={() => setSystem("all")}
          >
            All systems
          </FilterChip>
          {systems.map((item) => (
            <FilterChip
              key={item.slug}
              active={system === item.slug}
              onClick={() => setSystem(item.slug)}
            >
              {item.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mb-3 font-mono text-[0.75rem] text-mute" aria-live="polite">
        {filtered.length} of {entries.length} monographs
      </p>

      <div className="overflow-x-auto border border-rule bg-sheet rounded-3xl">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className="px-4 py-3 font-medium">Peptide</th>
              <th className="px-4 py-3 font-medium">System</th>
              <th className="px-4 py-3 font-medium">Primary use</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, index) => {
              const stocked = hasSheet.has(entry.slug);
              return (
                <Fragment key={entry.slug}>
                  {index === 0 && stocked ? (
                    <GroupRow>On NovaEvum · {stockedCount}</GroupRow>
                  ) : null}
                  {index === stockedCount && index < filtered.length ? (
                    <GroupRow>
                      Reference only · {filtered.length - stockedCount}
                    </GroupRow>
                  ) : null}
                  <tr
                    className={`border-b border-rule last:border-b-0 ${stocked ? "bg-pine/[0.07] shadow-[inset_3px_0_0_var(--color-pine)]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/peptides/${entry.slug}`}
                        className="font-medium text-pine-deep no-underline hover:underline"
                      >
                        {entry.name}
                      </Link>
                      {stocked ? (
                        <span className="ml-2 border border-pine px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-pine-deep rounded-full">
                          NovaEvum
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-mute">
                      {systemName(entry.system)}
                    </td>
                    <td className="px-4 py-3 text-mute">
                      {entry.primaryUse || "—"}
                    </td>
                    <td className="px-4 py-3 text-mute">
                      {statusName(entry.status)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[0.8rem] text-mute">
                      {entry.researchScore}/100
                    </td>
                  </tr>
                </Fragment>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-mute">
                  Nothing matches. Clear a filter or try another name.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-rule bg-paper">
      <th
        colSpan={5}
        scope="colgroup"
        className="eyebrow px-4 py-2 text-left"
      >
        {children}
      </th>
    </tr>
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
      aria-pressed={active}
      className={`border px-3 py-1.5 text-xs ${active ? "border-pine bg-pine text-on-accent" : "border-rule bg-sheet text-mute hover:border-ink hover:text-ink"} rounded-full`}
    >
      {children}
    </button>
  );
}
