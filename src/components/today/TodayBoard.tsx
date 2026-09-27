"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckinForm } from "@/components/today/CheckinForm";
import { AccountPrompt } from "@/components/today/AccountPrompt";
import { DailyReminder } from "@/components/today/DailyReminder";
import { PeptidePanel } from "@/components/peptides/PeptidePanel";
import { Dashboard } from "@/components/today/Dashboard";
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

  const date = hydrated ? todayIso() : "";

  const checkins = useMemo(
    () => Object.values(checkinMap ?? {}).sort((a, b) => a.date.localeCompare(b.date)),
    [checkinMap],
  );

  const checkedInToday = checkins.at(-1)?.date === date;

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
      <ProfileForm
        initial={profile}
        onSave={(next) => {
          saveProfile(next);
          setEditing(null);
        }}
        onCancel={profile ? () => setEditing(null) : undefined}
      />
    );
  }

  const loggedLabel = `${checkins.length} day${checkins.length === 1 ? "" : "s"} logged`;

  return (
    <div className="space-y-10">
      <div className="flex gap-2" role="tablist" aria-label="Today or history">
        {(["today", "history"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={view === tab}
            onClick={() => setView(tab)}
            className={`font-display text-2xl font-light tracking-[-0.02em] sm:text-3xl ${view === tab ? "text-ink underline decoration-pine decoration-2 underline-offset-8" : "text-mute hover:text-ink"} px-1`}
          >
            {tab === "today" ? "Today" : "History"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl border border-rule bg-sheet p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mute">{loggedLabel}</p>
        <div className="flex flex-wrap gap-2">
          {checkedInToday && editing !== "checkin" ? (
            <button type="button" onClick={() => setEditing("checkin")} className="btn-secondary !min-h-0 !px-4 !py-2">
              Edit check-in
            </button>
          ) : null}
          <button type="button" onClick={() => setEditing("profile")} className="btn-secondary !min-h-0 !px-4 !py-2">
            Edit profile
          </button>
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
          key={`${date}-${editing}`}
          date={date}
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
    </div>
  );
}
