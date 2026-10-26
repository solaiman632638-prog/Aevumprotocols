"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { BodyPanel } from "@/components/train/BodyPanel";
import { PlanPanel } from "@/components/train/PlanPanel";
import { TrainBoard, type Row } from "@/components/train/TrainBoard";
import { BODY_KEY, type SavedAnalysis } from "@/lib/train/bodyAnalysis";
import { readRaw, subscribe } from "@/lib/today/storage";

const tabs = [
  { id: "log", label: "Log & progress" },
  { id: "plan", label: "My plan" },
  { id: "body", label: "Body analysis" },
] as const;

type Tab = (typeof tabs)[number]["id"];

export function TrainTabs() {
  const [tab, setTab] = useState<Tab>("log");
  const [prefill, setPrefill] = useState<{ rows: Row[]; key: number } | null>(null);
  const raw = useSyncExternalStore(subscribe, () => readRaw(BODY_KEY), () => null);
  const photo = useMemo<SavedAnalysis | null>(() => {
    try {
      return raw ? (JSON.parse(raw) as SavedAnalysis) : null;
    } catch {
      return null;
    }
  }, [raw]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-x-6 gap-y-2" role="tablist" aria-label="Training">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`font-display text-xl font-light tracking-[-0.02em] sm:text-2xl ${tab === item.id ? "text-ink underline decoration-pine decoration-2 underline-offset-8" : "text-mute hover:text-ink"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "log" ? <TrainBoard key={prefill?.key ?? 0} prefill={prefill?.rows} /> : null}
      {tab === "plan" ? (
        <PlanPanel
          photo={photo}
          onLog={(rows) => {
            setPrefill({ rows, key: Date.now() });
            setTab("log");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      ) : null}
      {tab === "body" ? <BodyPanel photo={photo} onPlan={() => setTab("plan")} /> : null}
    </div>
  );
}
