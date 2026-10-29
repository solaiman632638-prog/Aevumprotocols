"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, MotionConfig } from "motion/react";
import { CheckinForm } from "@/components/today/CheckinForm";
import { AccountPrompt } from "@/components/today/AccountPrompt";
import { DailyReminder } from "@/components/today/DailyReminder";
import { PeptidePanel } from "@/components/peptides/PeptidePanel";
import { Dashboard } from "@/components/today/Dashboard";
import { HeartConnect } from "@/components/today/HeartConnect";
import { InstallApp } from "@/components/layout/InstallApp";
import { HistoryPanel } from "@/components/today/HistoryPanel";
import { ProfileForm } from "@/components/today/ProfileForm";
import { activeCompounds, dueDoses, peptideReport } from "@/lib/peptides/engine";
import { buildReport, type CompoundSource } from "@/lib/today/engine";
import {
  keys,
  readRaw,
  saveCheckin,
  saveProfile,
  subscribe,
  todayIso,
} from "@/lib/today/storage";
import type { DayState, UserContext } from "@/lib/today/types";
import { latestReading, localDate, type HeartReading } from "@/lib/health/heart";
import { isNativeApp, nativeHealthLinked, syncNativeHealth } from "@/lib/health/native";
import { useSession } from "@/lib/sync/useSession";
import { greeting, streak } from "@/lib/today/streak";

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

