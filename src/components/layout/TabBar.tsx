"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AccountLink } from "@/components/layout/AccountLink";

/** Line icons on a 24-unit grid, drawn in the current text colour. */
const icons = {
  today: "M4 13h4l2-5 4 10 2-5h4",
  compounds: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7.5 15h9",
  ai: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8z",
  train: "M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12",
  more: "M4 7h16M4 12h16M4 17h16",
};

const tabs = [
  { href: "/today", label: "Today", icon: icons.today },
  { href: "/peptides", label: "Compounds", icon: icons.compounds },
  { href: "/ai", label: "AI", icon: icons.ai },
  { href: "/train", label: "Training", icon: icons.train },
];

const moreLinks = [
  { href: "/supplements", label: "Supplements" },
  { href: "/calculator", label: "Calculator" },
  { href: "/stacks", label: "Stacks" },
  { href: "/app", label: "Get the app" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/**
 * Phone navigation: the four places people go most, in thumb reach, with
 * everything else one tap away under More. Hidden from md up, where the
 * header carries the full nav.
 */
export function TabBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet whenever the route changes or Escape is pressed.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const moreActive = !open && [...moreLinks.map((link) => link.href), "/account", "/dashboard"].some(active);

  return (
    <div className="md:hidden">
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              id="more-menu"
              aria-label="More"
              className="fixed inset-x-3 z-50 rounded-3xl border border-rule bg-sheet p-2 bottom-[calc(4.75rem+env(safe-area-inset-bottom))]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              {moreLinks.map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-14 items-center rounded-2xl px-4 text-lg text-ink no-underline active:bg-panel">
                  {link.label}
                </Link>
              ))}
              <AccountLink className="flex min-h-14 items-center rounded-2xl px-4 text-lg text-ink no-underline active:bg-panel" />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <ul className="grid grid-cols-5">
          {tabs.map((tab) => {
            const on = active(tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={on ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.06em] no-underline transition-colors ${
                    on ? "text-ink" : "text-mute active:text-ink"
                  }`}
                >
                  {on ? (
                    <motion.span
                      layoutId="tab-active"
                      aria-hidden
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-ink"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  ) : null}
                  <Icon d={tab.icon} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="more-menu"
              onClick={() => setOpen((value) => !value)}
              className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.06em] ${
                open || moreActive ? "text-ink" : "text-mute active:text-ink"
              }`}
            >
              <Icon d={icons.more} />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
