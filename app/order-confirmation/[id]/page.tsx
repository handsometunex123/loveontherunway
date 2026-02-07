import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import BackButton from "@/app/BackButton";
import type { Order } from "@/lib/types";

interface OrderConfirmationProps {
  params: { id: string };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationProps) {
  const order = await db.order.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: true
        }
      },
      customer: true
    }
  });

  if (!order) {
    notFound();
  }

  const totalAmount = (order?.items ?? []).reduce(function (sum: number, item: any) {
    return sum + ((item.product?.price ?? 0) * item.quantity);
  }, 0);

  return (
    <section className="px-4 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <BackButton fallbackUrl="/" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              ✓ Order Confirmed
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Order Confirmed</h1>
          <p className="text-slate-600">Thank you for your order. We'll be in touch soon with delivery details.</p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Order Info */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Order Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="text-lg font-mono font-semibold text-slate-900">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                      order.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Order Date</p>
                    <p className="text-slate-900">
                      {new Date(order.createdAt ?? new Date()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Customer Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Name</p>
                    <p className="text-slate-900">{order.customer.name || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-slate-900 break-all">{order.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-slate-900">{order.customer.phone || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Order Items</h2>
            <div className="space-y-4">
              {(order?.items ?? []).map(function (item: any) {
                return (
                <div key={item.id} className="flex items-start justify-between pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.product?.name || "Product"}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Quantity: <span className="font-semibold">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      NGN {((item.product?.price ?? 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      @ NGN {(item.product?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Order Total */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-slate-900">Order Total</span>
              <span className="text-3xl font-bold text-slate-900">
                NGN {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">What's Next?</h2>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-lg font-semibold text-slate-900">1</span>
                <div>
                  <p className="font-semibold text-slate-900">Order Confirmation</p>
                  <p className="text-sm text-slate-600">The designers have been notified about your order.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg font-semibold text-slate-900">2</span>
                <div>
                  <p className="font-semibold text-slate-900">Contact from Designers</p>
                  <p className="text-sm text-slate-600">Expect to hear from the designers within 24-48 hours regarding delivery and payment.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-lg font-semibold text-slate-900">3</span>
                <div>
                  <p className="font-semibold text-slate-900">Delivery</p>
                  <p className="text-sm text-slate-600">Arrange delivery details and complete payment with the designers.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-50 transition-colors text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="flex-1 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 transition-colors text-center"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
