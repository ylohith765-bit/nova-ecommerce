import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  CreditCard,
  MapPin,
  Calendar,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  });

  return {
    title: order ? `Order #${order.orderNumber} | NOVA` : "Order Details | NOVA",
    description: "View order receipt and shipment information.",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const sessionUser = await requireAuth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Strict ownership enforcement
  if (order.userId !== sessionUser.id) {
    notFound();
  }

  const paymentStatus = order.payment?.status || "PAID";
  const totalItemCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/account" className="hover:text-white transition-colors">
              Account
            </Link>
            <span>&bull;</span>
            <Link
              href="/account/orders"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              Orders
            </Link>
            <span>&bull;</span>
            <span className="text-zinc-200 font-medium">#{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-indigo-400" />
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-zinc-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <Link href="/account/orders">
          <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Button>
        </Link>
      </div>

      {/* Status Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Order Status:</span>
          <Badge
            variant="outline"
            className="border-indigo-500/40 text-indigo-400 bg-indigo-500/10 text-xs font-semibold"
          >
            {order.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Payment Status:</span>
          <Badge
            variant="outline"
            className={`text-xs font-semibold ${
              paymentStatus === "PAID"
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                : "border-amber-500/40 text-amber-400 bg-amber-500/10"
            }`}
          >
            {paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Main Grid: Items (7 cols) + Receipt & Shipping (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Purchased Items ({totalItemCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-zinc-800/80 p-0">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productTitle}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-zinc-600">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">
                        {item.productTitle}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Qty: {item.quantity} &bull; Unit: {formatPrice(Number(item.price))}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-white shrink-0">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-3 border-b border-zinc-800/80">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-xs sm:text-sm space-y-1 text-zinc-300">
                <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
                <p className="text-zinc-500 text-[11px] pt-1">
                  Phone: {order.shippingAddress.phone}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Receipt Breakdown & Payment */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200">{formatPrice(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" /> Shipping
                </span>
                <span className="text-zinc-200">
                  {Number(order.shippingFee) === 0 ? "FREE" : formatPrice(Number(order.shippingFee))}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Sales Tax</span>
                <span className="text-zinc-200">{formatPrice(Number(order.tax))}</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">Total</span>
                <span className="text-xl font-extrabold text-white">
                  {formatPrice(Number(order.totalAmount))}
                </span>
              </div>

              {order.payment && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-1 text-[11px] text-zinc-400">
                  <p>
                    <strong className="text-zinc-300">Method:</strong>{" "}
                    <span className="uppercase">{order.payment.paymentMethod || "card"}</span>
                  </p>
                  {order.payment.stripePaymentIntentId && (
                    <p className="truncate">
                      <strong className="text-zinc-300">Payment Reference:</strong>{" "}
                      <span className="font-mono text-[10px] text-zinc-500">
                        {order.payment.stripePaymentIntentId}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
