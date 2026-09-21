import Link from "next/link";
import { storeHome } from "@/lib/data/protocols";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-rule bg-sheet">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <p className="max-w-xl text-sm text-mute">
          Educational reconstitution worksheets for research compounds. Science
          paraphrased from{" "}
          <a
            href="https://www.pepipedia.com/peptides"
            className="text-pine-deep underline decoration-rule underline-offset-2"
            rel="noreferrer"
            target="_blank"
          >
            Pepipedia
          </a>
          . Not medical advice. Not for human use.{" "}
          <Link href="/disclaimer" className="text-pine-deep underline decoration-rule underline-offset-2">
            Full disclaimer
          </Link>
          .
        </p>
        <p className="text-xs text-mute">
          Aevum Protocols · companion to the{" "}
          <a
            href={storeHome}
            className="text-pine-deep underline decoration-rule underline-offset-2"
            rel="noreferrer"
            target="_blank"
          >
            NovaEvum catalog
          </a>
        </p>
      </div>
    </footer>
  );
}
