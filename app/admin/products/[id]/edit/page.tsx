import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import ProductForm from "../../create/ProductForm";
import BackButton from "@/app/BackButton";

// Disable caching to always fetch fresh product data
export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: { images: true, variants: true }
  });

  if (!product) {
    return <p>Product not found.</p>;
  }

  let designerProfile = null;
  if (session.user.role === "DESIGNER") {
    designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!designerProfile || product.designerId !== designerProfile.id) {
      return <p>Forbidden.</p>;
    }
  }

  const initialProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: typeof product.price === "number" ? product.price : parseFloat(product.price.toString()),
    category: product.category as "MALE" | "FEMALE",
    isVisible: product.isVisible,
    images: product.images.map((img: any) => ({
      url: img.url
    })),
    variants: product.variants.map((variant: any) => ({
      size: variant.size,
      color: variant.color,
      measurements: variant.measurements as Record<string, string>,
      stock: variant.stock
    }))
  };

  return (
    <section className="px-2">
      <div className="mb-4 md:mb-6 flex items-center justify-between">
        <BackButton fallbackUrl="/admin/products" />
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Edit Product</h2>
        <div className="w-[72px]"></div> {/* Spacer for centering */}
      </div>
      <div className="mx-auto rounded-2xl bg-white p-6">
        <ProductForm 
          key={`product-form-${product.id}-${product.isVisible}-${product.updatedAt}`}
          designerProfile={designerProfile} 
          initialProduct={initialProduct} 
          mode="edit" 
        />
      </div>
    </section>
  );
}
