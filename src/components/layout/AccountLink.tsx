"use client";

import Link from "next/link";
import { useSession } from "@/lib/sync/useSession";

/** Nav entry: "Sign in" when signed out, "Dashboard" once signed in. */
export function AccountLink({ className }: { className: string }) {
  const { configured, ready, email } = useSession();
  const signedIn = configured && ready && Boolean(email);
  const label = !configured || !ready ? "Account" : signedIn ? "Dashboard" : "Sign in";
  return (
    <Link href={signedIn ? "/dashboard" : "/account"} className={className}>
      {label}
    </Link>
  );
}
