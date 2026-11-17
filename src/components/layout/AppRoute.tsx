"use client";

import { usePathname } from "next/navigation";

/** Screens people use once signed up, as opposed to the site that explains Aevum. */
const appRoutes = ["/today", "/dashboard", "/train", "/ai", "/account"];

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

/** Pages drawn in the warm light theme. Everything else stays dark. */
const lightRoutes = ["/", "/labs"];

/** The shell wrapper: switches on the light theme for the pages that use it. */
export function ThemeScope({ className, children }: { className: string; children: React.ReactNode }) {
  const light = lightRoutes.includes(usePathname());
  return <div className={light ? `theme-light ${className}` : className}>{children}</div>;
}
