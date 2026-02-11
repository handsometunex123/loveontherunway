import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";

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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: "love-on-the-runway/products"
  });

  const image = await db.productImage.create({
    data: {
      productId: product.id,
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url
    }
  });

  return NextResponse.json(image);
}
