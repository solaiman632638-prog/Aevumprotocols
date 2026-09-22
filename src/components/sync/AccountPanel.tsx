"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { syncClient, syncConfigured } from "@/lib/sync/client";
import { deleteAccount, syncNow } from "@/lib/sync/sync";
import { clearLocalData, loadCheckinMap, loadProfile } from "@/lib/today/storage";

type Status = { tone: "ok" | "error"; text: string } | null;

const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const card = "rounded-3xl border border-rule bg-sheet p-6 sm:p-8";

function downloadExport() {
  const payload = { exportedAt: new Date().toISOString(), profile: loadProfile(), checkins: loadCheckinMap() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "aevum-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

export function AccountPanel() {
  const [email, setEmail] = useState<string | null>(null);
  // Without Supabase there is no session to wait for.
  const [ready, setReady] = useState(!syncConfigured);
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [confirm, setConfirm] = useState<"account" | "local" | null>(null);

  useEffect(() => {
    const supabase = syncClient();
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user.email ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    const supabase = syncClient();
    if (!supabase) return;
    if (!/^\S+@\S+\.\S+$/.test(input.trim())) {
      setStatus({ tone: "error", text: "Enter a valid email address." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: input.trim(),
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    setBusy(false);
    if (error) setStatus({ tone: "error", text: error.message });
    else {
      setSent(true);
      setStatus(null);
    }
  }

  async function runSync() {
    setBusy(true);
    const result = await syncNow();
    setBusy(false);
    setStatus(result.ok ? { tone: "ok", text: "Synced. This device and your account match." } : { tone: "error", text: result.message ?? "Sync failed." });
  }

  async function signOut() {
    await syncClient()?.auth.signOut();
    setStatus({ tone: "ok", text: "Signed out. Your data on this device is still here." });
  }

  async function removeAccount() {
    setBusy(true);
    const result = await deleteAccount();
    setBusy(false);
    setConfirm(null);
    setStatus(result.ok ? { tone: "ok", text: "Account and synced data deleted." } : { tone: "error", text: result.message ?? "Could not delete." });
  }

  if (!ready) return <p className="text-mute">Loading…</p>;

  return (
    <div className="space-y-6">
      {!syncConfigured ? (
        <section className={card}>
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Accounts are coming soon</h2>
          <p className="mt-3 max-w-prose text-mute">
            For now everything you enter is saved in this browser only. Use the
            export below to keep a copy.
          </p>
        </section>
      ) : email ? (
        <section className={card}>
          <p className="eyebrow">Signed in</p>
          <h2 className="mt-2 font-display text-3xl font-light tracking-[-0.03em]">{email}</h2>
          <p className="mt-3 max-w-prose text-mute">
            Your profile and check-ins sync automatically. Sign in with the same
            email on another device to pick up where you left off.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={runSync} disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? "Working…" : "Sync now"}
            </button>
            <button type="button" onClick={signOut} className="btn-secondary">Sign out</button>
          </div>
        </section>
      ) : (
        <section className={card}>
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Sync across devices</h2>
          <p className="mt-3 max-w-prose text-mute">
            Optional. Sign in with your email and your profile and check-ins
            follow you to any phone or computer. No password: we email you a
            link.
          </p>
          {sent ? (
            <p className="mt-6 rounded-2xl border border-rule px-4 py-3" role="status">
              Check your inbox for a sign-in link from Aevum. Open it on this device.
            </p>
          ) : (
            <form onSubmit={signIn} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end" noValidate>
              <div className="flex-1">
                <label htmlFor="account-email" className="mb-1.5 block text-sm">Email</label>
                <input id="account-email" type="email" autoComplete="email" value={input} onChange={(e) => setInput(e.target.value)} className={field} />
              </div>
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
                {busy ? "Sending…" : "Email me a link"}
              </button>
            </form>
          )}
        </section>
      )}

      {status ? (
        <p role="status" className={`rounded-2xl border px-4 py-3 text-sm ${status.tone === "error" ? "border-warn/30 bg-warn-tint text-warn" : "border-rule text-mute"}`}>
          {status.text}
        </p>
      ) : null}

      <section className={card}>
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Your data</h2>
        <p className="mt-2 max-w-prose text-sm text-mute">
          See what is stored and remove it whenever you like. Details are in the{" "}
          <Link href="/privacy" className="text-pine-deep underline decoration-rule underline-offset-2">privacy policy</Link>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={downloadExport} className="btn-secondary">Download my data</button>
          <button type="button" onClick={() => setConfirm("local")} className="btn-secondary">Clear this device</button>
          {email ? (
            <button type="button" onClick={() => setConfirm("account")} className="btn-secondary !border-warn/40 !text-warn">
              Delete account
            </button>
          ) : null}
        </div>

        {confirm ? (
          <div className="mt-5 rounded-2xl border border-warn/30 bg-warn-tint p-4 text-warn" role="alert">
            <p>
              {confirm === "account"
                ? "This permanently deletes your account and every synced profile and check-in. Data on this device stays until you clear it."
                : "This removes your profile and check-ins from this browser. Anything synced to your account is kept."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm === "account") void removeAccount();
                  else {
                    clearLocalData();
                    setConfirm(null);
                    setStatus({ tone: "ok", text: "This device is cleared." });
                  }
                }}
                className="btn-primary !bg-warn hover:!bg-warn/80 disabled:opacity-50"
              >
                {confirm === "account" ? "Delete everything" : "Clear this device"}
              </button>
              <button type="button" onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
