"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartItem, clearCart, getCart, removeFromCart, updateQuantity } from "@/lib/cart";
import BackButton from "../BackButton";

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const handleRemove = (item: CartItem) => {
    const updated = removeFromCart(item.productId, item.variantId);
    setItems(updated);
  };

  const handleQuantity = (item: CartItem, quantity: number) => {
    const updated = updateQuantity(item.productId, item.variantId, quantity);
    setItems(updated);
  };

  const handleClearCart = () => {
    clearCart();
    setItems([]);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <section className="px-4 md:px-6 md:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <BackButton fallbackUrl="/" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Your Cart</h1>
          <p className="text-slate-600 mt-2">Your cart is empty.</p>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800">
            Browse outfits →
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="mb-4">
          <BackButton fallbackUrl="/" />
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Cart</h1>
            <p className="text-sm text-slate-600">Review your selections before checkout.</p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId ?? "default"}`} className="group rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <Link href={`/products/${item.productId}`} className="flex flex-1 gap-5">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name ?? "Product"} className="h-24 w-24 rounded-2xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-24 w-24 rounded-2xl bg-slate-100" />
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700">{item.name ?? "Product"}</h3>
                    <p className="text-sm text-slate-600">{item.designerName ?? "Designer"}</p>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-700">
                      {item.price && <span className="font-semibold text-purple-600">NGN {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>}
                      {item.size && <span>Size: <span className="font-semibold">{item.size}</span></span>}
                      {item.color && <span>Color: <span className="font-semibold">{item.color}</span></span>}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2">
                    <button
                      type="button"
                      onClick={() => handleQuantity(item, item.quantity - 1)}
                      className="px-3 py-1 text-slate-700 hover:text-slate-900 font-semibold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-slate-900 font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantity(item, item.quantity + 1)}
                      className="px-3 py-1 text-slate-700 hover:text-slate-900 font-semibold"
                    >
                      +
                    </button>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-semibold" type="button" onClick={() => handleRemove(item)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-slate-500">Subtotal</p>
            <p className="text-xl font-bold text-slate-900">NGN {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClearCart}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-1 0v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z" />
              </svg>
              Clear cart
            </button>
            <Link className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 transition-colors" href="/">
              Continue shopping
            </Link>
            <Link className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors" href="/checkout">
              Proceed to checkout →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
