import type { Metadata } from "next";
import { AccountPanel } from "@/components/sync/AccountPanel";

export const metadata: Metadata = {
  title: "Account",
  description: "Sync your Aevum profile and check-ins across devices, or export and delete your data.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Account</h1>
      <div className="mt-10">
        <AccountPanel />
      </div>
    </div>
  );
}
