"use client";

import { useEffect } from "react";
import { syncClient } from "@/lib/sync/client";
import { pushCheckin, pushProfile, pushWorkout, syncNow } from "@/lib/sync/sync";
import { registerRemote } from "@/lib/today/storage";
import { registerWorkoutRemote } from "@/lib/train/storage";

/** Mirrors local saves to the account while signed in, and merges on sign-in. */
export function SyncBridge() {
  useEffect(() => {
    const supabase = syncClient();
    if (!supabase) return;

    const connect = () => {
      registerRemote({
        pushProfile: (profile, updatedAt) => void pushProfile(profile, updatedAt),
        pushCheckin: (day) => void pushCheckin(day),
      });
      registerWorkoutRemote((day) => void pushWorkout(day));
      void syncNow();
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) connect();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) connect();
      if (event === "SIGNED_OUT") {
        registerRemote(null);
        registerWorkoutRemote(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
