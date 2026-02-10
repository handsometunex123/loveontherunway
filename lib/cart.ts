"use client";

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  name?: string;
  price?: number;
  designerName?: string;
  designerLogo?: string;
  imageUrl?: string;
  size?: string;
  color?: string;
};

const STORAGE_KEY = "loveOnTheRunway:cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(
    (entry) => entry.productId === item.productId && entry.variantId === item.variantId
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }

  setCart(cart);
}

export function removeFromCart(productId: string, variantId?: string) {
  const cart = getCart().filter(
    (item) => !(item.productId === productId && item.variantId === variantId)
  );
  setCart(cart);
  return cart;
}

export function updateQuantity(productId: string, variantId: string | undefined, quantity: number) {
  const cart = getCart();
  const target = cart.find(
    (item) => item.productId === productId && item.variantId === variantId
  );

  if (target) {
    target.quantity = Math.max(1, quantity);
  }

  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}
