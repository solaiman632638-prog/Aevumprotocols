"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { syncClient, syncConfigured } from "@/lib/sync/client";

export type SessionState = {
  /** Accounts are switched on for this deployment. */
  configured: boolean;
  /** Session lookup finished (always true when accounts are off). */
  ready: boolean;
  email: string | null;
  /** Name on the shared login (`full_name`, set by Aevum or the NovaEvum store). */
  name: string | null;
  /** The account was created in the last hour: greet it as new, not "back". */
  isNew: boolean;
  /** The user arrived from a password-reset email and should set a new password. */
  recovering: boolean;
};

const NEW_ACCOUNT_MS = 60 * 60 * 1000;

function who(session: Session | null): Pick<SessionState, "email" | "name" | "isNew"> {
  const name = session?.user.user_metadata?.full_name;
  const created = Date.parse(session?.user.created_at ?? "");
  return {
    email: session?.user.email ?? null,
    name: typeof name === "string" && name.trim() ? name.trim() : null,
    isNew: Number.isFinite(created) && Date.now() - created < NEW_ACCOUNT_MS,
  };
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    configured: syncConfigured,
    ready: !syncConfigured,
    email: null,
    name: null,
    isNew: false,
    recovering: false,
  });

  useEffect(() => {
    const supabase = syncClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setState((current) => ({ ...current, ready: true, ...who(data.session) }));
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState((current) => ({
        ...current,
        ready: true,
        ...who(session),
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
            : { ...previous, ready: true, ...who(current.session) },
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
