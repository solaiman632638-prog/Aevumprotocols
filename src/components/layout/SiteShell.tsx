import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TabBar } from "@/components/layout/TabBar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    // On phones the tab bar is fixed to the bottom, so the page clears it.
    <div className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <TabBar />
    </div>
  );
}
