import React from "react";
import { getAdminOrdersAction } from "@/actions/admin-actions";
import { OrdersTable } from "@/components/admin/orders-table";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | NOVA Admin",
  description: "Track customer orders, manage statuses, and inspect payment records.",
};

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { search, status, paymentStatus, page } = await searchParams;

  const pageNum = page ? parseInt(page, 10) : 1;

  const result = await getAdminOrdersAction({
    search,
    status,
    paymentStatus,
    page: isNaN(pageNum) ? 1 : pageNum,
    limit: 12,
  });

  const ordersData = result.success && result.data ? result.data : {
    orders: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review customer orders, update shipping and fulfillment states, and inspect checkout records.
          </p>
        </div>
      </div>

      {/* Orders Table & Filters */}
      <OrdersTable
        orders={ordersData.orders}
        totalCount={ordersData.totalCount}
        totalPages={ordersData.totalPages}
        currentPage={ordersData.currentPage}
        currentSearch={search || ""}
        currentStatus={status || "all"}
        currentPaymentStatus={paymentStatus || "all"}
      />
    </div>
  );
}
