import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let products;

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!designerProfile) {
      return NextResponse.json({ error: "Designer profile not found" }, { status: 404 });
    }

    products = await db.product.findMany({
      where: { designerId: designerProfile.id },
      include: { designer: true, images: true, votes: true, variants: true },
      orderBy: { createdAt: 'desc' }
    });
  } else if (session.user.role === "SUPER_ADMIN") {
    products = await db.product.findMany({
      include: { designer: true, images: true, votes: true, variants: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  const productsWithCounts = products?.map((product: any) => ({
    ...product,
    price: Number(product.price),
    votesCount: product.votes.length,
    variantsCount: product.variants.length
  }));

  return NextResponse.json(productsWithCounts || []);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "CUSTOMER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string) || "FEMALE";
  const isVisibleStr = formData.get("isVisible") as string;
  const isVisible = isVisibleStr ? isVisibleStr === "true" : false;
  const variantsJson = formData.get("variants") as string;
  const imagesJson = formData.get("images") as string;

  // Validation
  if (!name?.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  if (!price || isNaN(price) || price <= 0) {
    return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
  }

  // Parse and validate images
  let images: { publicId: string; url: string }[] = [];
  try {
    images = JSON.parse(imagesJson || "[]");
  } catch {
    return NextResponse.json({ error: "Invalid images format" }, { status: 400 });
  }

  let variants = [];
  try {
    variants = JSON.parse(variantsJson || "[]");
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: "At least one variant is required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid variants format" }, { status: 400 });
  }

  // Validate each variant
  for (const variant of variants) {
    if (!variant.size || !variant.color) {
      return NextResponse.json({ error: "All variants must have size and color" }, { status: 400 });
    }
  }

  let resolvedDesignerId = formData.get("designerId") as string;

  if (session.user.role === "DESIGNER") {
    const designerProfile = await db.designerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!designerProfile) {
      return NextResponse.json({ error: "Designer profile not found" }, { status: 404 });
    }

    resolvedDesignerId = designerProfile.id;
  }

  if (!resolvedDesignerId) {
    return NextResponse.json({ error: "Designer id is required" }, { status: 400 });
  }

  try {
    const product = await db.product.create({
      data: {
        name,
        description: description || null,
        price,
        category: category as "MALE" | "FEMALE",
        isVisible,
        designerId: resolvedDesignerId,
        images: {
          create: images.map((img) => ({
            publicId: img.publicId || `product-${Date.now()}`,
            url: img.url
          }))
        },
        variants: {
          create: variants.map((v: any) => ({
            size: v.size,
            color: v.color,
            measurements: v.measurements || {},
            stock: v.stock || null
          }))
        }
      },
      include: {
        images: true,
        variants: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
