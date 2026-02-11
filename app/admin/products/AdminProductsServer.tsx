import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import AdminProductsPageClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  const designerProfile = session.user.role === "DESIGNER"
    ? await db.designerProfile.findUnique({ where: { userId: session.user.id, isDeleted: false } })
    : null;

  const products = await db.product.findMany({
    where: {
      isDeleted: false,
      ...(session.user.role === "SUPER_ADMIN"
        ? {}
        : { designerId: designerProfile?.id ?? "" })
    },
    include: { designer: true, images: true, votes: true, variants: true },
    orderBy: { createdAt: "desc" }
  });

  const serializedProducts = products.map((product: (typeof products)[number]) => ({
    id: product.id,
    name: product.name,
    price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
      ? product.price.toNumber()
      : typeof product.price === 'number'
        ? product.price
        : parseFloat(product.price),
    isVisible: product.isVisible,
    designer: { 
      brandName: product.designer.brandName,
      brandLogo: product.designer.brandLogo 
    },
    images: product.images.map((image: (typeof product.images)[number]) => ({ url: image.url })),
    votesCount: product.votes.length,
    variantsCount: product.variants.length
  }));

  return <AdminProductsPageClient products={serializedProducts} />;
}
