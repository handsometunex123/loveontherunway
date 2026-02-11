"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import BackButton from "@/app/BackButton";
import Loader, { ButtonLoader } from "@/components/Loader";

interface Product {
  id: string;
  name: string;
  price: number;
  isVisible: boolean;
  designer: { brandName: string; brandLogo: string | null };
  images: Array<{ url: string }>;
  votesCount: number;
  variantsCount: number;
}

export default function AdminProductsPageClient({
  products: initialProducts,
  isSuperAdmin,
  currentDesignerId,
  title = "Products",
  backUrl = "/admin/dashboard",
  showCreate
}: {
  products: Product[];
  isSuperAdmin?: boolean;
  currentDesignerId?: string;
  title?: string;
  backUrl?: string;
  showCreate?: boolean;
}) {
  const { showToast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canCreate = typeof showCreate === "boolean" ? showCreate : !isSuperAdmin;

  // Removed useEffect and fetch logic to make the component reusable
  // The component now relies solely on the `products` prop passed to it

  const handleVisibilityToggle = async (productId: string, currentVisibility: boolean) => {
    setTogglingId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });

      if (response.ok) {
        setProducts(products.map(p =>
          p.id === productId ? { ...p, isVisible: !currentVisibility } : p
        ));
        showToast(
          `Product ${!currentVisibility ? "shown" : "hidden"} successfully`,
          "success"
        );
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to update product", "error");
      }
    } catch (error) {
      showToast("An error occurred while updating the product", "error");
      console.error("Failed to toggle visibility:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    const confirmed = window.confirm(`Delete "${productName}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setProducts(products => products.filter(p => p.id !== productId));
        showToast(`"${productName}" deleted successfully`, "success");
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to delete product", "error");
      }
    } catch (error) {
      showToast("An error occurred while deleting the product", "error");
      console.error("Failed to delete product:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="mb-4 md:mb-6">
          <BackButton fallbackUrl={backUrl} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {canCreate && (
            <Link href="/admin/products/create" className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800">
              + Create Product
            </Link>
          )}
        </div>
        <div className="py-12">
          <Loader size="lg" text="Loading products..." />
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 md:mb-6">
        <BackButton fallbackUrl={backUrl} />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {canCreate && (
          <Link href="/admin/products/create" className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800">
            + Create Product
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-slate-600">
          No products yet.{" "}
          {canCreate && (
            <Link href="/admin/products/create" className="text-purple-600 hover:text-purple-700 font-semibold">Create one now</Link>
          )}
        </p>
      ) : (
        <div className="grid auto-fit grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {products.map((product: Product) => (
            <div key={product.id} className="rounded-2xl bg-white border-2 border-slate-200 overflow-hidden hover:border-slate-300 transition-all">
              <div className="relative mb-0 overflow-hidden rounded-t-2xl border-b-2 border-slate-200 bg-slate-50 h-36">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    No image
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
                    product.isVisible
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {product.isVisible ? "👁️ Visible" : "🙈 Hidden"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {product.designer.brandLogo && (
                    <img
                      src={product.designer.brandLogo}
                      alt={`${product.designer.brandName} logo`}
                      className="h-5 w-5 object-cover rounded"
                    />
                  )}
                  <p className="text-slate-600 text-sm">{product.designer.brandName}</p>
                </div>
                <p className="text-xs text-slate-500 mb-4">{product.variantsCount} variants • {product.votesCount} votes</p>
                <div className="space-y-2">
                  <Link href={`/products/${product.id}`} className="block text-center rounded-lg bg-slate-100 text-slate-900 px-3 py-2 font-semibold text-sm hover:bg-slate-200 transition-all">
                    View Details
                  </Link>
                  {!isSuperAdmin && (
                    <>
                      <Link href={`/admin/products/${product.id}/edit`} prefetch={false} className="block text-center rounded-lg bg-slate-100 text-slate-900 px-3 py-2 font-semibold text-sm hover:bg-slate-200 transition-all">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleVisibilityToggle(product.id, product.isVisible)}
                        disabled={togglingId === product.id}
                        className={`w-full rounded-lg px-3 py-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          product.isVisible
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        }`}
                      >
                        {togglingId === product.id && (
                          <ButtonLoader 
                            size="sm" 
                            color={product.isVisible ? "rose" : "emerald"} 
                          />
                        )}
                        {togglingId === product.id ? "Updating..." : (product.isVisible ? "Hide Product" : "Show Product")}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                        className="w-full rounded-lg bg-rose-600 px-3 py-2 font-semibold text-sm text-white transition-all hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {deletingId === product.id && <ButtonLoader size="sm" />}
                        {deletingId === product.id ? "Deleting..." : "Delete Product"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
