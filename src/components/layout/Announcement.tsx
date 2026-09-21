"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Blue strip above the nav. Hidden on the home page, where the video leads. */
export function Announcement({ count }: { count: number }) {
  if (usePathname() === "/") return null;
  return (
    <p className="bg-pine px-4 py-1.5 text-center text-xs text-on-accent">
      The library now covers {count} peptides.{" "}
      <Link href="/peptides" className="text-on-accent underline underline-offset-2">
        Browse it
      </Link>
    </p>
  );
}
