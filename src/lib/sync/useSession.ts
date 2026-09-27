"use client";

import { useEffect, useState } from "react";
import { syncClient, syncConfigured } from "@/lib/sync/client";

export type SessionState = {
  /** Accounts are switched on for this deployment. */
  configured: boolean;
  /** Session lookup finished (always true when accounts are off). */
  ready: boolean;
  email: string | null;
  /** The user arrived from a password-reset email and should set a new password. */
  recovering: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    configured: syncConfigured,
    ready: !syncConfigured,
    email: null,
    recovering: false,
  });

  useEffect(() => {
    const supabase = syncClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setState((current) => ({ ...current, ready: true, email: data.session?.user.email ?? null }));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState((current) => ({
        ...current,
        ready: true,
        email: session?.user.email ?? null,
        recovering: event === "PASSWORD_RECOVERY" ? true : event === "SIGNED_OUT" ? false : current.recovering,
      }));
    });

    // Confirmation links open in a second tab, which is where the session is
    // established. Re-check when this tab is looked at again so the person
    // who is still staring at "check your email" sees it resolve.
    const recheck = () => {
      if (document.visibilityState !== "visible") return;
      void supabase.auth.getSession().then(({ data: current }) => {
        setState((previous) =>
          previous.email === (current.session?.user.email ?? null)
            ? previous
            : { ...previous, ready: true, email: current.session?.user.email ?? null },
        );
      });
    };

    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      data.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, []);

  return state;
}
