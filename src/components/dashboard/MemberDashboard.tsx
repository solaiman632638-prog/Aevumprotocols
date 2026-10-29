"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { motion, MotionConfig } from "motion/react";
import { BodyMap } from "@/components/peptides/BodyMap";
import { statusStyle } from "@/components/peptides/PeptidePanel";
import { TrendChart, type TrendPoint } from "@/components/today/TrendChart";
import { siteLabel } from "@/lib/peptides/catalog";
import { dueDoses, peptideReport, protocolRuns, type Guidance, type ProtocolRun } from "@/lib/peptides/engine";
import { syncClient } from "@/lib/sync/client";
import { friendly } from "@/lib/sync/errors";
import { syncNow } from "@/lib/sync/sync";
import { useSession } from "@/lib/sync/useSession";
import { buildReport } from "@/lib/today/engine";
import { projectWeight, type WeightProjection } from "@/lib/today/projection";
import { keys, readRaw, subscribe, todayIso } from "@/lib/today/storage";
import type { DayState, Score, UserContext } from "@/lib/today/types";
import { Figure, scoreColour, TickMeter } from "@/components/today/Readout";
import { greeting, shiftDays, streak } from "@/lib/today/streak";

const card = "rounded-3xl border border-rule bg-sheet p-5 sm:p-6";
const heading = "font-display text-2xl font-light tracking-[-0.02em] sm:text-3xl";

