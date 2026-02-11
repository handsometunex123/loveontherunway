import { db } from "@/lib/db";
import { requireSession } from "@/lib/authorization";
import AdminProductsPageClient from "./AdminProductsClient";
import { redirect } from "next/navigation";

// Disable caching to always fetch fresh product data
export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const session = await requireSession();

  if (session.user.role === "SUPER_ADMIN") {
    redirect("/admin/designers");
  }

  if (session.user.role !== "DESIGNER") {
    redirect("/");
  }

  const designerProfile = await db.designerProfile.findUnique({ where: { userId: session.user.id } });

  const products = await db.product.findMany({
    where: { designerId: designerProfile?.id ?? "" },
    include: { designer: true, images: true, votes: true, variants: true }
  });

  const productsWithCounts = products.map((product: typeof products[number]) => ({
    ...product,
    price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
      ? product.price.toNumber()
      : typeof product.price === 'number'
        ? product.price
        : parseFloat(product.price),
    votesCount: product.votes.length,
    variantsCount: product.variants.length
  }));

  return <AdminProductsPageClient products={productsWithCounts} isSuperAdmin={false} currentDesignerId={designerProfile?.id} />;
}
