import type { Metadata, Viewport } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteShell } from "@/components/layout/SiteShell";
import { SyncBridge } from "@/components/sync/SyncBridge";
import "./globals.css";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Aevum · Recovery, sleep, and goals",
    template: "%s · Aevum",
  },
  description:
    "Set your goals, log a thirty-second morning check-in, and get daily recovery, sleep, and training guidance. Plus evidence on 173 research compounds.",
  appleWebApp: { capable: true, title: "Aevum", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon/180",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SiteShell>{children}</SiteShell>
        <SyncBridge />
        <Analytics />
      </body>
    </html>
  );
}
