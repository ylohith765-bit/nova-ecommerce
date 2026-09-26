"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/actions/admin-actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: OrderStatus;
  compact?: boolean;
}

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: "PENDING", label: "Pending", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  { value: "PROCESSING", label: "Processing", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
  { value: "SHIPPED", label: "Shipped", color: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
  { value: "DELIVERED", label: "Delivered", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  { value: "CANCELLED", label: "Cancelled", color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
];

export function OrderStatusSelector({
  orderId,
  currentStatus,
  compact = false,
}: OrderStatusSelectorProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === status) return;

    const previousStatus = status;
    setStatus(newStatus);
    setIsLoading(true);
    setNotification(null);

    try {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        setNotification({
          type: "success",
          message: res.message || `Status updated to ${newStatus}`,
        });
        router.refresh();
      } else {
        setStatus(previousStatus);
        setNotification({
          type: "error",
          message: res.message || "Failed to update status",
        });
      }
    } catch {
      setStatus(previousStatus);
      setNotification({
        type: "error",
        message: "Network or server error updating order status",
      });
    } finally {
      setIsLoading(false);
      // Auto clear success notification after 3s
      setTimeout(() => {
        setNotification((prev) => (prev?.type === "success" ? null : prev));
      }, 3000);
    }
  };

  const currentOption = statusOptions.find((o) => o.value === status) || statusOptions[0];

  return (
    <div className="space-y-1.5 inline-block">
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isLoading}
            className={`font-semibold rounded-lg border text-xs sm:text-sm px-3 py-1.5 pr-8 transition-colors cursor-pointer appearance-none focus:outline-hidden focus:ring-2 focus:ring-ring disabled:opacity-50 ${currentOption.color}`}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-foreground font-normal">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {!compact && notification && (
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            notification.type === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
