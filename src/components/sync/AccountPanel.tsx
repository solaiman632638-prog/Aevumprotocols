"use client";

import Link from "next/link";
import { useState } from "react";
import { syncClient } from "@/lib/sync/client";
import { deleteAccount, syncNow } from "@/lib/sync/sync";
import { useSession } from "@/lib/sync/useSession";
import { clearLocalData, loadCheckinMap, loadProfile } from "@/lib/today/storage";

type Status = { tone: "ok" | "error"; text: string } | null;
type Mode = "signup" | "login" | "link" | "reset";

const MIN_PASSWORD = 8;
const field = "w-full rounded-xl border border-rule bg-paper px-3 py-2.5 text-sm outline-none focus:border-pine";
const card = "rounded-3xl border border-rule bg-sheet p-6 sm:p-8";
const textLink = "text-pine-deep underline decoration-rule underline-offset-2";

function downloadExport() {
  const payload = { exportedAt: new Date().toISOString(), profile: loadProfile(), checkins: loadCheckinMap() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "aevum-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

/** Supabase's error text, reworded where it would confuse people. */
function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "That email and password don't match. Try again or reset your password.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first: open the link we sent you.";
  if (/already registered|already been registered/i.test(message)) return "There is already an account with that email. Log in instead.";
  if (/rate limit/i.test(message)) return "Too many emails in a short time. Wait a few minutes and try again.";
  return message;
}

export function AccountPanel() {
  const session = useSession();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [confirm, setConfirm] = useState<"account" | "local" | null>(null);

  const redirectTo = () => `${window.location.origin}/account`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = syncClient();
    if (!supabase) return;
    const address = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(address)) return setStatus({ tone: "error", text: "Enter a valid email address." });
    if ((mode === "signup" || mode === "login") && password.length < MIN_PASSWORD) {
      return setStatus({ tone: "error", text: `Passwords are at least ${MIN_PASSWORD} characters.` });
    }

    setBusy(true);
    setStatus(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email: address, password, options: { emailRedirectTo: redirectTo() } });
        if (error) throw error;
        // With email confirmation on, Supabase returns no session until the link is opened.
        setStatus(
          data.session
            ? { tone: "ok", text: "Account created. Your data now syncs." }
            : { tone: "ok", text: `Almost done: we sent a confirmation link to ${address}. Open it to finish creating your account.` },
        );
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: address, password });
        if (error) throw error;
      } else if (mode === "link") {
        const { error } = await supabase.auth.signInWithOtp({ email: address, options: { emailRedirectTo: redirectTo() } });
        if (error) throw error;
        setStatus({ tone: "ok", text: `Check ${address} for a sign-in link. Open it on this device.` });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: redirectTo() });
        if (error) throw error;
        setStatus({ tone: "ok", text: `If there is an account for ${address}, a reset link is on its way.` });
      }
    } catch (error) {
      setStatus({ tone: "error", text: friendly(error instanceof Error ? error.message : "Something went wrong.") });
    } finally {
      setBusy(false);
    }
  }

  async function setRecoveredPassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD) {
      return setStatus({ tone: "error", text: `Passwords are at least ${MIN_PASSWORD} characters.` });
    }
    setBusy(true);
    const { error } = await syncClient()!.auth.updateUser({ password: newPassword });
    setBusy(false);
    setNewPassword("");
    setStatus(error ? { tone: "error", text: friendly(error.message) } : { tone: "ok", text: "Password updated. You're signed in." });
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

  if (!session.ready) return <p className="text-mute">Loading…</p>;

  const tabs: { id: Mode; label: string }[] = [
    { id: "signup", label: "Create account" },
    { id: "login", label: "Log in" },
  ];

  return (
    <div className="space-y-6">
      {!session.configured ? (
        <section className={card}>
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Accounts are coming soon</h2>
          <p className="mt-3 max-w-prose text-mute">
            For now everything you enter is saved in this browser only. Use the
            export below to keep a copy.
          </p>
        </section>
      ) : session.email && session.recovering ? (
        <section className={card}>
          <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Set a new password</h2>
          <form onSubmit={setRecoveredPassword} className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end" noValidate>
            <div className="flex-1">
              <label htmlFor="new-password" className="mb-1.5 block text-sm">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={field} />
            </div>
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">Save</button>
          </form>
        </section>
      ) : session.email ? (
        <section className={card}>
          <p className="eyebrow">Signed in</p>
          <h2 className="mt-2 break-all font-display text-3xl font-light tracking-[-0.03em]">{session.email}</h2>
          <p className="mt-3 max-w-prose text-mute">
            Your profile, goals, and every check-in are saved to your account and
            sync automatically. Log in with the same email on any phone or
            computer to pick up where you left off.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/today" className="btn-primary">Go to Today</Link>
            <button type="button" onClick={runSync} disabled={busy} className="btn-secondary disabled:opacity-50">
              {busy ? "Working…" : "Sync now"}
            </button>
            <button type="button" onClick={signOut} className="btn-secondary">Sign out</button>
          </div>
        </section>
      ) : (
        <section className={card}>
          <div className="flex gap-2" role="tablist" aria-label="Create account or log in">
            {tabs.map((tab) => {
              const active = mode === tab.id || (tab.id === "login" && (mode === "link" || mode === "reset"));
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setMode(tab.id);
                    setStatus(null);
                  }}
                  className={`min-h-11 rounded-full border px-4 text-sm ${active ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 font-display text-3xl font-light tracking-[-0.03em]">
            {mode === "signup" ? "Create your free account" : mode === "reset" ? "Reset your password" : "Welcome back"}
          </h2>
          <p className="mt-2 max-w-prose text-mute">
            {mode === "signup"
              ? "Save your goals and every check-in, see your history on any device, and never lose your progress."
              : mode === "reset"
                ? "Enter your email and we'll send you a link to choose a new password."
                : mode === "link"
                  ? "No password needed: we'll email you a link that signs you in."
                  : "Log in to sync your check-ins across your devices."}
          </p>

          <form onSubmit={submit} className="mt-6 max-w-md space-y-4" noValidate>
            <div>
              <label htmlFor="account-email" className="mb-1.5 block text-sm">Email</label>
              <input id="account-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </div>
            {mode === "signup" || mode === "login" ? (
              <div>
                <label htmlFor="account-password" className="mb-1.5 block text-sm">Password</label>
                <input
                  id="account-password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={mode === "signup" ? "password-hint" : undefined}
                  className={field}
                />
                {mode === "signup" ? (
                  <p id="password-hint" className="mt-1.5 text-xs text-mute">At least {MIN_PASSWORD} characters.</p>
                ) : null}
              </div>
            ) : null}
            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50 sm:w-auto">
              {busy
                ? "Working…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "login"
                    ? "Log in"
                    : mode === "link"
                      ? "Email me a link"
                      : "Send reset link"}
            </button>
          </form>

          <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
            {mode === "login" ? (
              <>
                <button type="button" className={textLink} onClick={() => setMode("reset")}>Forgot password?</button>
                <button type="button" className={textLink} onClick={() => setMode("link")}>Email me a sign-in link instead</button>
              </>
            ) : mode === "link" || mode === "reset" ? (
              <button type="button" className={textLink} onClick={() => setMode("login")}>Back to log in</button>
            ) : (
              <span>
                By creating an account you agree to the <Link href="/terms" className={textLink}>terms</Link> and{" "}
                <Link href="/privacy" className={textLink}>privacy policy</Link>.
              </span>
            )}
          </p>
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
          <Link href="/privacy" className={textLink}>privacy policy</Link>.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={downloadExport} className="btn-secondary">Download my data</button>
          <button type="button" onClick={() => setConfirm("local")} className="btn-secondary">Clear this device</button>
          {session.email ? (
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
