import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-rule bg-sheet">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <p className="max-w-xl text-sm text-mute">
          Educational health and research information. Not medical advice.
          Research compounds are not for human use.{" "}
          <Link href="/disclaimer" className="text-pine-deep underline decoration-rule underline-offset-2">
            Full disclaimer
          </Link>
          .
        </p>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
          <Link href="/privacy" className="text-mute no-underline hover:text-ink">Privacy</Link>
          <Link href="/terms" className="text-mute no-underline hover:text-ink">Terms</Link>
          <Link href="/account" className="text-mute no-underline hover:text-ink">Account</Link>
          <span>Aevum</span>
        </nav>
      </div>
    </footer>
  );
}
