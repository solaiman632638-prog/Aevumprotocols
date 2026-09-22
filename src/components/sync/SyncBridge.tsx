"use client";

import { useEffect } from "react";
import { syncClient } from "@/lib/sync/client";
import { pushCheckin, pushProfile, syncNow } from "@/lib/sync/sync";
import { registerRemote } from "@/lib/today/storage";

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
      void syncNow();
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) connect();
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) connect();
      if (event === "SIGNED_OUT") registerRemote(null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return null;
}
