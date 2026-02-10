"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [itemName, setItemName] = useState<string>("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleCartUpdate = () => {
      // Get the last item added from localStorage
      const cart = localStorage.getItem("loveOnTheRunway:cart");
      if (cart) {
        try {
          const items = JSON.parse(cart);
          if (items.length > 0) {
            const lastItem = items[items.length - 1];
            setItemName(lastItem.name || "Item");
            setCartCount(items.length);
            setIsVisible(true);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setIsVisible(false);
            }, 5000);
          }
        } catch (e) {
          console.error("Failed to parse cart:", e);
        }
      }
    };

    // Listen for cart updates
    window.addEventListener("cart:updated", handleCartUpdate);
    return () => window.removeEventListener("cart:updated", handleCartUpdate);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 md:hidden z-50 animate-in slide-in-from-left-4 duration-300">
      <Link href="/cart" className="block">
        <div className="bg-white border-2 border-purple-600 text-slate-900 rounded-2xl shadow-2xl p-4 max-w-sm cursor-pointer hover:shadow-xl hover:border-purple-700 hover:scale-105 transition-all active:scale-95">
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.16.12-.33.12-.5 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">Added to cart!</p>
              <p className="text-xs text-slate-600 line-clamp-1 mb-1">{itemName}</p>
              <p className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                View cart
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </div>

            {/* Badge */}
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
              {cartCount}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
