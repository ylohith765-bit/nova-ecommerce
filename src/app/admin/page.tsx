import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminDashboardMetricsAction } from "@/actions/admin-actions";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Edit,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | NOVA Admin",
  description: "Executive e-commerce overview, revenue metrics, orders, and inventory status.",
};

export default async function AdminDashboardPage() {
  const res = await getAdminDashboardMetricsAction();

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center text-rose-400">
        Failed to load administrative dashboard metrics.
      </div>
    );
  }

  const {
    totalProducts,
    totalOrders,
    totalCustomers,
    lowStockCount,
    outOfStockCount,
    totalRevenue,
    recentOrders,
    lowStockProducts,
  } = res.data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time telemetry on revenue, customer orders, and warehouse inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              + Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Revenue */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Revenue
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black text-white">
              {formatPrice(totalRevenue)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Verified paid orders
            </p>
          </CardContent>
        </Card>

        {/* 2. Total Orders */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Orders
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalOrders}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Recorded in PostgreSQL
            </p>
          </CardContent>
        </Card>

        {/* 3. Total Products */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Products
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalProducts}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              In store catalog
            </p>
          </CardContent>
        </Card>

        {/* 4. Total Customers */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Customers
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black text-white">
              {totalCustomers}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Registered users
            </p>
          </CardContent>
        </Card>

        {/* 5. Low Stock Alert */}
        <Card className="bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Inventory Alert
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {lowStockCount + outOfStockCount}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {outOfStockCount} out of stock &bull; {lowStockCount} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Orders (7 cols) + Low Stock Attention (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Section */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  Recent Customer Orders
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Latest customer purchases and payment status
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                No orders have been recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-bold text-white hover:text-indigo-300 transition-colors"
                        >
                          #{order.orderNumber}
                        </Link>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            order.paymentStatus === "PAID"
                              ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                              : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          }`}
                        >
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      <p className="text-zinc-400">
                        {order.customerName} &bull; {order.customerEmail}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="font-bold text-white block text-sm">
                          {formatPrice(order.totalAmount)}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase">
                          {order.orderStatus}
                        </span>
                      </div>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 border-zinc-700 text-zinc-300 text-xs hover:bg-zinc-800"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Watchlist Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Inventory Attention Needed
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Products with 10 or fewer units in stock
                </p>
              </div>

              <Link
                href="/admin/products?stockStatus=low_stock"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-emerald-400 py-6 text-center">
                All inventory levels are healthy! No low stock products detected.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {lowStockProducts.map((p) => {
                  const isOut = p.stock === 0;
                  return (
                    <div
                      key={p.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-11 w-11 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-600">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-zinc-400">
                            {p.categoryName} &bull; {formatPrice(p.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isOut
                              ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                              : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                          }`}
                        >
                          {isOut ? "Out of Stock" : `${p.stock} Left`}
                        </Badge>
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 border-zinc-700 text-zinc-300 hover:text-white"
                            title="Edit Stock / Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
