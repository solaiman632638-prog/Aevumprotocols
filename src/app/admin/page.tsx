import type { Metadata } from "next";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { MembersTable } from "@/components/admin/MembersTable";

export const metadata: Metadata = {
  title: "Admin",
  description: "Everyone who has signed up.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-7xl">Members</h1>
      <div className="mt-10">
        <BookingsTable />
      </div>
      <div className="mt-12">
        <MembersTable />
      </div>
    </div>
  );
}
