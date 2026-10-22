"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import type { CompoundRow } from "@/lib/data/compounds";
import { statuses, systems } from "@/lib/data/library";

type Sort = "name" | "score";

const control = "w-full rounded-xl border border-rule bg-sheet px-3 py-2 text-sm outline-none focus:border-pine";

/** One register for research monographs, protocols, and catalog worksheets. */
export function LibraryIndex({ rows }: { rows: CompoundRow[] }) {
  const [query, setQuery] = useState("");
  const [system, setSystem] = useState("all");
  const [status, setStatus] = useState("all");
  const [only, setOnly] = useState<"all" | "protocol" | "stocked">("all");
  const [sort, setSort] = useState<Sort>("name");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = rows.filter((row) => {
      if (system !== "all" && row.system !== system) return false;
      if (status !== "all" && row.status !== status) return false;
      if (only === "protocol" && !row.hasProtocol) return false;
      if (only === "stocked" && !row.stocked) return false;
      if (!needle) return true;
      return [row.name, row.slug, row.primaryUse, row.keywords].join(" ").toLowerCase().includes(needle);
    });
    const sorted = sort === "score" ? matched.toSorted((a, b) => (b.score ?? -1) - (a.score ?? -1)) : matched;
    // Stocked compounds lead, then anything with a protocol.
    return sorted.toSorted((a, b) => Number(b.stocked) - Number(a.stocked) || Number(b.hasProtocol) - Number(a.hasProtocol));
  }, [rows, query, system, status, only, sort]);

  const stockedCount = filtered.filter((row) => row.stocked).length;
  const protocolCount = filtered.filter((row) => row.hasProtocol && !row.stocked).length;

  return (
    <div>
      <div className="no-print mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="sm:w-80">
            <label htmlFor="library-search" className="mb-1 block text-sm">Search</label>
            <input
              id="library-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, brand, effect, or use"
              className={control}
            />
          </div>
          <div className="sm:w-52">
            <label htmlFor="library-status" className="mb-1 block text-sm">Status</label>
            <select id="library-status" value={status} onChange={(event) => setStatus(event.target.value)} className={control}>
              <option value="all">Any status</option>
              {statuses.map((item) => (
                <option key={item.slug} value={item.slug}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-52">
            <label htmlFor="library-show" className="mb-1 block text-sm">Show</label>
            <select id="library-show" value={only} onChange={(event) => setOnly(event.target.value as typeof only)} className={control}>
              <option value="all">Everything</option>
              <option value="protocol">With a protocol</option>
              <option value="stocked">On NovaEvum</option>
            </select>
          </div>
          <div className="sm:w-44">
            <label htmlFor="library-sort" className="mb-1 block text-sm">Sort</label>
            <select id="library-sort" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className={control}>
              <option value="name">A–Z</option>
              <option value="score">Research score</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={system === "all"} onClick={() => setSystem("all")}>All systems</FilterChip>
          {systems.map((item) => (
            <FilterChip key={item.slug} active={system === item.slug} onClick={() => setSystem(item.slug)}>
              {item.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mb-3 font-mono text-[0.75rem] text-mute" aria-live="polite">
        {filtered.length} of {rows.length} compounds
      </p>

      <div className="overflow-x-auto rounded-3xl border border-rule bg-sheet">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-rule bg-paper">
            <tr>
              <th className="px-4 py-3 font-medium">Compound</th>
              <th className="px-4 py-3 font-medium">System</th>
              <th className="px-4 py-3 font-medium">Primary use</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Research score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, index) => (
              <Fragment key={row.slug}>
                {index === 0 && row.stocked ? <GroupRow>On NovaEvum · {stockedCount}</GroupRow> : null}
                {index === stockedCount && protocolCount > 0 ? <GroupRow>With a protocol · {protocolCount}</GroupRow> : null}
                {index === stockedCount + protocolCount && index < filtered.length ? (
                  <GroupRow>Research only · {filtered.length - stockedCount - protocolCount}</GroupRow>
                ) : null}
                <tr className={`border-b border-rule last:border-b-0 ${row.stocked ? "bg-pine/[0.07] shadow-[inset_3px_0_0_var(--color-pine)]" : ""}`}>
                  <td className="px-4 py-3">
                    <Link href={`/peptides/${row.slug}`} className="font-medium text-pine-deep no-underline hover:underline">
                      {row.name}
                    </Link>
                    {row.stocked ? (
                      <span className="ml-2 rounded-full border border-pine px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-pine-deep">
                        NovaEvum
                      </span>
                    ) : row.hasProtocol ? (
                      <span className="ml-2 rounded-full border border-rule px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-mute">
                        Protocol
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-mute">{row.systemLabel}</td>
                  <td className="px-4 py-3 text-mute">{row.primaryUse || "—"}</td>
                  <td className="px-4 py-3 text-mute">{row.statusLabel}</td>
                  <td className="px-4 py-3 font-mono text-[0.8rem] text-mute">{row.score != null ? `${row.score}/100` : "—"}</td>
                </tr>
              </Fragment>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-mute">Nothing matches. Clear a filter or try another name.</td>
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
      <th colSpan={5} scope="colgroup" className="eyebrow px-4 py-2 text-left">
        {children}
      </th>
    </tr>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs ${active ? "border-pine bg-pine text-on-accent" : "border-rule bg-sheet text-mute hover:border-ink hover:text-ink"}`}
    >
      {children}
    </button>
  );
}
