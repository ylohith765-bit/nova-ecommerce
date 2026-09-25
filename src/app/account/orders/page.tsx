import React from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ArrowLeft, ShoppingBag } from "lucide-react";

export default async function OrdersPage() {
  const sessionUser = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: sessionUser.id },
    include: {
      items: true,
      shippingAddress: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
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
            View status, receipts, and item summaries for your orders.
          </p>
        </div>
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
            <Link href="/">
              <Button size="md" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Start Exploring Products
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
                <div>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Order #{order.orderNumber}</span>
                    <Badge variant="outline" className="text-[11px]">
                      {order.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 mt-0.5">
                    Placed on {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Total Amount</p>
                  <p className="text-base font-bold text-white">
                    {formatPrice(Number(order.totalAmount))}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-zinc-300 font-medium">
                      {item.productTitle} × {item.quantity}
                    </span>
                    <span className="text-zinc-400">
                      {formatPrice(Number(item.price))}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
