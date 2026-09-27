"use client";

import { useEffect, useRef, useState } from "react";
import { AnswerCards } from "@/components/ai/AnswerCards";
import type { AevumAnswer } from "@/lib/aevum-ai/schema";
import { keys, readRaw, todayIso } from "@/lib/today/storage";
import { getCompound } from "@/lib/peptides/catalog";
import type { DayState } from "@/lib/today/types";
import type { RegimenEntry } from "@/lib/regimen/calculations";

type Turn = { role: "user" | "assistant"; content: string; answer?: AevumAnswer };

const SUGGESTIONS = [
  "What does BPC-157 do?",
  "What side effects are reported?",
  "What does human research show?",
  "Show published study protocols",
  "Analyse my current regimen",
  "What interactions should I know about?",
  "What should I monitor?",
];

const STAGES = ["Analysing question", "Checking your regimen", "Reviewing evidence", "Preparing response"];

/** Builds a regimen from the last 14 days of check-ins, entirely client-side. */
function readRegimen(): RegimenEntry[] {
  try {
    const raw = readRaw(keys.checkins);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, DayState>;
    const today = todayIso();
    const cutoff = new Date(Date.parse(today) - 14 * 86_400_000).toISOString().slice(0, 10);
    const counts = new Map<string, { amount: number; unit: "mg" | "mcg"; times: number }>();

    for (const day of Object.values(map)) {
      if (day.date < cutoff) continue;
      for (const dose of day.doses ?? []) {
        const model = getCompound(dose.compound);
        const name = model?.name ?? dose.label;
        if (!name || !(dose.amount > 0)) continue;
        const current = counts.get(name);
        counts.set(name, {
          amount: dose.amount,
          unit: dose.unit,
          times: (current?.times ?? 0) + 1,
        });
      }
    }

    return [...counts.entries()].map(([compound, item]) => ({
      compound,
      amount: item.amount,
      unit: item.unit,
      // Two weeks of logs, expressed per week.
      administrationsPerWeek: Math.max(1, Math.round(item.times / 2)),
    }));
  } catch {
    return [];
  }
}

export function AskAevum() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setStage((current) => Math.min(current + 1, STAGES.length - 1)), 900);
    return () => {
      clearInterval(id);
      setStage(0);
    };
  }, [busy]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setError(null);
    setDraft("");
    setTurns((current) => [...current, { role: "user", content: text }]);
    setBusy(true);

    try {
      const response = await fetch("/api/aevum-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          regimen: readRegimen(),
          history: turns.slice(-6).map((turn) => ({ role: turn.role, content: turn.content })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Aevum AI couldn't complete this analysis.");
      setTurns((current) => [
        ...current,
        { role: "assistant", content: data.answer.answer, answer: data.answer as AevumAnswer },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Aevum AI couldn't complete this analysis.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="flex-1 space-y-8">
        {turns.length === 0 ? (
          <div>
            <p className="max-w-prose text-mute">
              Ask about a compound, what the research shows, side effects, or the
              regimen you have already logged. Answers are built from Aevum&apos;s
              register, not from memory.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {SUGGESTIONS.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => send(item)}
                    className="min-h-11 rounded-full border border-rule px-4 text-sm text-mute hover:border-ink hover:text-ink"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {turns.map((turn, index) =>
          turn.role === "user" ? (
            <p key={index} className="ml-auto max-w-lg rounded-3xl rounded-br-lg bg-sheet px-5 py-3 text-right">
              {turn.content}
            </p>
          ) : (
            <article key={index} className="rounded-3xl border border-rule bg-sheet p-5 sm:p-7">
              <p className="eyebrow">Aevum AI</p>
              <div className="mt-4">{turn.answer ? <AnswerCards answer={turn.answer} /> : turn.content}</div>
            </article>
          ),
        )}

        {busy ? (
          <div className="rounded-3xl border border-rule bg-sheet p-5 sm:p-7" aria-live="polite">
            <p className="eyebrow">Aevum AI</p>
            <p className="mt-4 text-sm text-mute">{STAGES[stage]}…</p>
            <div className="mt-4 space-y-2">
              {[100, 85, 60].map((width) => (
                <div key={width} className="h-3 animate-pulse rounded-full bg-rule" style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-2xl border border-warn/40 bg-warn-tint px-4 py-3 text-sm text-warn">
            {error}
          </p>
        ) : null}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
        className="sticky bottom-4 mt-8 flex gap-2 rounded-3xl border border-rule bg-paper/90 p-2 backdrop-blur"
      >
        <label htmlFor="ai-input" className="sr-only">
          Ask Aevum AI
        </label>
        <input
          id="ai-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about a compound, your regimen, or the evidence…"
          maxLength={2000}
          className="min-h-11 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-dim"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="btn-primary !min-h-11 !px-6 disabled:opacity-40">
          Ask
        </button>
      </form>
    </div>
  );
}
