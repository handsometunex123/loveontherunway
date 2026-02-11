import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { productVariantSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await db.product.findUnique({ where: { id: params.id, isDeleted: false } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!designerProfile || product.designerId !== designerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();
  const parsed = productVariantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const variant = await db.productVariant.create({
    data: {
      productId: product.id,
      size: parsed.data.size,
      color: parsed.data.color,
      measurements: parsed.data.measurements,
      stock: parsed.data.stock
    }
  });

  return NextResponse.json(variant);
}
