import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import BackButton from "@/app/BackButton";
import Link from "next/link";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  const designerProfile = session.user.role === "DESIGNER"
    ? await db.designerProfile.findUnique({ where: { userId: session.user.id } })
    : null;

  const orders = session.user.role === "SUPER_ADMIN"
    ? await db.order.findMany({
        include: {
          items: {
            include: {
              product: {
                include: { designer: true }
              }
            }
          },
          customer: true
        },
        orderBy: { createdAt: "desc" }
      })
    : await db.order.findMany({
        where: {
          items: {
            some: { designerId: designerProfile?.id ?? "" }
          }
        },
        include: {
          items: {
            include: {
              product: {
                include: { designer: true }
              }
            }
          },
          customer: true
        },
        orderBy: { createdAt: "desc" }
      });

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <section>
      <div className="mb-6">
        <BackButton fallbackUrl="/admin/dashboard" />
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-600 mt-1">
            {isSuperAdmin ? "All orders from your platform" : "Your orders"}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No orders yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid auto-fit grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {(orders as Order[]).map(function (order: Order) {
            const designersMap = new Map<string, { name: string; logo: string | null }>();
            order.items.forEach(function (item: any) {
              const designer = item.product.designer;
              if (!designersMap.has(designer.id)) {
                designersMap.set(designer.id, {
                  name: designer.brandName,
                  logo: designer.brandLogo
                });
              }
            });
            const designers = Array.from(designersMap.values());
            return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-500 mb-1">Order #{order.id.slice(0, 8)}</p>
                    <p className="font-semibold text-slate-900 group-hover:text-slate-700">
                      {order.customer.name || order.customer.email}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ml-2 flex-shrink-0 ${
                    order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    order.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm">{order.customer.email}</p>
                {designers.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Designers:</p>
                    <div className="flex flex-wrap gap-2">
                      {designers.map(function (designer, idx) {
                        return (
                          <div key={idx} className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1">
                            {designer.logo && (
                              <img
                                src={designer.logo}
                                alt={`${designer.name} logo`}
                                className="h-4 w-4 object-cover rounded"
                              />
                            )}
                            <span className="text-xs text-slate-700">{designer.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-slate-100">
                  <p className="text-slate-600 text-sm">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="font-semibold text-slate-900">
                    View →
                  </p>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
