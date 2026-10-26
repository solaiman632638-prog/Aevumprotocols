"use client";

import { useMemo, useSyncExternalStore } from "react";
import { keys, readRaw, subscribe } from "@/lib/today/storage";
import type { UserContext } from "@/lib/today/types";

/** The Today profile saved on this device, or null (always null while rendering on the server). */
export function useProfile(): UserContext | null {
  const raw = useSyncExternalStore(subscribe, () => readRaw(keys.profile), () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserContext;
    } catch {
      return null;
    }
  }, [raw]);
}
