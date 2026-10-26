"use client";

import { syncClient } from "@/lib/sync/client";

/** Saved on the phone after linking, so later syncs need no sign-in round trip. */
const KEY = "aevum-health-key";

type Capacitor = { isNativePlatform?: () => boolean; getPlatform?: () => string };

/** True inside the App Store / Play Store app, false in a browser. */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as { Capacitor?: Capacitor }).Capacitor?.isNativePlatform?.());
}

export function nativeHealthLinked(): boolean {
  try {
    return Boolean(localStorage.getItem(KEY));
  } catch {
    return false;
  }
}

async function healthKey(): Promise<string | null> {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch {
    // Fall through to issuing a new one.
  }
  const { data } = await syncClient()!.auth.getSession();
  const response = await fetch("/api/health/key", {
    method: "POST",
    headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.key) return null;
  try {
    localStorage.setItem(KEY, body.key);
  } catch {
    // Works this session; asks again next launch.
  }
  return body.key;
}

/**
 * Reads the latest resting heart rate, HRV, and breathing rate from Apple
 * Health (or Health Connect) and sends them through the same endpoint the
 * iPhone Shortcut uses. Asks for permission the first time.
 */
export async function syncNativeHealth(): Promise<{ ok: boolean; message: string }> {
  const { Health } = await import("@capgo/capacitor-health");
  const available = await Health.isAvailable();
  if (!available.available) return { ok: false, message: available.reason ?? "Health data isn't available on this phone." };

  const types = ["restingHeartRate", "heartRateVariability", "respiratoryRate"] as const;
  await Health.requestAuthorization({ read: [...types] });

  const startDate = new Date(Date.now() - 2 * 86_400_000).toISOString();
  const latest = async (dataType: (typeof types)[number]) => {
    const { samples } = await Health.readSamples({ dataType, startDate, limit: 1, ascending: false });
    return samples[0]?.value;
  };
  const [rhr, hrv, resp] = await Promise.all(types.map(latest));

  const key = await healthKey();
  if (!key) return { ok: false, message: "Log in to save heart data to your account." };
  const response = await fetch("/api/health/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, rhr, hrv, resp }),
  });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) {
    try {
      localStorage.removeItem(KEY);
    } catch {
      // Nothing saved.
    }
  }
  return { ok: response.ok, message: body.message ?? "Could not sync heart data." };
}
