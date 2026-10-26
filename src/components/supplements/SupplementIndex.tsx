"use client";

import Link from "next/link";
import { useState } from "react";
import { goalName, goalsFromProfile, supplementGoals, supplements, type SupplementGoal } from "@/lib/data/supplements";
import { useProfile } from "@/lib/today/useProfile";

const chip = "min-h-9 rounded-full border px-3.5 text-sm transition-colors";

export function SupplementIndex() {
  const profile = useProfile();
  const [picked, setPicked] = useState<SupplementGoal | "all" | null>(null);
  const yours = [...new Set((profile?.goals ?? []).flatMap((goal) => goalsFromProfile[goal] ?? []))];
  // Until they pick, show what matches their Today goals, or everything.
  const goal = picked ?? (yours.length ? "yours" : "all");
  const shown = supplements.filter((item) =>
    goal === "all" ? true : goal === "yours" ? item.goals.some((g) => yours.includes(g)) : item.goals.includes(goal),
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Goal">
        {yours.length ? (
          <button type="button" role="radio" aria-checked={goal === "yours"} onClick={() => setPicked(null)}
            className={`${chip} ${goal === "yours" ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}>
            For my goals
          </button>
        ) : null}
        {[{ slug: "all" as const, name: "All" }, ...supplementGoals].map((option) => (
          <button key={option.slug} type="button" role="radio" aria-checked={goal === option.slug} onClick={() => setPicked(option.slug)}
            className={`${chip} ${goal === option.slug ? "border-pine bg-pine text-on-accent" : "border-rule text-mute hover:border-ink hover:text-ink"}`}>
            {option.name}
          </button>
        ))}
      </div>
      {goal === "yours" ? (
        <p className="mt-3 text-sm text-mute">Matched to the goals in your Today profile: {yours.map(goalName).join(", ")}.</p>
      ) : null}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {shown.map((item) => (
          <li key={item.slug}>
            <Link href={`/supplements/${item.slug}`} className="block h-full rounded-3xl border border-rule bg-sheet p-5 text-ink no-underline hover:border-pine">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl font-light tracking-[-0.02em]">{item.name}</h2>
                <span className="shrink-0 font-mono text-[0.7rem] text-mute">{item.evidence} evidence</span>
              </div>
              <p className="mt-2 text-sm text-mute">{item.summary}</p>
              <p className="mt-3 text-sm"><span className="text-mute">Typical: </span>{item.dose.amount}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
