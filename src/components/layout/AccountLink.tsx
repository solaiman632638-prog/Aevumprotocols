"use client";

import Link from "next/link";
import { useSession } from "@/lib/sync/useSession";

/** Nav entry that reads "Sign in" or "My account" once accounts are switched on. */
export function AccountLink({ className }: { className: string }) {
  const { configured, ready, email } = useSession();
  const label = !configured || !ready ? "Account" : email ? "My account" : "Sign in";
  return (
    <Link href="/account" className={className}>
      {label}
    </Link>
  );
}
