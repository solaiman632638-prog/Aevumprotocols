"use client";

import Link from "next/link";
import { useState } from "react";
import { combinedFocus } from "@/components/train/PlanPanel";
import { muscleName } from "@/lib/train/exercises";
import { saveAnalysis, type SavedAnalysis } from "@/lib/train/bodyAnalysis";
import { strengthFocus } from "@/lib/train/plan";
import { useWorkouts } from "@/lib/train/useWorkouts";
import { syncClient } from "@/lib/sync/client";
import { useSession } from "@/lib/sync/useSession";
import { todayIso } from "@/lib/today/storage";
import { useProfile } from "@/lib/today/useProfile";

const card = "rounded-3xl border border-rule bg-sheet p-5 sm:p-8";
const textLink = "text-pine-deep underline decoration-rule underline-offset-2";

/** Shrinks a phone photo to at most 1024 px on its long side, as JPEG. */
async function resize(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function BodyPanel({ photo, onPlan }: { photo: SavedAnalysis | null; onPlan: () => void }) {
  const session = useSession();
  const profile = useProfile();
  const days = useWorkouts();
  const [status, setStatus] = useState<{ kind: "idle" | "working" } | { kind: "error"; message: string }>({ kind: "idle" });
  const lifts = strengthFocus(profile, days, todayIso());
  const focus = combinedFocus(lifts, photo);

  async function analyse(file: File) {
    setStatus({ kind: "working" });
    try {
      const image = await resize(file);
      const { data } = await syncClient()!.auth.getSession();
      const response = await fetch("/api/body/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ image }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) return setStatus({ kind: "error", message: body.error ?? "Body analysis failed." });
      if (!body.analysis.usable) return setStatus({ kind: "error", message: body.analysis.reason });
      saveAnalysis({ date: todayIso(), summary: body.analysis.summary, focus: body.analysis.focus, strengths: body.analysis.strengths });
      setStatus({ kind: "idle" });
    } catch {
      setStatus({ kind: "error", message: "Could not read that photo. Try a JPEG or PNG." });
    }
  }

  const adult = !profile || profile.age >= 18;

  return (
    <div className="space-y-8">
      <section className={card}>
        <h2 className="font-display text-3xl font-light tracking-[-0.03em]">Your focus areas</h2>
        {focus.length ? (
          <ul className="mt-4 space-y-3">
            {focus.map((item) => (
              <li key={item.muscle}>
                <p className="font-medium">{muscleName(item.muscle)}</p>
                <p className="text-sm text-mute">
                  {item.reason} <span className="text-dim">({item.source === "photo" ? "from your photo" : "from your lifts"})</span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-mute">
            Nothing stands out yet. Log your main lifts on the Log tab, or add a photo below.
          </p>
        )}
        {focus.length ? (
          <button type="button" onClick={onPlan} className="btn-primary mt-5 !min-h-0 !px-5 !py-2">
            See the plan built around these
          </button>
        ) : null}
      </section>

      <section className={card}>
        <h2 className="font-display text-3xl font-light tracking-[-0.03em]">AI photo analysis</h2>
        <p className="mt-2 max-w-prose text-sm text-mute">
          Upload one photo, front-on in good light, wearing training clothes. The AI compares your muscle groups with each
          other and says which to bring up. It doesn&apos;t judge body fat or looks.
        </p>
        <p className="mt-2 max-w-prose text-xs text-dim">
          Your photo is sent to our AI provider (OpenAI) to be analysed and is not saved by Aevum. Only the result stays,
          on this device. Adults only.
        </p>

        {!session.email ? (
          <p className="mt-5 text-sm text-mute">
            <Link href="/account" className={textLink}>Log in</Link> to use photo analysis.
          </p>
        ) : !adult ? (
          <p className="mt-5 text-sm text-mute">Photo analysis is for adults only.</p>
        ) : (
          <label className="btn-secondary mt-5 inline-flex cursor-pointer !min-h-0 !px-5 !py-2">
            {status.kind === "working" ? "Analysing…" : photo ? "Analyse a new photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={status.kind === "working"}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void analyse(file);
              }}
            />
          </label>
        )}
        {status.kind === "error" ? <p role="alert" className="mt-3 text-sm text-warn">{status.message}</p> : null}

        {photo ? (
          <div className="mt-6 border-t border-rule pt-5">
            <p className="text-xs text-mute">Last analysis, {new Date(`${photo.date}T00:00:00`).toLocaleDateString()}</p>
            <p className="mt-2">{photo.summary}</p>
            {photo.strengths.length ? (
              <p className="mt-2 text-sm text-mute">Strong points: {photo.strengths.map(muscleName).join(", ")}.</p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
