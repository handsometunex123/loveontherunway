"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const statusOptions: Array<{ value: OrderStatus; label: string; description: string; tone: string }> = [
  {
    value: "CONFIRMED",
    label: "Confirm Order",
    description: "Acknowledge this order and let the customer know you're on it.",
    tone: "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
  },
  {
    value: "COMPLETED",
    label: "Mark as Completed",
    description: "Use this after you have delivered the order.",
    tone: "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
  },
  {
    value: "CANCELLED",
    label: "Cancel Order",
    description: "Let the customer know you can’t process this order.",
    tone: "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
  }
];

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingStatus, setLoadingStatus] = useState<OrderStatus | null>(null);

  const handleUpdate = async (status: OrderStatus) => {
    if (status === currentStatus) {
      return;
    }

    setLoadingStatus(status);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Unable to update order status");
      }

      showToast("Order status updated and customer notified.", "success");
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setLoadingStatus(null);
    }
  };

  const isTerminal = currentStatus === "COMPLETED" || currentStatus === "CANCELLED";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Update Order Status</h2>
      <p className="text-sm text-slate-600 mb-6">
        Choose the appropriate status. The customer will receive an email update immediately.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {statusOptions.map((option) => {
          const isCurrent = currentStatus === option.value;
          const isLoading = loadingStatus === option.value;
          const isDisabled = isTerminal && !isCurrent;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleUpdate(option.value)}
              disabled={isLoading || isDisabled || isCurrent}
              className={`rounded-xl border px-4 py-4 text-left transition-all ${option.tone} ${isCurrent ? "opacity-70 cursor-not-allowed" : ""} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="text-sm font-semibold mb-1">
                {isLoading ? "Updating..." : option.label}
              </div>
              <div className="text-xs text-slate-600">
                {option.description}
              </div>
              {isCurrent && (
                <div className="mt-2 text-xs font-semibold text-slate-500">Current status</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
