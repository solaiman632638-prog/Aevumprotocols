"use client";

import { useState } from "react";
import { linkUrl, SHORTCUT_NAME, type HeartReading } from "@/lib/health/heart";
import { site } from "@/lib/site";
import { syncClient } from "@/lib/sync/client";

const timeFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

/**
 * Apple Health link for signed-in members. The iPhone Shortcut reads resting
 * heart rate, HRV, and breathing rate each morning and posts them here.
 */
export function HeartConnect({ reading }: { reading: HeartReading | null }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "linking" | "error">("idle");

  async function link() {
    setStatus("linking");
    const { data } = await syncClient()!.auth.getSession();
    const response = await fetch("/api/health/key", {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.key) return setStatus("error");
    setStatus("idle");
    window.location.href = linkUrl(body.key);
  }

  if (reading && !open) {
    const values = [reading.rhr != null && `${reading.rhr} bpm`, reading.hrv != null && `HRV ${reading.hrv} ms`].filter(Boolean);
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-rule bg-sheet px-4 py-3 text-sm">
        <p className="text-mute">
          <span className="text-ink">Apple Health connected.</span> Last reading {timeFormat.format(new Date(reading.measuredAt))}
          {values.length ? `: ${values.join(", ")}` : ""}.
        </p>
        <button type="button" onClick={() => setOpen(true)} className="text-xs text-mute underline-offset-2 hover:text-ink hover:underline">
          Set up again
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-rule bg-sheet p-5 sm:p-8">
      <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Heart rate from your iPhone</h2>
      <p className="mt-2 max-w-prose text-sm text-mute">
        Resting heart rate and HRV fill in every morning from Apple Health. Works with Apple Watch, and with
        Oura, WHOOP, Garmin, Withings, or Polar if they share to Apple Health. Do this on your iPhone; it
        takes about a minute.
      </p>
      <ol className="mt-6 space-y-5 text-sm">
        <li className="grid grid-cols-[1.5rem_1fr] gap-3">
          <span className="font-mono text-brass">1</span>
          <div>
            <p>Add the {SHORTCUT_NAME} Shortcut and allow it to read Health data.</p>
            {site.healthShortcutUrl ? (
              <a href={site.healthShortcutUrl} className="btn-secondary mt-2 inline-flex !min-h-0 !px-4 !py-2">
                Get the Shortcut
              </a>
            ) : (
              <p className="mt-1 text-xs text-dim">The Shortcut link is on its way.</p>
            )}
          </div>
        </li>
        <li className="grid grid-cols-[1.5rem_1fr] gap-3">
          <span className="font-mono text-brass">2</span>
          <div>
            <p>Link it to your account. The Shortcut opens, saves your private key, and sends a first reading.</p>
            <button type="button" onClick={link} disabled={status === "linking"} className="btn-primary mt-2 !min-h-0 !px-4 !py-2">
              {status === "linking" ? "Linking…" : "Link my iPhone"}
            </button>
            {status === "error" ? <p className="mt-2 text-xs text-warn">Could not create a key. Try again in a moment.</p> : null}
          </div>
        </li>
        <li className="grid grid-cols-[1.5rem_1fr] gap-3">
          <span className="font-mono text-brass">3</span>
          <p>
            Make it automatic: in Shortcuts, open <b>Automation</b>, tap <b>+</b>, choose <b>Time of Day</b>, set 7:00 AM
            daily, pick <b>Run Immediately</b>, and choose {SHORTCUT_NAME}.
          </p>
        </li>
      </ol>
      {reading ? (
        <button type="button" onClick={() => setOpen(false)} className="mt-6 text-xs text-mute underline-offset-2 hover:text-ink hover:underline">
          Done
        </button>
      ) : null}
    </section>
  );
}
