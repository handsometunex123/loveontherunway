import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await db.product.findUnique({
    where: { id: params.id, isDeleted: false },
    include: { images: true, variants: true }
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check permissions for designers
  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id, isDeleted: false }
    });

    if (!designerProfile || product.designerId !== designerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json({
    ...product,
    price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
      ? product.price.toNumber()
      : product.price
  });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.product.findUnique({
    where: { id: params.id, isDeleted: false }
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id, isDeleted: false }
    });

    if (!designerProfile || existing.designerId !== designerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = (formData.get("category") as string) || existing.category;
    const isVisibleStr = formData.get("isVisible") as string;
    const isVisible = isVisibleStr !== undefined ? isVisibleStr === "true" : existing.isVisible;
    const variantsJson = formData.get("variants") as string;
    const imagesJson = formData.get("images") as string;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    if (!price || isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }

    // Parse images from JSON
    let images: { publicId: string; url: string }[] = [];
    try {
      images = JSON.parse(imagesJson || "[]");
    } catch {
      // If parsing fails, treat as no new images
      images = [];
    }

    let variants: any[] = [];
    try {
      variants = JSON.parse(variantsJson || "[]");
      if (!Array.isArray(variants) || variants.length === 0) {
        return NextResponse.json({ error: "At least one variant is required" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid variants format" }, { status: 400 });
    }

    for (const variant of variants) {
      if (!variant.size || !variant.color) {
        return NextResponse.json({ error: "All variants must have size and color" }, { status: 400 });
      }
    }

    const product = await db.$transaction(async (tx: any) => {
      const updated = await tx.product.update({
        where: { id: params.id },
        data: {
          name,
          description: description || null,
          price,
          category: category as "MALE" | "FEMALE",
          isVisible
        }
      });

      await tx.productVariant.deleteMany({ where: { productId: params.id } });
      await tx.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: params.id,
          size: v.size,
          color: v.color,
          measurements: v.measurements || {},
          stock: v.stock || null
        }))
      });

      // Update images if provided
      if (images.length > 0) {
        await tx.productImage.deleteMany({ where: { productId: params.id } });
        await tx.productImage.createMany({
          data: images.map((img) => ({
            productId: params.id,
            publicId: img.publicId || `product-${Date.now()}`,
            url: img.url
          }))
        });
      }

      return updated;
    });

    revalidatePath("/admin/products");
    return NextResponse.json(product);
  }

  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await db.product.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category as "MALE" | "FEMALE" | undefined,
      isVisible: parsed.data.isVisible
    }
  });

  revalidatePath("/admin/products");
  return NextResponse.json(product);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.product.findUnique({ where: { id: params.id, isDeleted: false } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id, isDeleted: false }
    });

    if (!designerProfile || existing.designerId !== designerProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await db.product.update({ where: { id: params.id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
