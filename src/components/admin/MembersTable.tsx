"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Member } from "@/app/api/admin/members/route";
import { syncClient } from "@/lib/sync/client";
import { useSession } from "@/lib/sync/useSession";

type State =
  | { kind: "loading" }
  | { kind: "forbidden" }
  | { kind: "setup" }
  | { kind: "error"; message: string }
  | { kind: "ready"; members: Member[]; thisWeek: number };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const card = "rounded-3xl border border-rule bg-sheet p-6 sm:p-8";
const textLink = "text-pine-deep underline decoration-rule underline-offset-2";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const when = (iso: string | null) => (iso ? dateFormat.format(new Date(iso)) : "—");

export function MembersTable() {
  const session = useSession();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!session.ready || !session.email) return;

    let cancelled = false;
    void (async () => {
      const { data } = await syncClient()!.auth.getSession();
      const response = await fetch("/api/admin/members", {
        headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (cancelled) return;
      if (response.ok) {
        const members: Member[] = body.members;
        const weekAgo = Date.now() - WEEK_MS;
        return setState({ kind: "ready", members, thisWeek: members.filter((m) => Date.parse(m.joined) > weekAgo).length });
      }
      if (body.error === "forbidden" || body.error === "setup") return setState({ kind: body.error });
      setState({ kind: "error", message: body.error ?? "Could not load members." });
    })();
    return () => {
      cancelled = true;
    };
  }, [session.ready, session.email]);

  if (session.ready && !session.email) {
    return (
      <div className={card}>
        <p className="text-sm text-mute">
          <Link href="/account" className={textLink}>Log in</Link> with an admin account to see members.
        </p>
      </div>
    );
  }

  if (state.kind === "loading") return <p className="text-sm text-mute">Loading…</p>;

  if (state.kind === "forbidden") {
    return (
      <div className={card}>
        <p className="text-sm text-mute">This page is only for admins. {session.email} isn&apos;t one.</p>
      </div>
    );
  }

  if (state.kind === "setup") {
    return (
      <div className={card}>
        <p className="text-sm text-mute">
          Admin isn&apos;t set up yet. Add <code>SUPABASE_SERVICE_ROLE_KEY</code> and <code>ADMIN_EMAILS</code> to the
          environment, then restart.
        </p>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={card}>
        <p className="text-sm text-warn">{state.message}</p>
      </div>
    );
  }

  const { members, thisWeek } = state;
  const aevum = members.filter((m) => m.aevum).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total accounts", members.length],
          ["Aevum members", aevum],
          ["Joined this week", thisWeek],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-rule bg-sheet p-4">
            <p className="text-xs text-mute">{label}</p>
            <p className="mt-1 font-display text-3xl font-light tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-rule bg-sheet">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-mute">
            <tr className="border-b border-rule">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3 font-medium">From</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-rule last:border-0">
                <td className="px-4 py-3">{m.name ?? <span className="text-dim">—</span>}</td>
                <td className="px-4 py-3">
                  {m.email}
                  {m.confirmed ? null : <span className="ml-2 text-xs text-dim">unconfirmed</span>}
                </td>
                <td className="px-4 py-3 tabular-nums text-mute">{when(m.joined)}</td>
                <td className="px-4 py-3 tabular-nums text-mute">{when(m.lastSignIn)}</td>
                <td className="px-4 py-3 text-mute">{m.aevum ? "Aevum" : "Store"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
