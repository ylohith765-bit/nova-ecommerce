import React from "react";
import { getAdminCustomersAction } from "@/actions/admin-actions";
import { CustomersTable } from "@/components/admin/customers-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customers | NOVA Admin",
  description: "View registered users, roles, and order activity.",
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const result = await getAdminCustomersAction();
  const customers = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse registered customer accounts, check activity levels, and view historical order histories.
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <CustomersTable customers={customers} />
    </div>
  );
}
