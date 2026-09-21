export type DaySample = {
  date: string;
  recovery: number;
  hrv: number;
  rhr: number;
  sleepHours: number;
  strain: number;
};

export type WearableSnapshot = {
  source: "whoop" | "google-fit" | "demo";
  label: string;
  days: DaySample[];
};

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic week of recovery-style metrics so the monitor is usable without OAuth. */
export function demoSnapshot(seed = "aevum"): WearableSnapshot {
  const days: DaySample[] = [];
  const now = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const key = `${seed}-${date.toISOString().slice(0, 10)}`;
    const n = hash(key);
    const recovery = clamp(38 + (n % 48), 18, 96);
    days.push({
      date: date.toISOString().slice(0, 10),
      recovery,
      hrv: clamp(32 + (n % 40), 20, 90),
      rhr: clamp(48 + (n % 14), 46, 72),
      sleepHours: clamp(5.4 + ((n % 25) / 10), 4.8, 8.6),
      strain: clamp(6 + (n % 12), 4, 18),
    });
  }
  return {
    source: "demo",
    label: "Demo strap",
    days,
  };
}

/**
 * The feed for a stored connection. Live API sync is not built yet, so every
 * provider gets a deterministic demo week seeded by its name.
 */
export function snapshotFor(
  provider: "whoop" | "google-fit" | "demo",
  live: { whoopReady: boolean; googleReady: boolean } = { whoopReady: false, googleReady: false },
): WearableSnapshot {
  const data = demoSnapshot(provider);
  if (provider === "whoop") {
    return { ...data, source: "whoop", label: live.whoopReady ? "Whoop" : "Whoop · demo feed" };
  }
  if (provider === "google-fit") {
    return { ...data, source: "google-fit", label: live.googleReady ? "Google Fit" : "Google Fit · demo feed" };
  }
  return data;
}

export function latest(snapshot: WearableSnapshot): DaySample {
  return snapshot.days[snapshot.days.length - 1];
}

export function recoveryAdvice(recovery: number): { tone: "hold" | "steady" | "green"; text: string } {
  if (recovery < 34) {
    return {
      tone: "hold",
      text: "Hard recovery day. Skip extra pulses and extra stacks. Do not double tomorrow.",
    };
  }
  if (recovery < 67) {
    return {
      tone: "steady",
      text: "Ordinary recovery. Run the matched worksheet as written. Do not add a fourth vial.",
    };
  }
  return {
    tone: "green",
    text: "Recovery is high. That is not a reason to raise amounts. Keep the plan you already matched.",
  };
}
