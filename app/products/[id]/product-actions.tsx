"use client";

import { useMemo, useState } from "react";
import { addToCart } from "@/lib/cart";
import Select from "@/app/components/Select";

type Variant = {
  id: string;
  size: string;
  color: string;
  measurements: Record<string, string | number>;
};

type ProductInfo = {
  id: string;
  name: string;
  price: number;
  designerName: string;
  designerLogo?: string;
  imageUrl?: string;
  variants: Variant[];
};

export default function ProductActions({ product }: { product: ProductInfo }) {
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size ?? "");
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  // Get unique sizes and colors
  const availableSizes = useMemo(
    () => Array.from(new Set(product.variants.map(v => v.size))),
    [product.variants]
  );

  const availableColors = useMemo(
    () => Array.from(new Set(product.variants.map(v => v.color))),
    [product.variants]
  );

  // Get colors available for selected size
  const colorsForSize = useMemo(
    () => product.variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color),
    [product.variants, selectedSize]
  );

  // Get sizes available for selected color
  const sizesForColor = useMemo(
    () => product.variants
      .filter(v => v.color === selectedColor)
      .map(v => v.size),
    [product.variants, selectedColor]
  );

  // Find the matching variant
  const selectedVariant = useMemo(
    () => product.variants.find(
      (variant) => variant.size === selectedSize && variant.color === selectedColor
    ),
    [product.variants, selectedSize, selectedColor]
  );

  const handleAddToCart = () => {
    if (!selectedVariant) {
      setMessage("Please select a valid size and color combination.");
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      name: product.name,
      price: product.price,
      designerName: product.designerName,
      designerLogo: product.designerLogo,
      imageUrl: product.imageUrl,
      size: selectedVariant.size,
      color: selectedVariant.color
    });

    setMessage("Added to cart.");
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="rounded-2xl bg-white">
      <h3 className="text-xl font-bold mb-2 text-slate-900">Add to cart</h3>
      <p className="text-2xl font-bold text-purple-600 mb-4">NGN {product.price.toFixed(2)}</p>
      {product.variants.length > 0 ? (
        <div className="space-y-4 mb-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-900">Size</span>
            <Select
              value={selectedSize}
              onChange={(value) => {
                setSelectedSize(value);
                // Auto-select first available color for this size if current color is not available
                if (!colorsForSize.includes(selectedColor)) {
                  const firstAvailableColor = product.variants.find(v => v.size === value)?.color;
                  if (firstAvailableColor) setSelectedColor(firstAvailableColor);
                }
              }}
              options={availableSizes.map((size) => ({ label: size, value: size }))}
              placeholder="Select a size"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-900">Color</span>
            <Select
              value={selectedColor}
              onChange={(value) => {
                setSelectedColor(value);
                // Auto-select first available size for this color if current size is not available
                if (!sizesForColor.includes(selectedSize)) {
                  const firstAvailableSize = product.variants.find(v => v.color === value)?.size;
                  if (firstAvailableSize) setSelectedSize(firstAvailableSize);
                }
              }}
              options={availableColors.map((color) => ({ label: color, value: color }))}
              placeholder="Select a color"
            />
          </label>

          {!selectedVariant && (
            <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              This size and color combination is not available
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-600 mb-4">No variants available.</p>
      )}

      {selectedVariant ? (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.3-1.54c-.3-.36-.77-.36-1.07 0-.3.36-.3.95 0 1.31l1.84 2.19c.3.36.77.36 1.07 0l3.29-4.04c.3-.36.3-.95 0-1.31-.3-.36-.77-.36-1.07 0z" />
            </svg>
            <p className="font-bold text-sm text-slate-900">Measurements</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(selectedVariant.measurements).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg p-3 border border-purple-100/50">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">{key}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 mb-4">
        <span className="text-sm font-semibold text-slate-900">Quantity</span>
        <div className="flex items-center gap-2 w-fit rounded-lg border border-slate-300">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-slate-700 hover:text-slate-900 font-semibold"
          >
            −
          </button>
          <span className="w-8 text-center text-slate-900 font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-slate-700 hover:text-slate-900 font-semibold"
          >
            +
          </button>
        </div>
      </div>

      <button 
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
        type="button" 
        onClick={handleAddToCart}
        disabled={!selectedVariant}
      >
        Add to cart
      </button>
      {message ? <p className={`mt-3 text-sm ${message.includes('Added') ? 'text-green-600' : 'text-amber-600'}`}>{message}</p> : null}
    </div>
  );
}
