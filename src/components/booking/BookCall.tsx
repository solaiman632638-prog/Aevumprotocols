"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import type { Booking } from "@/lib/booking/server";
import { hours } from "@/lib/booking/slots";
import { syncClient } from "@/lib/sync/client";
import { useSession } from "@/lib/sync/useSession";

type State =
  | { kind: "loading" }
  | { kind: "setup" }
  | { kind: "error"; message: string }
  | { kind: "ready"; slots: string[]; mine: Booking | null };

const ease = [0.16, 1, 0.3, 1] as const;
const card = "rounded-3xl border border-rule bg-sheet p-5 sm:p-7";
const field =
  "w-full rounded-2xl border border-rule bg-paper px-4 py-3 text-ink outline-none transition-colors placeholder:text-dim focus:border-mute";

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
const time = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
const fullTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = (await syncClient()?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchState(): Promise<State> {
  const response = await fetch("/api/booking", { headers: await authHeaders(), cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (response.status === 503) return { kind: "setup" };
  if (!response.ok) return { kind: "error", message: "Could not load times. Refresh to try again." };
  return { kind: "ready", slots: body.slots, mine: body.mine };
}

/**
 * Pick a day, pick a time, confirm. Times show in the viewer's own zone; the
 * expert's hours are set in lib/booking/slots. One upcoming call per person.
 */
export function BookCall() {
  const session = useSession();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => setState(await fetchState()), []);

  useEffect(() => {
    if (!session.ready) return;
    let cancelled = false;
    void fetchState().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [session.ready, session.email]);

  // Default the name once the session knows it, without overwriting typing.
  const [namedFrom, setNamedFrom] = useState<string | null>(null);
  if (session.name && namedFrom !== session.name) {
    setNamedFrom(session.name);
    if (!name) setName(session.name);
  }

  const days = useMemo(() => {
    if (state.kind !== "ready") return [];
    const map = new Map<string, string[]>();
    for (const iso of state.slots) map.set(dayKey(iso), [...(map.get(dayKey(iso)) ?? []), iso]);
    return [...map.entries()].map(([key, slots]) => ({ key, slots }));
  }, [state]);

  const activeDay = days.find((entry) => entry.key === day) ?? days[0];
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " "), []);

  async function book() {
    if (!slot) return;
    setBusy(true);
    setError(null);
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ start: slot, name, note }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(body.error ?? "Could not book. Try again.");
      if (response.status === 409) void load();
      return;
    }
    setSlot(null);
    setNote("");
    setState((current) => (current.kind === "ready" ? { ...current, mine: body.booking } : current));
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/booking", { method: "DELETE", headers: await authHeaders() });
    setBusy(false);
    if (!response.ok) return setError("Could not cancel. Try again.");
    await load();
  }

  if (!session.ready || state.kind === "loading") return <p className="text-mute">Loading times…</p>;

  if (state.kind === "setup") {
    return (
      <div className={card}>
        <p className="text-mute">Booking opens soon. Check back in a day or two.</p>
      </div>
    );
  }
  if (state.kind === "error") return <p className="text-warn">{state.message}</p>;

  if (state.mine) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className={card}
          aria-labelledby="booked-heading"
          style={{ backgroundImage: "radial-gradient(120% 90% at 0% 0%, color-mix(in oklab, var(--color-recovery) 14%, transparent), transparent 60%)" }}
        >
          <p className="flex items-center gap-2.5 text-ink">
            <span aria-hidden className="h-2 w-2 rounded-full bg-recovery" />
            You&apos;re booked
          </p>
          <h2 id="booked-heading" className="mt-4 font-display text-3xl font-light tracking-[-0.03em] sm:text-4xl">
            {fullTime(state.mine.starts_at)}
          </h2>
          <p className="mt-2 text-mute">
            {hours.callMinutes} minutes · we&apos;ll email the call details to {state.mine.email}
          </p>
          {state.mine.note ? <p className="mt-4 border-t border-rule pt-4 text-sm text-mute">“{state.mine.note}”</p> : null}
          <button type="button" onClick={cancel} disabled={busy} className="btn-secondary mt-6 disabled:opacity-50">
            {busy ? "Cancelling…" : "Cancel this call"}
          </button>
          {error ? <p className="mt-3 text-sm text-warn">{error}</p> : null}
        </motion.section>
      </MotionConfig>
    );
  }

  if (days.length === 0) {
    return (
      <div className={card}>
        <p className="text-mute">Every time in the next two weeks is taken. New times open each day, so check back tomorrow.</p>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        <section aria-labelledby="day-heading">
          <h2 id="day-heading" className="text-sm text-mute">
            Pick a day
          </h2>
          <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {days.map((entry) => {
              const date = new Date(entry.slots[0]);
              const on = entry.key === activeDay?.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setDay(entry.key);
                    setSlot(null);
                  }}
                  className={`relative flex min-w-16 shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition-colors ${
                    on ? "border-ink text-on-accent" : "border-rule bg-sheet text-ink hover:border-mute"
                  }`}
                >
                  {on ? (
                    <motion.span layoutId="book-day" aria-hidden className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 500, damping: 40 }} />
                  ) : null}
                  <span className={`relative text-xs ${on ? "" : "text-mute"}`}>{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <span className="relative mt-0.5 text-2xl tabular-nums">{date.getDate()}</span>
                  <span className={`relative text-xs ${on ? "" : "text-mute"}`}>{date.toLocaleDateString(undefined, { month: "short" })}</span>
                </button>
              );
            })}
          </div>
        </section>

        {activeDay ? (
          <section aria-labelledby="time-heading">
            <h2 id="time-heading" className="text-sm text-mute">
              Pick a time <span className="text-dim">· {zone} time</span>
            </h2>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {activeDay.slots.map((iso) => {
                const on = iso === slot;
                return (
                  <li key={iso}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSlot(iso)}
                      className={`min-h-12 w-full rounded-2xl border text-sm tabular-nums transition-colors ${
                        on ? "border-ink bg-ink font-semibold text-on-accent" : "border-rule bg-sheet text-ink hover:border-mute"
                      }`}
                    >
                      {time(iso)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <AnimatePresence>
          {slot ? (
            <motion.section
              key="confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease }}
              className={card}
              aria-labelledby="confirm-heading"
            >
              <h2 id="confirm-heading" className="font-display text-2xl font-light tracking-[-0.02em] sm:text-3xl">
                {fullTime(slot)}
              </h2>
              <p className="mt-1 text-sm text-mute">{hours.callMinutes}-minute call</p>

              {session.email ? (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void book();
                  }}
                >
                  <div>
                    <label htmlFor="book-name" className="text-sm text-mute">
                      Your name
                    </label>
                    <input id="book-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={80} required className={`mt-1.5 ${field}`} />
                  </div>
                  <div>
                    <label htmlFor="book-note" className="text-sm text-mute">
                      What would you like to talk about? <span className="text-dim">Optional</span>
                    </label>
                    <textarea
                      id="book-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      maxLength={600}
                      placeholder="For example: starting BPC-157, or side effects I've noticed"
                      className={`mt-1.5 resize-none ${field}`}
                    />
                  </div>
                  <p className="text-sm text-mute">Confirmation goes to {session.email}.</p>
                  <button type="submit" disabled={busy || !name.trim()} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
                    {busy ? "Booking…" : `Book ${time(slot)}`}
                  </button>
                  {error ? <p className="text-sm text-warn">{error}</p> : null}
                </form>
              ) : (
                <div className="mt-6">
                  <p className="text-mute">Sign in so we can send your confirmation and call details.</p>
                  <Link href="/account" className="btn-primary mt-4">
                    Sign in to book
                  </Link>
                </div>
              )}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
