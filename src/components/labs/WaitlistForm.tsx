"use client";

import Link from "next/link";
import { useState } from "react";
import { labGoals } from "@/lib/labs";

type Status = "idle" | "sending" | "done" | "error";

const fieldBase = "min-h-12 w-full rounded-full border px-5 text-base focus:outline-none";
const fields = {
  light: `${fieldBase} border-rule bg-sheet text-ink placeholder:text-dim focus:border-ink`,
  dark: `${fieldBase} border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white [&>option]:text-ink`,
};

/**
 * Email plus an optional goal. One email when testing opens, nothing else.
 * `dark` sits on the dark hero stage: translucent fields and a white button.
 */
export function WaitlistForm({ id, tone = "light" }: { id?: string; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const field = fields[tone];
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    const response = await fetch("/api/labs/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        goal: form.get("goal") || null,
        website: form.get("website"),
      }),
    }).catch(() => null);
    const body = await response?.json().catch(() => ({}));
    if (response?.ok) return setStatus("done");
    setStatus("error");
    setMessage(body?.error === "email" ? "That email doesn't look right. Check it and try again." : "Something went wrong. Try again in a minute.");
  }

  if (status === "done") {
    return (
      <div id={id} className={`rounded-3xl border p-6 ${dark ? "border-white/20 bg-white/10" : "border-rule bg-sheet"}`} role="status">
        <p className="text-xl">You&apos;re on the list.</p>
        <p className={`mt-2 ${dark ? "text-white/70" : "text-mute"}`}>We&apos;ll email you once, the day Aevum Labs opens.</p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} className="grid max-w-xl gap-3">
      <label className="sr-only" htmlFor={`${id ?? "w"}-email`}>
        Email
      </label>
      <input id={`${id ?? "w"}-email`} name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={field} />
      <label className="sr-only" htmlFor={`${id ?? "w"}-goal`}>
        Main goal (optional)
      </label>
      <select id={`${id ?? "w"}-goal`} name="goal" defaultValue="" className={field}>
        <option value="">Main goal (optional)</option>
        {labGoals.map((goal) => (
          <option key={goal.key} value={goal.key}>
            {goal.label}
          </option>
        ))}
      </select>
      {/* Hidden from people; catches bots that fill every field. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button type="submit" disabled={status === "sending"} className={`${dark ? "btn-light" : "btn-primary"} disabled:opacity-60`}>
        {status === "sending" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p role="alert" className={`text-sm ${dark ? "text-[#ff9b8f]" : "text-warn"}`}>
          {message}
        </p>
      )}
      <p className={`text-sm ${dark ? "text-white/55" : "text-dim"}`}>
        One email when testing opens. No spam.{" "}
        <Link href="/privacy" className={`underline underline-offset-4 ${dark ? "decoration-white/30" : "decoration-rule"}`}>
          Privacy
        </Link>
      </p>
    </form>
  );
}
