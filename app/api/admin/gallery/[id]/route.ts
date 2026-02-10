import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const image = await db.galleryImage.findUnique({
      where: { id: params.id }
    });

    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from database
    await db.galleryImage.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete image" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isVisible, title, eventName, order } = body;

    const updated = await db.galleryImage.update({
      where: { id: params.id },
      data: {
        ...(typeof isVisible === "boolean" && { isVisible }),
        ...(title && { title }),
        ...(eventName && { eventName }),
        ...(typeof order === "number" && { order })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gallery update error:", error);
    return NextResponse.json(
      { message: "Failed to update image" },
      { status: 500 }
    );
  }
}
