"use client";

import Link from "next/link";
import { useSession } from "@/lib/sync/useSession";

/** Nudge signed-out users to save their history, only when accounts are on. */
export function AccountPrompt() {
  const { configured, ready, email } = useSession();
  if (!configured || !ready || email) return null;
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-pine/60 bg-sheet p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h2 className="font-display text-2xl font-light tracking-[-0.02em]">Keep your progress</h2>
        <p className="mt-1 max-w-prose text-sm text-mute">
          Right now your check-ins live only in this browser. Create a free
          account to save your history and see it on any device.
        </p>
      </div>
      <Link href="/account" className="btn-primary self-start sm:self-auto">
        Create free account
      </Link>
    </section>
  );
}
