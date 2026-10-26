"use client";

import Link from "next/link";
import { amountFor, getSupplement } from "@/lib/data/supplements";
import { conditions } from "@/lib/today/types";
import { useProfile } from "@/lib/today/useProfile";

/** The weight-based amount and any profile warnings, from the profile on this device. */
export function YourAmount({ slug }: { slug: string }) {
  const profile = useProfile();
  const item = getSupplement(slug)!;
  const perKg = item.dose.perKg;

  if (!profile) {
    return (
      <p className="text-sm text-mute">
        <Link href="/today" className="text-pine-deep underline decoration-rule underline-offset-2">Set up your Today profile</Link>{" "}
        to see this worked out for your body weight and checked against your health conditions.
      </p>
    );
  }

  const flags = profile.conditions.flatMap((id) => {
    const message = item.flags[id];
    return message ? [{ id, label: conditions.find((c) => c.id === id)?.label ?? id, message }] : [];
  });
  const kg = profile.weightKg;
  const weight = profile.units === "imperial" ? `${Math.round(kg * 2.20462)} lb` : `${kg} kg`;

  return (
    <div className="space-y-3">
      {perKg ? (
        <p>
          <span className="text-mute">{perKg.label} for you ({weight}): </span>
          <span className="font-display text-2xl font-light">{amountFor(perKg, kg)}</span>
        </p>
      ) : (
        <p className="text-sm text-mute">This amount does not change with body weight.</p>
      )}
      {flags.map((flag) => (
        <p key={flag.id} className="rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          {flag.message}
        </p>
      ))}
      {profile.age < 18 ? (
        <p className="rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          These amounts are for adults. Under 18, ask your doctor first.
        </p>
      ) : null}
    </div>
  );
}
