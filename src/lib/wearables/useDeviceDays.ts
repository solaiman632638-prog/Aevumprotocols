"use client";

import { useEffect, useState } from "react";
import type { WearableState } from "@/lib/plan/storage";
import { snapshotFor, type LiveDay } from "@/lib/wearables/demo";

export type DeviceFeed = { days: LiveDay[]; label: string; live: boolean };

function demoFeed(provider: WearableState["provider"]): DeviceFeed {
  const snapshot = snapshotFor(provider);
  return { days: snapshot.days, label: snapshot.label, live: false };
}

/**
 * Days from the connected device. WHOOP is fetched live when its keys and a
 * token exist; everything else, or any failure, uses the demo week.
 */
export function useDeviceDays(connection: WearableState | null): DeviceFeed | null {
  const provider = connection?.provider ?? null;
  const [live, setLive] = useState<{ provider: string; feed: DeviceFeed } | null>(null);

  useEffect(() => {
    if (provider !== "whoop") return;
    let cancelled = false;
    fetch("/api/wearables/whoop/data", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { days?: LiveDay[] } | null) => {
        if (!cancelled && data?.days && data.days.length > 0) {
          setLive({ provider, feed: { days: data.days, label: "Whoop", live: true } });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [provider]);

  if (!provider) return null;
  if (live && live.provider === provider) return live.feed;
  return demoFeed(provider);
}
