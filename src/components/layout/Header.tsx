import Link from "next/link";
import { AccountLink } from "@/components/layout/AccountLink";
import { SiteOnly } from "@/components/layout/AppRoute";

const links = [
  { href: "/today", label: "Today" },
  { href: "/train", label: "Training" },
  { href: "/ai", label: "Aevum AI" },
  { href: "/peptides", label: "Compounds" },
  { href: "/supplements", label: "Supplements" },
  { href: "/stacks", label: "Stacks" },
  { href: "/calculator", label: "Calculator" },
  { href: "/app", label: "Get the app" },
];

const navLink = "text-[0.8rem] font-semibold uppercase tracking-[0.02em] text-ink/80 no-underline hover:text-ink";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-black/40 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-sheet focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:py-4">
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
        <SiteOnly>
          <Link href="/today" className="btn-primary !min-h-0 !px-5 !py-2.5 lg:order-last">
            Start today
          </Link>
        </SiteOnly>
        <nav
          aria-label="Primary"
          className="hidden w-full flex-wrap items-center gap-x-5 gap-y-1 md:flex lg:w-auto lg:gap-x-8"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navLink}>
              {link.label}
            </Link>
          ))}
          <AccountLink className={navLink} />
        </nav>
      </div>
    </header>
  );
}
