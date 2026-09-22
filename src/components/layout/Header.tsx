import Link from "next/link";
import { Announcement } from "@/components/layout/Announcement";
import { library } from "@/lib/data/library";

const links = [
  { href: "/today", label: "Today" },
  { href: "/peptides", label: "Library" },
  { href: "/protocols", label: "Protocols" },
  { href: "/stacks", label: "Stacks" },
  { href: "/calculator", label: "Calculator" },
  { href: "/guides", label: "Guides" },
  { href: "/monitor", label: "Devices" },
  { href: "/account", label: "Account" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-black/40 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-sheet focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Announcement count={library.length} />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline text-xl font-light uppercase tracking-[0.28em] text-ink no-underline"
          aria-label="Aevum Protocols home"
        >
          {/* Crossbar-less A, drawn so it matches Figtree's light cap height. */}
          <svg
            aria-hidden
            viewBox="0 0 10 10"
            className="mr-[0.28em] h-[0.7em] w-[0.72em] self-center overflow-visible"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeLinejoin="miter"
          >
            <path d="M0.4 10 L5 0.3 L9.6 10" />
          </svg>
          <span aria-hidden>evum</span>
        </Link>
        <Link href="/today" className="btn-primary !min-h-0 !px-5 !py-2.5 lg:order-last">
          Start today
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
