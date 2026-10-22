import type { Metadata } from "next";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your check-ins, regimen, injection sites, and trends in one place.",
  robots: { index: false },
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <MemberDashboard />
    </div>
  );
}
