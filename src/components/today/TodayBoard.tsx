"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckinForm } from "@/components/today/CheckinForm";
import { AccountPrompt } from "@/components/today/AccountPrompt";
import { DailyReminder } from "@/components/today/DailyReminder";
import { Dashboard } from "@/components/today/Dashboard";
import { HistoryPanel } from "@/components/today/HistoryPanel";
import { ProfileForm } from "@/components/today/ProfileForm";
import { WEARABLE_KEY, type WearableState } from "@/lib/plan/storage";
import { buildReport, type CompoundSource } from "@/lib/today/engine";
import {
  keys,
  readRaw,
  saveCheckin,
  saveProfile,
  saveSource,
  subscribe,
  todayIso,
  type DataSource,
} from "@/lib/today/storage";
import type { DayState, UserContext } from "@/lib/today/types";
import { useDeviceDays } from "@/lib/wearables/useDeviceDays";

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
  const storedSource = useStored<DataSource>(keys.source);
  const wearable = useStored<WearableState>(WEARABLE_KEY);
  const [editing, setEditing] = useState<"profile" | "checkin" | null>(null);
  const [view, setView] = useState<"today" | "history">("today");

  const date = hydrated ? todayIso() : "";
  const source: DataSource = storedSource ?? (wearable ? "wearable" : "manual");

  const checkins = useMemo(
    () => Object.values(checkinMap ?? {}).sort((a, b) => a.date.localeCompare(b.date)),
    [checkinMap],
  );

  const feed = useDeviceDays(wearable);

  // Devices do not weigh you: weights logged in manual check-ins fill the gap.
  const wearableDays = useMemo<DayState[] | null>(() => {
    if (!feed) return null;
    return feed.days.map((day) => ({
      date: day.date,
      source: "wearable",
      recovery: day.recovery,
      hrv: day.hrv,
      rhr: day.rhr,
      respRate: day.respRate,
      sleepHours: day.sleepHours != null ? Math.round(day.sleepHours * 10) / 10 : undefined,
      strain: day.strain,
      weightKg: checkinMap?.[day.date]?.weightKg,
    }));
  }, [feed, checkinMap]);

  const history = source === "wearable" ? wearableDays : checkins;
  const checkedInToday = checkins.at(-1)?.date === date;

  const report = useMemo(() => {
    if (!profile || !history || history.length === 0) return null;
    if (source === "manual" && !checkedInToday) return null;
    return buildReport(profile, history, pool);
  }, [profile, history, pool, source, checkedInToday]);

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

  const sourceLabel =
    source === "wearable"
      ? feed
        ? feed.label
        : "No device connected"
      : `Manual check-in · ${checkins.length} day${checkins.length === 1 ? "" : "s"} logged`;

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
        <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Data source">
          <SourceButton active={source === "manual"} onClick={() => saveSource("manual")}>
            Manual check-in
          </SourceButton>
          <SourceButton active={source === "wearable"} onClick={() => saveSource("wearable")}>
            Device
          </SourceButton>
          <span className="px-2 text-sm text-mute">{sourceLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {source === "manual" && checkedInToday && editing !== "checkin" ? (
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
        history && history.length > 0 || source === "manual" ? (
          <HistoryPanel
            profile={profile}
            history={history ?? []}
            today={date}
            manual={source === "manual"}
            onSaveDay={saveCheckin}
          />
        ) : (
          <p className="text-mute">Connect a device or switch to manual check-in to build a history.</p>
        )
      ) : source === "wearable" && !wearable ? (
        <div className="rounded-3xl border border-rule bg-sheet p-6 sm:p-8">
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">No device connected</h2>
          <p className="mt-2 max-w-prose text-mute">
            Connect a heart rate monitor on the Devices page, or skip it
            and answer a few questions each morning instead. Both feed the same
            scores.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/monitor" className="btn-primary">Connect a device</Link>
            <button type="button" onClick={() => saveSource("manual")} className="btn-secondary">
              Use manual check-in
            </button>
          </div>
        </div>
      ) : source === "manual" && (!checkedInToday || editing === "checkin") ? (
        <CheckinForm
          key={`${date}-${editing}`}
          date={date}
          profile={profile}
          previous={checkins.at(-1)}
          onSave={(day) => {
            saveCheckin(day);
            setEditing(null);
          }}
          onCancel={checkedInToday ? () => setEditing(null) : undefined}
        />
      ) : report ? (
        <>
          <AccountPrompt />
          <Dashboard report={report} />
          <DailyReminder />
        </>
      ) : null}
    </div>
  );
}

function SourceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm ${active ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
    >
      {children}
    </button>
  );
}
