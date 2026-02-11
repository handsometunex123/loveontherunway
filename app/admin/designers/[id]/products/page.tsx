import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import AdminProductsPageClient from "@/app/admin/products/AdminProductsClient";
import { notFound } from "next/navigation";

interface DesignerProductsPageProps {
  params: { id: string };
}

export default async function DesignerProductsPage({ params }: DesignerProductsPageProps) {
  await requireRole(["SUPER_ADMIN"]);

  const designer = await db.designerProfile.findUnique({
    where: { id: params.id, isDeleted: false },
    include: { user: true }
  });

  if (!designer) {
    console.error("Designer not found for ID:", params.id);
    notFound();
  }


  // Prisma types may not have isDeleted in ProductWhereInput if client is not regenerated. Use 'as any' to bypass type error for now.
  const products = await db.product.findMany({
    where: { designerId: params.id, isDeleted: false },
    include: { designer: true, images: true, votes: true, variants: true }
  });

  // Ensure all required fields for AdminProductsPageClient

  function serializeProduct(product: any) {
    return {
      ...product,
      price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
        ? product.price.toNumber()
        : product.price,
      votesCount: product.votes ? product.votes.length : 0,
      variantsCount: product.variants ? product.variants.length : 0,
      designer: product.designer,
      images: product.images
    };
  }

  const productsWithCounts = products.map(serializeProduct);

  return (
    <AdminProductsPageClient
      products={productsWithCounts}
      isSuperAdmin
      title={`${designer.brandName} Products`}
      backUrl="/admin/designers"
      showCreate={false}
    />
  );
}
