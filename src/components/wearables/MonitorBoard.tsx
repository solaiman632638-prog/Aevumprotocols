"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { TrendChart } from "@/components/today/TrendChart";
import {
  clearWearable,
  saveWearable,
  WEARABLE_KEY,
  type WearableProvider,
  type WearableState,
} from "@/lib/plan/storage";
import { readRaw, subscribe } from "@/lib/today/storage";
import { recoveryAdvice } from "@/lib/wearables/demo";
import { useDeviceDays } from "@/lib/wearables/useDeviceDays";

const notices: Record<string, string> = {
  whoop: "Whoop connected.",
  "google-fit": "Google Fit connected.",
  error: "The connection did not go through. Try again, or use the manual check-in on Today.",
  demo: "Live connections are not set up on this site yet, so you are seeing demo data.",
};

function announceChange() {
  window.dispatchEvent(new Event("aevum-storage"));
}

export function MonitorBoard() {
  const params = useSearchParams();
  const returned = params.get("connected");
  const raw = useSyncExternalStore(subscribe, () => readRaw(WEARABLE_KEY), () => null);
  const connection = useMemo<WearableState | null>(() => {
    try {
      return raw ? (JSON.parse(raw) as WearableState) : null;
    } catch {
      return null;
    }
  }, [raw]);
  const feed = useDeviceDays(connection);
  const [busy, setBusy] = useState<WearableProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Coming back from a provider's sign-in: remember the connection on this device.
  useEffect(() => {
    if (returned === "whoop" || returned === "google-fit") {
      saveWearable({ provider: returned, connectedAt: new Date().toISOString() });
      announceChange();
    }
  }, [returned]);

  async function connect(provider: WearableProvider) {
    setBusy(provider);
    setMessage(null);
    try {
      const response = await fetch(`/api/wearables/${provider}/start`);
      const data = (await response.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      saveWearable({ provider, connectedAt: new Date().toISOString() });
      announceChange();
      setMessage(notices.demo);
    } catch {
      setMessage("Could not start the connection.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    await fetch("/api/wearables/disconnect", { method: "POST" }).catch(() => undefined);
    clearWearable();
    announceChange();
    setMessage("Disconnected. Nothing from the device is kept on this site.");
  }

  const latest = feed?.days.filter((day) => day.recovery != null).at(-1);
  const advice = latest?.recovery != null ? recoveryAdvice(latest.recovery) : null;
  const week = feed?.days.slice(-7) ?? [];
  const notice = message ?? (returned ? notices[returned] : null);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderCard
          name="Whoop"
          body="Recovery, HRV, resting heart rate, sleep, and strain."
          busy={busy === "whoop"}
          connected={connection?.provider === "whoop"}
          onConnect={() => connect("whoop")}
        />
        <ProviderCard
          name="Google Fit"
          body="Demo data only while Google retires the Google Fit API."
          busy={busy === "google-fit"}
          connected={connection?.provider === "google-fit"}
          onConnect={() => connect("google-fit")}
        />
      </div>

      {notice ? <p className="text-sm text-mute" role="status">{notice}</p> : null}

      {feed ? (
        <>
          {advice && latest ? (
            <section className={`rounded-3xl border px-5 py-4 ${advice.tone === "hold" ? "border-warn/40 bg-warn-tint" : "border-rule bg-sheet"}`}>
              <p className="eyebrow">{feed.live ? feed.label : `${feed.label}`}</p>
              <p className="mt-2 font-medium">{advice.text}</p>
            </section>
          ) : null}

          {latest ? (
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Kpi label="Recovery" value={latest.recovery != null ? `${latest.recovery}%` : "—"} />
              <Kpi label="HRV" value={latest.hrv != null ? `${latest.hrv} ms` : "—"} />
              <Kpi label="Resting HR" value={latest.rhr != null ? `${latest.rhr} bpm` : "—"} />
              <Kpi label="Sleep" value={latest.sleepHours != null ? `${latest.sleepHours.toFixed(1)} h` : "—"} />
            </dl>
          ) : null}

          <TrendChart
            title="Recovery, last 7 days"
            unit="%"
            points={week.map((day) => ({ date: day.date, value: day.recovery ?? null }))}
            kind="line"
            color="var(--color-recovery)"
            yMin={0}
            yMax={100}
            format={(value) => String(Math.round(value))}
          />

          <button type="button" onClick={disconnect} className="btn-secondary">
            Disconnect
          </button>
        </>
      ) : (
        <p className="text-mute">
          Nothing connected. That is fine: the manual check-in on Today gives you the same daily scores.
        </p>
      )}
    </div>
  );
}

function ProviderCard({
  name,
  body,
  busy,
  connected,
  onConnect,
}: {
  name: string;
  body: string;
  busy: boolean;
  connected: boolean;
  onConnect: () => void;
}) {
  return (
    <div className="rounded-3xl border border-rule bg-sheet px-5 py-5">
      <h2 className="font-display text-xl font-medium tracking-[-0.02em]">{name}</h2>
      <p className="mt-2 text-sm text-mute">{body}</p>
      <button type="button" onClick={onConnect} disabled={busy || connected} className="btn-primary mt-4 disabled:opacity-50">
        {connected ? "Connected" : busy ? "Connecting…" : `Connect ${name}`}
      </button>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-rule bg-sheet px-5 py-4">
      <dt className="text-xs text-mute">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-light">{value}</dd>
    </div>
  );
}
