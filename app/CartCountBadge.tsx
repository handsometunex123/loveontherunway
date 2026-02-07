"use client";

import { useEffect, useMemo, useState } from "react";
import { getCart } from "@/lib/cart";

function getCount() {
  return getCart().reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export default function CartCountBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCount());

    const handleUpdate = () => setCount(getCount());
    window.addEventListener("cart:updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const display = useMemo(() => (count > 99 ? "99+" : String(count)), [count]);

  if (count <= 0) {
    return null;
  }

  return (
    <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-purple-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
      {display}
    </span>
  );
}