function useStored<T>(key: string): T | null {
  const raw = useSyncExternalStore(subscribe, () => readRaw(key), () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Everything a signed-in member needs on one screen: today's scores and
 * check-in, what is due, the regimen review, warnings, injection sites,
 * two-week trends, and the account. Educational only: it reports what was
 * logged and what the evidence says, and never suggests a compound or amount.
 */
export function MemberDashboard() {
  const hydrated = useHydrated();
  const session = useSession();
  const profile = useStored<UserContext>(keys.profile);
  const checkinMap = useStored<Record<string, DayState>>(keys.checkins);
  const date = hydrated ? todayIso() : "";

  const checkins = useMemo(
    () => Object.values(checkinMap ?? {}).sort((a, b) => a.date.localeCompare(b.date)),
    [checkinMap],
  );
  const today = checkins.find((day) => day.date === date);

  const report = useMemo(
    () => (profile && today ? buildReport(profile, checkins.filter((day) => day.date <= date), []) : null),
    [profile, today, checkins, date],
  );
  const peptides = useMemo(() => (profile && date ? peptideReport(profile, checkins, date) : null), [profile, checkins, date]);
  const due = useMemo(() => (date ? dueDoses(checkins, date) : []), [checkins, date]);
  const runs = useMemo(() => (date ? protocolRuns(checkins, date) : []), [checkins, date]);
  const projection = useMemo(() => {
    if (!profile || !date) return null;
    const weighIns = checkins.flatMap((day) => (day.weightKg ? [{ date: day.date, weightKg: day.weightKg }] : []));
    return projectWeight(weighIns, profile.targetWeightKg, date);
  }, [profile, checkins, date]);

  const trends = useMemo(() => {
    if (!profile || !date) return null;
    const window = Array.from({ length: 14 }, (_, i) => shiftDays(date, i - 13));
    const byDate = new Map(checkins.map((day) => [day.date, day]));
    const recovery: TrendPoint[] = window.map((day) => {
      if (!byDate.has(day)) return { date: day, value: null };
      const score = buildReport(profile, checkins.filter((entry) => entry.date <= day), [])?.scores[0];
      return { date: day, value: score?.numeric ?? null };
    });
    const sleep: TrendPoint[] = window.map((day) => ({ date: day, value: byDate.get(day)?.sleepHours ?? null }));
    const hasAny = [...recovery, ...sleep].some((point) => point.value != null);
    return hasAny ? { recovery, sleep } : null;
  }, [profile, checkins, date]);

  const dates = useMemo(() => new Set(checkins.map((day) => day.date)), [checkins]);
  const run = date ? streak(dates, date) : 0;
  const weekDoses = checkins
    .filter((day) => date && day.date > shiftDays(date, -7))
    .reduce((total, day) => total + (day.doses?.length ?? 0), 0);

  if (!hydrated || !session.ready) return <p className="text-mute">Loading your dashboard…</p>;

  if (!session.configured || !session.email) {
    return (
      <section className={`${card} max-w-xl`}>
        <h1 className="font-display text-4xl font-light tracking-[-0.03em]">Your dashboard</h1>
        <p className="mt-3 text-mute">
          Sign in to see your check-ins, regimen, injection sites, and trends in
          one place, on any device.
        </p>
        <Link href="/account" className="btn-primary mt-6">
          Sign in
        </Link>
      </section>
    );
  }

  const scores = report?.scores ?? [];
  const recovery = scores.find((score) => score.label.startsWith("Recovery"));
  const sleep = scores.find((score) => score.label.startsWith("Sleep"));
  const readiness = scores.find((score) => score.label === "Training readiness");
  const warnings = peptides?.interactions.filter((item) => item.level === "warning") ?? [];
  const repeats = peptides?.sites.repeats ?? [];

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-5 sm:space-y-6">
        <header className="pb-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[2.6rem] font-light leading-[1] tracking-[-0.035em] sm:text-6xl"
          >
            {session.isNew ? "Welcome" : greeting()}
            {session.name ? "," : ""}
            {session.name ? (
              <>
                <br className="sm:hidden" /> <span className="text-mute">{session.name}</span>
              </>
            ) : null}
          </motion.h1>
          <p className="mt-3 text-mute">{longDate(date)}</p>
          {session.name ? null : <NameForm />}
        </header>

        {peptides?.urgent ? (
          <Alert tone="warn" title="Red-flag symptom logged">
            You reported {peptides.urgent.labels.join(", ").toLowerCase()} on {shortDate(peptides.urgent.date)}. Regimen guidance is
            paused. If it is happening now, call emergency services.
          </Alert>
        ) : null}
        {warnings.map((item) => (
          <Alert key={item.title} tone="warn" title={item.title}>
            {item.detail}
          </Alert>
        ))}
        {repeats.map((item) => (
          <Alert key={`${item.site}-${item.compound}`} tone="caution" title="Same site twice in a row">
            {item.compound} went into {siteLabel(item.site).toLowerCase()} again, last used {shortDate(item.lastDate)}. Rotate to let it recover.
          </Alert>
        ))}

        {!profile ? (
          <section className={card}>
            <h2 className={heading}>Set up your profile</h2>
            <p className="mt-2 text-mute">Two minutes: your goals, training week, and anything Aevum should know before it reads your data.</p>
            <Link href="/today" className="btn-primary mt-5">
              Set up
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
            {/* Today */}
            <section className={`${card} lg:col-span-7`} aria-labelledby="today-heading">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="today-heading" className={heading}>
                    {today ? "Checked in" : "Not checked in yet"}
                  </h2>
                </div>
                <Link href="/today" className={today ? "btn-secondary !min-h-0 !px-4 !py-2" : "btn-primary !min-h-0 !px-4 !py-2.5"}>
                  {today ? "Edit" : "Check in"}
                </Link>
              </div>

              {today && report ? (
                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
                  <Mini score={recovery} />
                  <Mini score={sleep} />
                  <div className="col-span-2 flex items-baseline justify-between border-t border-rule pt-4">
                    <p className="text-sm text-mute">Training readiness</p>
                    <p className="font-display text-2xl font-light" style={readiness ? { color: scoreColour(readiness) } : undefined}>
                      {readiness?.value ?? "—"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-mute">Thirty seconds: sleep, energy, soreness, and what you took. Your scores show up here.</p>
              )}

              <dl className="mt-6 grid grid-cols-3 divide-x divide-rule border-t border-rule pt-5 text-center">
                <Stat label="Day streak" value={run} />
                <Stat label="Days logged" value={checkins.length} />
                <Stat label="Doses, 7 days" value={weekDoses} />
              </dl>
            </section>

            {/* Due today */}
            <section className={`${card} lg:col-span-5`} aria-labelledby="due-heading">
              <h2 id="due-heading" className={heading}>
                Due today
              </h2>
              {due.length === 0 ? (
                <p className="mt-4 text-mute">Nothing on your schedule today.</p>
              ) : (
                <ul className="mt-4 divide-y divide-rule">
                  {due.map((dose) => (
                    <li key={dose.slug} className="flex items-baseline justify-between gap-3 py-3">
                      <div>
                        <p>{dose.name}</p>
                        <p className="text-xs text-mute">{dose.schedule}</p>
                      </div>
                      <p className="text-right text-xs text-mute">
                        Last logged
                        <br />
                        {dose.amount} {dose.unit} · {shortDate(dose.lastDate)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {peptides?.sites.suggestion ? (
                <p className="mt-4 rounded-2xl border border-rule px-4 py-3 text-sm">
                  <span className="text-mute">Next site · </span>
                  {siteLabel(peptides.sites.suggestion)}
                </p>
              ) : null}
            </section>

            {/* Regimen */}
            <section className={`${card} lg:col-span-7`} aria-labelledby="regimen-heading">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 id="regimen-heading" className={heading}>
                    Your protocol
                  </h2>
                </div>
                <Link href="/today" className="shrink-0 text-sm text-mute no-underline hover:text-ink">
                  Full review →
                </Link>
              </div>
              {peptides?.withheld ? (
                <p className="mt-4 text-mute">{peptides.withheld}</p>
              ) : runs.length === 0 ? (
                <p className="mt-4 text-mute">No peptides logged in the last week. Log one in your check-in and its run shows here.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {runs.map((run) => (
                    <RunCard key={run.slug} run={run} guidance={peptides?.guidance.find((item) => item.slug === run.slug)} />
                  ))}
                </ul>
              )}
              {peptides?.review ? (
                <p className="mt-4 text-sm text-mute">
                  {peptides.review.active} active · {peptides.review.complexity.toLowerCase()} complexity · {peptides.review.recommendation}
                </p>
              ) : null}
            </section>

            {/* Goal */}
            <section className={`${card} lg:col-span-5`} aria-labelledby="goal-heading">
              <h2 id="goal-heading" className={heading}>
                Target weight
              </h2>
              {projection ? <GoalProjection projection={projection} imperial={profile.units === "imperial"} runs={runs} /> : null}
            </section>

            {/* Sites */}
            <section className={`${card} lg:col-span-5`} aria-labelledby="sites-heading">
              <h2 id="sites-heading" className={heading}>
                Injection sites
              </h2>
              <div className="mt-4">
                <BodyMap usage={peptides?.sites.usage} suggestion={peptides?.sites.suggestion} today={date} label="Recent sites" />
              </div>
            </section>

            {/* Trends */}
            <section className={`${card} lg:col-span-7`} aria-labelledby="trends-heading">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <h2 id="trends-heading" className={heading}>
                    Trends
                  </h2>
                </div>
                <Link href="/today" className="shrink-0 text-sm text-mute no-underline hover:text-ink">
                  History →
                </Link>
              </div>
              {trends ? (
                <div className="mt-4 grid grid-cols-1 gap-6">
                  <TrendChart title="Recovery" unit="/100" points={trends.recovery} kind="line" color="var(--color-recovery)" yMin={0} yMax={100} format={(v) => String(Math.round(v))} />
                  <TrendChart title="Sleep" unit=" h" points={trends.sleep} kind="bar" color="var(--color-sleep)" yMin={0} yMax={10} />
                </div>
              ) : (
                <p className="mt-4 text-mute">Check in a few days running and your recovery and sleep trends appear here.</p>
              )}
            </section>
          </div>
        )}

        <QuickActions />
        <AccountCard email={session.email} />

        <p className="text-xs text-dim">
          Educational, not medical advice. Aevum reports what you logged and what the evidence says; it never suggests adding a
          compound or changing an amount.
        </p>
      </div>
    </MotionConfig>
  );
}

const LB_PER_KG = 2.20462;

function RunCard({ run, guidance }: { run: ProtocolRun; guidance?: Guidance }) {
  const share = run.cycleDays ? Math.min(1, run.day / run.cycleDays) : null;
  const over = run.cycleDays != null && run.day > run.cycleDays;
  return (
    <li className="rounded-2xl border border-rule p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/peptides/${run.slug}`} className="text-lg text-ink no-underline hover:underline">
          {run.name}
        </Link>
        {guidance ? (
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${statusStyle[guidance.status].tone}`}>
            {statusStyle[guidance.status].label}
          </span>
        ) : null}
      </div>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-readout)" }}>
          {run.amount}
        </span>
        <span className="text-sm text-mute">
          {run.unit} · {run.schedule.toLowerCase()} · as you logged it
        </span>
      </p>

      {share != null ? (
        <div className="mt-4">
          <div
            className="h-2 overflow-hidden rounded-full bg-rule"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={run.cycleDays}
            aria-valuenow={Math.min(run.day, run.cycleDays!)}
            aria-label={`${run.name} run progress`}
          >
            <motion.div
              className={`h-full rounded-full ${over ? "bg-warn" : "bg-ink"}`}
              initial={{ width: 0 }}
              animate={{ width: `${share * 100}%` }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-x-3 text-xs">
            <span className="text-mute">
              Day {run.day} of {run.cycleDays} · started {shortDate(run.started)}
            </span>
            <span className={over ? "text-warn" : ""}>
              {over ? "Past the research cycle: a break is due" : run.daysLeft === 0 ? "Last day of the cycle" : `${run.daysLeft} days left · ends ${shortDate(run.ends!)}`}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-mute">
          Day {run.day} · started {shortDate(run.started)} · no fixed cycle. How long to stay on it is set with your prescriber.
        </p>
      )}

      {guidance ? <p className="mt-3 border-t border-rule pt-3 text-sm text-mute">{guidance.headline}</p> : null}
    </li>
  );
}

function GoalProjection({ projection, imperial, runs }: { projection: WeightProjection; imperial: boolean; runs: ProtocolRun[] }) {
  const weight = (kg: number) => (imperial ? `${Math.round(kg * LB_PER_KG)} lb` : `${kg} kg`);
  const rate = (kg: number) => `${kg > 0 ? "+" : ""}${imperial ? Math.round(kg * LB_PER_KG * 10) / 10 : kg} ${imperial ? "lb" : "kg"} a week`;

  if (projection.status === "no-target") {
    return (
      <p className="mt-4 text-mute">
        Add a target weight to your profile and Aevum projects when your trend gets there.{" "}
        <Link href="/today" className="text-ink">
          Edit profile
        </Link>
      </p>
    );
  }
  if (projection.status === "not-enough") {
    const morePoints = Math.max(0, projection.needed - projection.points);
    const moreDays = Math.max(0, projection.neededSpanDays - projection.spanDays);
    return (
      <p className="mt-4 text-mute">
        Log your weight in your check-ins and your projection appears here.{" "}
        {morePoints > 0
          ? `${morePoints} more weigh-in${morePoints === 1 ? "" : "s"} across at least a week to go.`
          : `Your weigh-ins cover ${projection.spanDays} day${projection.spanDays === 1 ? "" : "s"} so far; ${moreDays} more and it can read a trend.`}
      </p>
    );
  }
  if (projection.status === "reached") {
    return (
      <p className="mt-4">
        You&apos;re at your target: {weight(projection.currentKg)}. <span className="text-mute">Holding here is the goal now.</span>
      </p>
    );
  }

  const endsFirst =
    projection.status === "on-track" ? runs.filter((run) => run.ends && run.ends < projection.eta) : [];

  return (
    <div className="mt-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-mute">Now (trend)</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-readout)" }}>
            {weight(projection.currentKg)}
          </p>
        </div>
        <span aria-hidden className="pb-2 text-dim">
          →
        </span>
        <div className="text-right">
          <p className="text-xs text-mute">Target</p>
          <p className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-readout)" }}>
            {weight(projection.targetKg)}
          </p>
        </div>
      </div>

      {projection.status === "on-track" ? (
        <p className="mt-4">
          At {rate(projection.kgPerWeek)}, you reach it around{" "}
          <strong className="font-semibold">{longDate(projection.eta)}</strong>
          <span className="text-mute">
            {" "}
            · about {projection.weeks} week{projection.weeks === 1 ? "" : "s"}
          </span>
        </p>
      ) : projection.status === "flat" ? (
        <p className="mt-4 text-mute">Your weight is holding steady, so the target isn&apos;t in sight at this rate. Sleep, protein, and training on Today move this most.</p>
      ) : (
        <p className="mt-4 text-warn">Your trend is moving away from the target ({rate(projection.kgPerWeek)}).</p>
      )}

      {endsFirst.length > 0 ? (
        <p className="mt-3 rounded-2xl border border-rule px-4 py-3 text-sm text-mute">
          Your {endsFirst.map((run) => run.name).join(" and ")} run ends {shortDate(endsFirst[0].ends!)}, before then. Whether to
          continue, pause, or change is a decision for your clinician; Aevum never extends a run.
        </p>
      ) : null}

      <p className="mt-3 text-xs text-dim">Projected from your last four weeks of weigh-ins. A trend, not a promise, and not a reason to change a dose.</p>
    </div>
  );
}

function Mini({ score }: { score?: Score }) {
  if (!score || score.numeric == null) return <p className="text-mute">{score?.label ?? "—"}: no data</p>;
  return (
    <div>
      <p className="text-sm text-mute">{score.label.split(" ")[0]}</p>
      <div className="mt-2">
        <Figure score={score} size="compact" />
      </div>
      <TickMeter value={score.numeric} colour={scoreColour(score)} label={score.label} ticks={20} className="mt-3 h-5" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-2">
      <dd className="text-3xl tabular-nums" style={{ fontFamily: "var(--font-readout)" }}>
        {value}
      </dd>
      <dt className="mt-1 text-xs text-mute">{label}</dt>
    </div>
  );
}

function Alert({ tone, title, children }: { tone: "warn" | "caution"; title: string; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`rounded-3xl border px-5 py-4 text-sm ${
        tone === "warn" ? "border-warn/40 bg-warn-tint text-warn" : "border-[color:var(--color-strain)]/50 text-ink"
      }`}
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{children}</p>
    </div>
  );
}

const actions = [
  { href: "/today", label: "Check in", detail: "30 seconds" },
  { href: "/book", label: "Book a call", detail: "Doctor or peptide expert" },
  { href: "/ai", label: "Ask Aevum AI", detail: "Evidence answers" },
  { href: "/calculator", label: "Vial calculator", detail: "Mixing, storage, math" },
  { href: "/peptides", label: "Compounds", detail: "The full register" },
  { href: "/stacks", label: "Stacks", detail: "Studied pairings" },
];

function QuickActions() {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group rounded-2xl border border-rule bg-sheet p-4 no-underline transition-colors hover:border-mute active:bg-panel"
        >
          <p className="text-ink">
            {action.label} <span className="inline-block text-dim transition-transform group-hover:translate-x-0.5">→</span>
          </p>
          <p className="mt-1 text-xs text-mute">{action.detail}</p>
        </Link>
      ))}
    </nav>
  );
}

/** Asks once for a first name, saved on the shared login. */
function NameForm() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const value = name.trim();
    const supabase = syncClient();
    if (!value || !supabase) return;
    setBusy(true);
    setError(null);
    // Updating the user fires USER_UPDATED, which refreshes the greeting.
    const { error: failure } = await supabase.auth.updateUser({ data: { full_name: value } });
    setBusy(false);
    if (failure) setError(friendly(failure.message));
  }

  return (
    <form onSubmit={save} className="mt-5 flex max-w-md gap-2">
      <label htmlFor="dash-name" className="sr-only">
        First name
      </label>
      <input
        id="dash-name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="given-name"
        placeholder="What should we call you?"
        maxLength={60}
        className="min-h-11 flex-1 rounded-xl border border-rule bg-paper px-3 text-sm outline-none focus:border-pine"
      />
      <button type="submit" disabled={busy || !name.trim()} className="btn-secondary !min-h-11 !px-4 !py-0 disabled:opacity-50">
        {busy ? "Saving…" : "Save"}
      </button>
      {error ? <p className="text-xs text-warn">{error}</p> : null}
    </form>
  );
}

function AccountCard({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    const result = await syncNow();
    setBusy(false);
    setStatus(result.ok ? "Synced. This device and your account match." : (result.message ?? "Sync failed."));
  }

  return (
    <section className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`} aria-label="Account">
      <div className="min-w-0">
        <p className="text-sm text-mute">Signed in as</p>
        <p className="mt-0.5 truncate">{email}</p>
        <p className="mt-1 text-xs text-mute">{status ?? "Your profile and check-ins sync to your account automatically."}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button type="button" onClick={sync} disabled={busy} className="btn-secondary !min-h-0 !px-4 !py-2 disabled:opacity-50">
          {busy ? "Syncing…" : "Sync now"}
        </button>
        <Link href="/account" className="btn-secondary !min-h-0 !px-4 !py-2">
          Account
        </Link>
        <button type="button" onClick={() => void syncClient()?.auth.signOut()} className="btn-secondary !min-h-0 !px-4 !py-2">
          Sign out
        </button>
      </div>
    </section>
  );
}
