"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CartItem, getCart } from "@/lib/cart";
import BackButton from "../BackButton";
import { useToast } from "@/context/ToastContext";
import { ButtonLoader } from "@/components/Loader";

export default function CheckoutClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const items = getCart();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (!formData.email.includes("@")) {
      showToast("Please enter a valid email", "error");
      return;
    }

    if (items.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Checkout failed", "error");
        return;
      }

      showToast("Order placed successfully!", "success");
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (error) {
      showToast("An error occurred during checkout", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="px-4 md:px-6 md:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <BackButton fallbackUrl="/cart" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-slate-600 mt-2">Your cart is empty.</p>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Continue shopping →
          </Link>
        </div>
      </section>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);

  return (
    <section className="px-4 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <BackButton fallbackUrl="/cart" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
              <p className="text-sm text-slate-600 mt-1">Complete your purchase</p>
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-600">
                        {item.designerName} • Qty: {item.quantity}
                      </p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-slate-600 mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && " • "}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900">
                      NGN {((item.price ?? 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details Form */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Delivery Details</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 801 234 5678"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-6 rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading && <ButtonLoader size="sm" />}
                  {isLoading ? "Processing..." : "Complete Order"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Order Total */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sticky top-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mb-6">Order Total</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    NGN {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-semibold text-slate-900">TBD</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-slate-900">
                    NGN {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-600 text-center">
                  Your order will be confirmed after payment verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
