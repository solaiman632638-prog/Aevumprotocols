"use client";

import { usePathname } from "next/navigation";

/** Screens people use once signed up, as opposed to the site that explains Aevum. */
const appRoutes = ["/today", "/dashboard", "/train", "/ai", "/account", "/book"];

export function useAppRoute(): boolean {
  const pathname = usePathname();
  return appRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Renders its children only on the marketing side of the site. */
export function SiteOnly({ children }: { children: React.ReactNode }) {
  return useAppRoute() ? null : children;
}

/** On app screens, hides its children on phones, where the tab bar is the chrome. */
export function DesktopOnInApp({ children }: { children: React.ReactNode }) {
  return <div className={useAppRoute() ? "hidden md:contents" : "contents"}>{children}</div>;
}