/** False during SSR and hydration, true after — stored data is client-only. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function TodayBoard({ pool }: { pool: CompoundSource[] }) {
  const hydrated = useHydrated();
  const profile = useStored<UserContext>(keys.profile);
  const checkinMap = useStored<Record<string, DayState>>(keys.checkins);
  const [editing, setEditing] = useState<"profile" | "checkin" | null>(null);
  const [view, setView] = useState<"today" | "history">("today");
  const session = useSession();
  const [reading, setReading] = useState<HeartReading | null>(null);
  const [refresh, setRefresh] = useState(0);

  // The Shortcut posts from the phone; look again whenever the page is shown.
  // Inside the app, read Apple Health first so the newest numbers are there.
  useEffect(() => {
    if (!session.email) return;
    let cancelled = false;
    const load = () => {
      if (document.visibilityState !== "visible") return;
      const native = isNativeApp() && nativeHealthLinked() ? syncNativeHealth().catch(() => null) : Promise.resolve(null);
      void native.then(latestReading).then((next) => {
        if (!cancelled) setReading(next);
      });
    };
    load();
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", load);
    };
  }, [session.email, refresh]);

  const date = hydrated ? todayIso() : "";

  const checkins = useMemo(
    () => Object.values(checkinMap ?? {}).sort((a, b) => a.date.localeCompare(b.date)),
    [checkinMap],
  );

  const checkedInToday = checkins.at(-1)?.date === date;
  const todaysReading = reading && date && localDate(reading.measuredAt) === date ? reading : undefined;

  // A reading that lands after today's check-in fills the gaps, never what was typed.
  useEffect(() => {
    const today = checkins.at(-1);
    if (!todaysReading || today?.date !== date) return;
    const fill = {
      rhr: today.rhr ?? todaysReading.rhr,
      hrv: today.hrv ?? todaysReading.hrv,
      respRate: today.respRate ?? todaysReading.respRate,
    };
    if (fill.rhr !== today.rhr || fill.hrv !== today.hrv || fill.respRate !== today.respRate) {
      saveCheckin({ ...today, ...fill });
    }
  }, [todaysReading, checkins, date]);

  const due = useMemo(() => (date ? dueDoses(checkins, date) : []), [checkins, date]);

  const peptides = useMemo(
    () => (profile && date ? peptideReport(profile, checkins, date) : null),
    [profile, checkins, date],
  );

  const report = useMemo(() => {
    if (!profile || checkins.length === 0 || !checkedInToday) return null;
    return buildReport(profile, checkins, pool);
  }, [profile, checkins, pool, checkedInToday]);

  if (!hydrated) {
    return <p className="text-mute">Loading your day…</p>;
  }

  if (!profile || editing === "profile") {
    return (
      <div className="space-y-10">
        {profile ? null : <Welcome />}
        {profile ? null : <InstallApp />}
        <ProfileForm
          initial={profile}
          onSave={(next) => {
            saveProfile(next);
            setEditing(null);
          }}
          onCancel={profile ? () => setEditing(null) : undefined}
        />
      </div>
    );
  }

  const run = streak(new Set(checkins.map((day) => day.date)), date);
  const loggedLabel = `${checkins.length} day${checkins.length === 1 ? "" : "s"} logged`;
  const longDate = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8 sm:space-y-10">
        <header className="sm:flex sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-[2.6rem] font-light leading-[1] tracking-[-0.035em] sm:text-6xl">
              {greeting()}
              {session.name ? <span className="text-mute">, {session.name}</span> : null}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-mute">
              <span>{longDate}</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-dim" />
              {run > 1 ? (
                <span className="text-ink">
                  <span className="tabular-nums">{run}</span>-day streak
                </span>
              ) : (
                <span>{loggedLabel}</span>
              )}
            </p>
          </div>
          <div className="mt-4 flex shrink-0 gap-2 sm:mt-0 sm:pt-3">
            {checkedInToday && editing !== "checkin" && view === "today" ? (
              <button type="button" onClick={() => setEditing("checkin")} className={chip}>
                Edit check-in
              </button>
            ) : null}
            <button type="button" onClick={() => setEditing("profile")} className={chip}>
              Profile
            </button>
          </div>
        </header>

        <InstallApp />

        <div>
          <div role="tablist" aria-label="Today or history" className="grid w-full grid-cols-2 rounded-full border border-rule bg-sheet p-1 sm:w-72">
            {(["today", "history"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={view === tab}
                onClick={() => setView(tab)}
                className={`relative min-h-10 rounded-full text-sm font-semibold transition-colors ${view === tab ? "text-on-accent" : "text-mute hover:text-ink"}`}
              >
                {view === tab ? (
                  <motion.span
                    layoutId="today-view"
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
                <span className="relative">{tab === "today" ? "Today" : "History"}</span>
              </button>
            ))}
          </div>
        </div>

        {view === "history" ? (
          <HistoryPanel
            profile={profile}
            history={checkins}
            today={date}
            siteSuggestion={peptides?.sites.suggestion}
            onSaveDay={saveCheckin}
          />
        ) : !checkedInToday || editing === "checkin" ? (
          <CheckinForm
            key={`${date}-${editing}-${todaysReading?.measuredAt ?? ""}`}
            date={date}
            reading={todaysReading}
            profile={profile}
            siteSuggestion={peptides?.sites.suggestion}
            previous={checkins.at(-1)}
            due={due}
            onSave={(day) => {
              saveCheckin(day);
              setEditing(null);
            }}
            onCancel={checkedInToday ? () => setEditing(null) : undefined}
          />
        ) : report ? (
          <>
            <AccountPrompt />
            <Dashboard
              report={report}
              peptides={
                peptides ? (
                  <PeptidePanel
                    report={peptides}
                    today={date}
                    context={profile}
                    activeSlugs={activeCompounds(checkins, date).map((model) => model.slug)}
                  />
                ) : null
              }
            />
            <DailyReminder />
          </>
        ) : null}

        {view === "today" && session.email ? <HeartConnect reading={reading} onSynced={() => setRefresh((n) => n + 1)} /> : null}
      </div>
    </MotionConfig>
  );
}

const chip =
  "inline-flex min-h-10 items-center rounded-full border border-rule px-4 text-sm text-ink transition-colors hover:border-mute active:bg-panel";

/** First visit, before a profile exists: what Today does. */
function Welcome() {
  return (
    <header>
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Today</h1>
      <p className="mt-4 max-w-2xl text-mute">
        Log how you slept, how you feel, and the peptides you took. Get
        recovery and sleep scores, protocol guidance for each peptide,
        interaction warnings, and injection-site tracking. Every
        recommendation shows the data behind it.
      </p>
    </header>
  );
}
