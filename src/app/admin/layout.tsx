import React from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | NOVA E-Commerce",
  description: "Management dashboard for inventory, orders, categories, and customers.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict server-side verification: blocks non-admins and unauthenticated users
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      <AdminSidebar adminEmail={admin.email || ""} adminName={admin.name || "Administrator"} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
