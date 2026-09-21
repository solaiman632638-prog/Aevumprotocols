import Link from "next/link";
import { library } from "@/lib/data/library";

const links = [
  { href: "/today", label: "Today" },
  { href: "/peptides", label: "Library" },
  { href: "/protocols", label: "Protocols" },
  { href: "/stacks", label: "Stacks" },
  { href: "/monitor", label: "Monitor" },
  { href: "/calculator", label: "Calculator" },
  { href: "/guides", label: "Guides" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-sheet focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <p className="bg-pine px-4 py-1.5 text-center text-xs text-on-accent">
        The library now covers all {library.length} Pepipedia peptides.{" "}
        <Link href="/peptides" className="text-on-accent underline underline-offset-2">
          Browse it
        </Link>
      </p>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-light uppercase tracking-[0.28em] text-ink no-underline"
          aria-label="Aevum Protocols home"
        >
          Aevum
        </Link>
        <Link href="/plan" className="btn-primary !min-h-0 !px-5 !py-2.5 lg:order-last">
          Build a plan
        </Link>
        <nav
          aria-label="Primary"
          className="flex w-full flex-wrap items-center gap-x-5 gap-y-1 lg:w-auto lg:gap-x-8"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.8rem] font-semibold uppercase tracking-[0.02em] text-ink/80 no-underline hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
