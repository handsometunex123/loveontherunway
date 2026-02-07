import { db } from "@/lib/db";
import ProductActions from "./product-actions";
import ImageCarousel from "./ImageCarousel";
import BackButton from "@/app/BackButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const session = await getServerSession(authOptions);
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      variants: true,
      votes: true,
      designer: { include: { user: true } }
    }
  });

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  let canManage = false;

  if (session?.user?.role === "DESIGNER" && product) {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });
    canManage = !!designerProfile && designerProfile.id === product.designerId;
  }

  if (!product) {
    return <p>Product not available.</p>;
  }

  // Super admins can view any product
  if (!isSuperAdmin) {
    // Regular users can't see hidden products unless they manage it
    if (!product.isVisible && !canManage) {
      return <p>Product not available.</p>;
    }
    // Regular users can't see products from unapproved or hidden designers
    if (!product.designer.isApproved || !product.designer.isVisible) {
      return <p>Product not available.</p>;
    }
  }

  const heroImage = product.images[0]?.url;
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price.toString());

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="mb-2 md:mb-4">
        <BackButton fallbackUrl="/" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Love on the runway
        </span>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            {product.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-500">By <span className="font-semibold text-slate-800">{product.designer.brandName}</span></p>
          <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            {product.category === "MALE" ? "👔 Men's Collection" : "👗 Women's Collection"}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white/80 p-4 md:p-6 shadow-lg">
            <ImageCarousel images={product.images} productName={product.name} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Available Sizes</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v: any) => v.size))).map((size: any) => (
                  <span key={size} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {size}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Available Colors</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(product.variants.map((v: any) => v.color))).map((color: any) => (
                  <span key={color} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">About this piece</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {product.description ?? "This signature piece was crafted for a timeless runway moment."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border-slate-100 bg-white p-5 md:p-6 shadow-lg">
            <ProductActions
              product={{
                id: product.id,
                name: product.name,
                price: price,
                designerName: product.designer.brandName,
                imageUrl: heroImage,
                variants: product.variants.map((variant: any) => ({
                  id: variant.id,
                  size: variant.size,
                  color: variant.color,
                  measurements: variant.measurements as Record<string, string | number>
                }))
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
