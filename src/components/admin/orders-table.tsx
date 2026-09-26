"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderStatusSelector } from "@/components/admin/order-status-selector";
import { OrderStatus } from "@prisma/client";
import {
  Search,
  Eye,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface AdminOrderItem {
  id: string;
  orderNumber: string;
  createdAt: Date;
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  payment: {
    status: string;
    amount: number;
    paymentMethod: string | null;
  } | null;
}

interface OrdersTableProps {
  orders: AdminOrderItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentSearch?: string;
  currentStatus?: string;
  currentPaymentStatus?: string;
}

export function OrdersTable({
  orders,
  totalCount,
  totalPages,
  currentPage,
  currentSearch = "",
  currentStatus = "all",
  currentPaymentStatus = "all",
}: OrdersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(currentPaymentStatus);

  const applyFilters = (newParams: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newParams.search !== undefined) {
      if (newParams.search.trim()) params.set("search", newParams.search.trim());
      else params.delete("search");
    }

    if (newParams.status !== undefined) {
      if (newParams.status !== "all") params.set("status", newParams.status);
      else params.delete("status");
    }

    if (newParams.paymentStatus !== undefined) {
      if (newParams.paymentStatus !== "all")
        params.set("paymentStatus", newParams.paymentStatus);
      else params.delete("paymentStatus");
    }

    if (newParams.page !== undefined) {
      if (newParams.page > 1) params.set("page", String(newParams.page));
      else params.delete("page");
    } else {
      params.delete("page");
    }

    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchTerm, page: 1 });
  };

  const paymentStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30">
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-amber-500/30">
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border-rose-500/30">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status || "None"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs sm:text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Order Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Order:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStatus(val);
                applyFilters({ status: val, page: 1 });
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              Payment:
            </span>
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPaymentStatus(val);
                applyFilters({ paymentStatus: val, page: 1 });
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {(currentSearch || currentStatus !== "all" || currentPaymentStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("all");
                setSelectedPaymentStatus("all");
                router.push("/admin/orders");
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-base font-medium">No orders found</p>
                    <p className="text-xs mt-1">Try modifying your search or filter settings.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-medium text-foreground whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-semibold text-primary hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-foreground">
                        {order.user?.name || "Customer"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.user?.email || "Unknown"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {paymentStatusBadge(order.payment?.status)}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <OrderStatusSelector
                        orderId={order.id}
                        currentStatus={order.status}
                        compact={true}
                      />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <div className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * 12 + (orders.length > 0 ? 1 : 0)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * 12 + orders.length}
              </span>{" "}
              of <span className="font-semibold text-foreground">{totalCount}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => applyFilters({ page: currentPage - 1 })}
                className="h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => applyFilters({ page: currentPage + 1 })}
                className="h-8 px-2.5 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
