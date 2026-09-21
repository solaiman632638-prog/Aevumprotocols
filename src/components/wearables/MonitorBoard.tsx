"use client";

import { useEffect, useMemo, useState } from "react";
import {
  latest,
  recoveryAdvice,
  snapshotFor,
  type WearableSnapshot,
} from "@/lib/wearables/demo";
import {
  clearWearable,
  loadWearable,
  saveWearable,
  type WearableProvider,
  type WearableState,
} from "@/lib/plan/storage";

function readConnection(): WearableState | null {
  if (typeof window === "undefined") return null;
  const connected = new URLSearchParams(window.location.search).get("connected");
  if (connected === "whoop" || connected === "google-fit") {
    const state: WearableState = {
      provider: connected,
      connectedAt: new Date().toISOString(),
    };
    saveWearable(state);
    return state;
  }
  return loadWearable();
}

export function MonitorBoard() {
  const [connection, setConnection] = useState<WearableState | null>(readConnection);
  const [oauth, setOauth] = useState<{ whoopReady: boolean; googleReady: boolean }>({
    whoopReady: false,
    googleReady: false,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wearables/status")
      .then((response) => response.json())
      .then((data) =>
        setOauth({
          whoopReady: Boolean(data.whoopReady),
          googleReady: Boolean(data.googleReady),
        }),
      )
      .catch(() => undefined);
  }, []);

  const snapshot: WearableSnapshot | null = useMemo(
    () => (connection ? snapshotFor(connection.provider, oauth) : null),
    [connection, oauth],
  );

  async function connect(provider: WearableProvider) {
    setBusy(provider);
    setMessage(null);
    try {
      const response = await fetch(`/api/wearables/${provider}/start`);
      const data = (await response.json()) as { url?: string; mode?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      saveWearable({ provider, connectedAt: new Date().toISOString() });
      setConnection(loadWearable());
      setMessage(
        data.mode === "demo"
          ? `No ${provider === "whoop" ? "Whoop" : "Google"} API keys in this deploy. Showing a demo feed that behaves like a connected strap.`
          : "Connected.",
      );
    } catch {
      setMessage("Could not start the connection.");
    } finally {
      setBusy(null);
    }
  }

  function disconnect() {
    clearWearable();
    setConnection(null);
    setMessage("Strap disconnected on this device.");
  }

  const today = snapshot ? latest(snapshot) : null;
  const advice = today ? recoveryAdvice(today.recovery) : null;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        <ProviderCard
          name="Whoop"
          body="Recovery, HRV, resting heart rate, and sleep."
          busy={busy === "whoop"}
          connected={connection?.provider === "whoop"}
          onConnect={() => connect("whoop")}
        />
        <ProviderCard
          name="Google Fit"
          body="Heart rate and sleep from Google Fit."
          busy={busy === "google-fit"}
          connected={connection?.provider === "google-fit"}
          onConnect={() => connect("google-fit")}
        />
      </div>

      {message ? <p className="text-sm text-mute">{message}</p> : null}

      {snapshot && today && advice ? (
        <>
          <section
            className={`rounded-3xl border px-4 py-4 ${advice.tone === "hold" ? "border-warn/40 bg-warn-tint" : "border-rule bg-sheet"}`}
          >
            <p className="eyebrow">{snapshot.label}</p>
            <p className="mt-2 font-medium">{advice.text}</p>
          </section>

          <section className="grid gap-3 sm:grid-cols-4">
            <Kpi label="Recovery" value={`${today.recovery}%`} hint="Whoop-style score" />
            <Kpi label="HRV" value={`${today.hrv} ms`} hint="Last night" />
            <Kpi label="Resting HR" value={`${today.rhr} bpm`} hint="Overnight" />
            <Kpi label="Sleep" value={`${today.sleepHours.toFixed(1)} h`} hint="Time in bed" />
          </section>

          <section className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
            <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
              Seven-day recovery
            </h2>
            <RecoveryChart days={snapshot.days} />
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="text-mute">
                  <th className="py-1 font-medium">Day</th>
                  <th className="py-1 font-medium">Recovery</th>
                  <th className="py-1 font-medium">RHR</th>
                  <th className="py-1 font-medium">Sleep</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.days.map((day) => (
                  <tr key={day.date} className="border-t border-rule">
                    <td className="py-1 font-mono text-[0.75rem]">{day.date.slice(5)}</td>
                    <td className="py-1">{day.recovery}%</td>
                    <td className="py-1">{day.rhr}</td>
                    <td className="py-1">{day.sleepHours.toFixed(1)} h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <button
            type="button"
            onClick={disconnect}
            className="btn-secondary"
          >
            Disconnect
          </button>
        </>
      ) : (
        <p className="text-mute">
          Nothing connected. That is fine: the manual check-in on Today gives you
          the same daily scores.
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
    <div className="border border-rule bg-sheet px-4 py-4 rounded-3xl">
      <h2 className="font-display text-xl font-medium tracking-[-0.02em]">{name}</h2>
      <p className="mt-2 text-sm text-mute">{body}</p>
      <button
        type="button"
        onClick={onConnect}
        disabled={busy || connected}
        className="btn-primary mt-4 disabled:opacity-50"
      >
        {connected ? "Connected" : busy ? "Connecting…" : `Connect ${name}`}
      </button>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-rule bg-sheet px-4 py-3 rounded-3xl">
      <p className="text-xs text-mute">{label}</p>
      <p className="mt-1 font-mono text-lg">{value}</p>
      <p className="text-xs text-mute">{hint}</p>
    </div>
  );
}

function RecoveryChart({ days }: { days: WearableSnapshot["days"] }) {
  const width = 640;
  const height = 140;
  const pad = 12;
  const xs = days.map((_, index) => pad + (index * (width - pad * 2)) / (days.length - 1));
  const ys = days.map((day) => height - pad - (day.recovery / 100) * (height - pad * 2));
  const d = xs.map((x, index) => `${index === 0 ? "M" : "L"} ${x} ${ys[index]}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-36 w-full"
      role="img"
      aria-label="Recovery scores for the last seven days"
    >
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#c5cdc6" />
      <line
        x1={pad}
        y1={height - pad - 0.34 * (height - pad * 2)}
        x2={width - pad}
        y2={height - pad - 0.34 * (height - pad * 2)}
        stroke="#8a3d2f"
        strokeDasharray="4 4"
      />
      <path d={d} fill="none" stroke="#215c4c" strokeWidth="2" />
      {xs.map((x, index) => (
        <circle key={days[index].date} cx={x} cy={ys[index]} r="3.5" fill="#163f35" />
      ))}
    </svg>
  );
}
