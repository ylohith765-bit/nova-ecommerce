import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order History | NOVA E-Commerce",
  description: "View receipts, status, and tracking for all your previous orders.",
};

export default async function OrdersPage() {
  const sessionUser = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: sessionUser.id },
    include: {
      items: true,
      shippingAddress: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Account
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-400" />
            Order History
          </h1>
          <p className="text-xs text-zinc-400">
            View status, receipts, and item summaries for your personal orders.
          </p>
        </div>

        <Link href="/shop">
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300">
            Browse Store
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-zinc-900/60 border-zinc-800 p-12 text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-base font-semibold text-white">No orders yet</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When you purchase products, your order confirmation, shipment tracking, and invoice details will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/shop">
              <Button size="md" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Start Exploring Products
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const paymentStatus = order.payment?.status || "PAID";

            return (
              <Card key={order.id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <CardTitle className="text-sm sm:text-base font-bold text-white">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold ${
                          order.status === "DELIVERED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : order.status === "PROCESSING"
                            ? "border-indigo-500/40 text-indigo-400 bg-indigo-500/10"
                            : "border-zinc-700 text-zinc-300"
                        }`}
                      >
                        {order.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-semibold ${
                          paymentStatus === "PAID"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        }`}
                      >
                        Payment: {paymentStatus}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-zinc-400">
                      Placed on {formatDate(order.createdAt)} &bull; {itemCount} {itemCount === 1 ? "item" : "items"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center sm:text-right justify-between sm:justify-end gap-4">
                    <div>
                      <p className="text-[11px] text-zinc-400">Total Amount</p>
                      <p className="text-base font-extrabold text-white">
                        {formatPrice(Number(order.totalAmount))}
                      </p>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-zinc-700 hover:bg-zinc-800 text-zinc-200 gap-1 text-xs"
                      >
                        <span>View Order</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-2">
                  <div className="divide-y divide-zinc-800/60 text-xs">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-1.5 flex items-center justify-between">
                        <span className="text-zinc-300 font-medium truncate max-w-xs sm:max-w-md">
                          {item.productTitle} &times; {item.quantity}
                        </span>
                        <span className="text-zinc-400">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="py-1 text-zinc-500 text-[11px]">
                        + {order.items.length - 3} more product(s)
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
