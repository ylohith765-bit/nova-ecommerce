import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatusSelector } from "@/components/admin/order-status-selector";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Calendar,
  User,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  });

  return {
    title: order ? `Order #${order.orderNumber} | NOVA Admin` : "Order Details | NOVA Admin",
    description: "Manage fulfillment and inspect order items.",
  };
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, stock: true },
          },
        },
      },
      shippingAddress: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const subtotal = Number(order.subtotal);
  const shippingFee = Number(order.shippingFee);
  const tax = Number(order.tax);
  const totalAmount = Number(order.totalAmount);
  const totalQuantity = order.items.reduce((acc, it) => acc + it.quantity, 0);

  const paymentStatus = order.payment?.status || "PENDING";

  return (
    <div className="space-y-6">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Order #{order.orderNumber}
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              ID: {order.id}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {/* Status Control Banner */}
        <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Update Status:
          </span>
          <OrderStatusSelector
            orderId={order.id}
            currentStatus={order.status}
          />
        </div>
      </div>

      {/* Main Grid: Order items & breakdown on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Items and Cost Summary */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Items in Order ({totalQuantity})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {order.items.map((item) => {
                const itemPrice = Number(item.price);
                const itemSubtotal = itemPrice * item.quantity;
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {item.productTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: <span className="font-semibold text-foreground">{item.quantity}</span> &times; {formatPrice(itemPrice)}
                      </p>
                      {item.product ? (
                        <Link
                          href={`/admin/products/${item.product.id}/edit`}
                          className="inline-flex items-center text-xs text-primary hover:underline mt-1"
                        >
                          View in inventory (Stock: {item.product.stock})
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground mt-1 block italic">
                          Product no longer in catalog
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-foreground text-sm">
                        {formatPrice(itemSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base">Order Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fee</span>
                <span className="text-foreground font-medium">
                  {shippingFee === 0 ? "FREE" : formatPrice(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax</span>
                <span className="text-foreground font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between text-base font-bold text-foreground">
                <span>Total Amount</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Customer, Payment, Shipping */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Info Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{order.user?.name || "Customer"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground font-mono text-xs">{order.user?.email || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Role</p>
                <Badge variant="outline" className="text-xs font-medium mt-0.5">
                  {order.user?.role || "USER"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Payment Record
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Payment Status</span>
                <Badge
                  className={
                    paymentStatus === "PAID"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }
                >
                  {paymentStatus}
                </Badge>
              </div>

              {order.payment?.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Payment Method</span>
                  <span className="text-xs font-medium text-foreground capitalize">
                    {order.payment.paymentMethod}
                  </span>
                </div>
              )}

              {order.payment?.stripePaymentIntentId && (
                <div>
                  <span className="text-xs text-muted-foreground">Payment Reference</span>
                  <p className="font-mono text-xs text-foreground bg-muted p-1.5 rounded-sm mt-0.5 break-all">
                    {order.payment.stripePaymentIntentId}
                  </p>
                </div>
              )}

              {order.stripeSessionId && (
                <div>
                  <span className="text-xs text-muted-foreground">Stripe Session</span>
                  <p className="font-mono text-xs text-muted-foreground bg-muted/60 p-1.5 rounded-sm mt-0.5 truncate">
                    {order.stripeSessionId}
                  </p>
                </div>
              )}

              {order.payment?.createdAt && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
                  <span>Processed on</span>
                  <span>{formatDate(order.payment.createdAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Shipping Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm space-y-1">
              {order.shippingAddress ? (
                <>
                  <p className="font-semibold text-foreground">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                  <p className="text-xs text-muted-foreground pt-2">
                    Phone: <span className="font-medium text-foreground">{order.shippingAddress.phone}</span>
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-xs italic">
                  No shipping address attached to this order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
