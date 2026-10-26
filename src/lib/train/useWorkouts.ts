"use client";

import { useMemo, useSyncExternalStore } from "react";
import { WORKOUTS_KEY } from "@/lib/train/storage";
import type { WorkoutDay } from "@/lib/train/types";
import { readRaw, subscribe } from "@/lib/today/storage";

/** Every logged training day on this device, oldest first. */
export function useWorkouts(): WorkoutDay[] {
  const raw = useSyncExternalStore(subscribe, () => readRaw(WORKOUTS_KEY), () => null);
  return useMemo(() => {
    if (!raw) return [];
    try {
      return Object.values(JSON.parse(raw) as Record<string, WorkoutDay>).sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }, [raw]);
}
