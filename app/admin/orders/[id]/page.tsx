import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { notFound } from "next/navigation";
import BackButton from "@/app/BackButton";
import UpdateOrderStatus from "@/app/admin/orders/UpdateOrderStatus";
import type { Order } from "@/lib/types";

interface OrderDetailsProps {
  params: { id: string };
}

export default async function AdminOrderDetailsPage({ params }: OrderDetailsProps) {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              designer: true
            }
          }
        }
      },
      customer: true
    }
  });

  if (!order) {
    notFound();
  }

  // Check permissions
  let designerProfile: Awaited<ReturnType<typeof db.designerProfile.findUnique>> | null = null;
  if (session.user.role === "DESIGNER") {
    designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id, isDeleted: false }
    });

    const hasAccess = order.items.some((item: any) => item.product.designerId === designerProfile?.id);
    if (!hasAccess) {
      notFound();
    }
  }

  const totalAmount = (order?.items ?? []).reduce((sum: number, item: any) => {
    return sum + ((item.product?.price ?? 0) * item.quantity);
  }, 0);

  const itemsByDesigner = new Map<string, any[]>();
  (order?.items ?? []).forEach((item: any) => {
    const designerId = item.product.designerId;
    if (!itemsByDesigner.has(designerId)) {
      itemsByDesigner.set(designerId, []);
    }
    itemsByDesigner.get(designerId)?.push(item);
  });

  return (
    <section>
      <div className="mb-6">
        <BackButton fallbackUrl="/admin/orders" />
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
            <p className="text-sm text-slate-600 mt-1">Order #{order.id}</p>
          </div>
          <div>
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
              order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
              order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
              "bg-emerald-100 text-emerald-700"
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        {session.user.role === "DESIGNER" && (
          <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
        )}

        {/* Customer Info */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Customer Information</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Name</p>
              <p className="font-semibold text-slate-900">{order.customer.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Email</p>
              <p className="font-semibold text-slate-900 break-all">{order.customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Phone</p>
              <p className="font-semibold text-slate-900">{order.customer.phone || "Not provided"}</p>
            </div>
          </div>
        </div>

        {/* Items by Designer */}
        {Array.from(itemsByDesigner.entries()).map(([designerId, items]) => {
          // For designers, only show their own items
          if (session.user.role === "DESIGNER" && designerId !== designerProfile?.id) {
            return null;
          }

          const designer = items[0]?.product.designer;
          const subtotal = items.reduce((sum: number, item: any) => sum + ((item.product?.price ?? 0) * item.quantity), 0);

          return (
            <div key={designerId} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">
                {designer?.brandName || "Designer"} Products
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.product?.name}</p>
                      <p className="text-sm text-slate-600 mt-2">Quantity: <span className="font-semibold">{item.quantity}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        NGN {((item.product?.price ?? 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        @ NGN {(item.product?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">Subtotal for {designer?.brandName}</span>
                <span className="font-bold text-slate-900">
                  NGN {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Order Total */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">Order Total</span>
            <span className="text-3xl font-bold text-slate-900">
              NGN {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
