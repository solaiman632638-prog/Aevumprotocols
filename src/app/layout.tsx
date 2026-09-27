import type { Metadata, Viewport } from "next";
import { Doto, Space_Grotesk, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteShell } from "@/components/layout/SiteShell";
import { counts } from "@/lib/data/compounds";
import { site } from "@/lib/site";
import { SyncBridge } from "@/components/sync/SyncBridge";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

const readout = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  weight: ["400", "600", "700"],
});

const mono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://www.${site.domain}`),
  title: {
    default: "Aevum · Peptide protocols and evidence",
    template: "%s · Aevum",
  },
  // Kept in step with the register so the count can never go stale.
  description: `Log what you took, see what the human evidence actually says, and track every injection. ${counts.total} peptide compounds, each with a full protocol, interaction warnings, and vial math.`,
  openGraph: {
    title: "Aevum · Peptide protocols and evidence",
    description: `${counts.total} peptide compounds, each with a full protocol, ranked by the strength of the evidence behind it.`,
    siteName: "Aevum",
    type: "website",
  },
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
      className={`${sans.variable} ${mono.variable} ${readout.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SiteShell>{children}</SiteShell>
        <SyncBridge />
        <Analytics />
      </body>
    </html>
  );
}
