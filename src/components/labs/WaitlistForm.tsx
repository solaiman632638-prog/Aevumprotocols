"use client";

import Link from "next/link";
import { useState } from "react";
import { labGoals } from "@/lib/labs";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "min-h-12 w-full rounded-full border border-rule bg-sheet px-5 text-base text-ink placeholder:text-dim focus:border-ink focus:outline-none";

/** Email plus an optional goal. One email when testing opens, nothing else. */
export function WaitlistForm({ id }: { id?: string }) {
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
      <div id={id} className="rounded-3xl border border-rule bg-sheet p-6" role="status">
        <p className="text-xl">You&apos;re on the list.</p>
        <p className="mt-2 text-mute">We&apos;ll email you once, the day Aevum Labs opens.</p>
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
      <button type="submit" disabled={status === "sending"} className="btn-primary disabled:opacity-60">
        {status === "sending" ? "Joining…" : "Join the waitlist"}
      </button>
      {status === "error" && (
        <p role="alert" className="text-sm text-warn">
          {message}
        </p>
      )}
      <p className="text-sm text-dim">
        One email when testing opens. No spam.{" "}
        <Link href="/privacy" className="underline decoration-rule underline-offset-4">
          Privacy
        </Link>
      </p>
    </form>
  );
}
