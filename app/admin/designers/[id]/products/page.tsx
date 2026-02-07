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
    where: { id: params.id },
    include: { user: true }
  });

  if (!designer) {
    notFound();
  }

  const products = await db.product.findMany({
    where: { designerId: designer.id },
    include: { designer: true, images: true, votes: true, variants: true }
  });

  const productsWithCounts = products.map((product: typeof products[number]) => ({
    ...product,
    price: Number(product.price),
    votesCount: product.votes.length,
    variantsCount: product.variants.length
  }));

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
