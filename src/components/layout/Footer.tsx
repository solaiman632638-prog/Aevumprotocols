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
        <p className="text-xs text-mute">
          Aevum Protocols
        </p>
      </div>
    </footer>
  );
}
