import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";

// Match the create product upload flow
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_FILES = 12; // Allow more for gallery uploads
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const eventName = (formData.get("eventName") as string) || "Past Event";
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} images allowed per upload` },
        { status: 400 }
      );
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, WebP, GIF` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds maximum size of 5MB` },
          { status: 400 }
        );
      }
    }

    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${base64}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "love-on-the-runway/gallery",
          transformation: [
            { width: 1600, height: 2000, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        });

        const title = file.name.replace(/\.[^/.]+$/, "");

        const galleryImage = await db.galleryImage.create({
          data: {
            publicId: uploadResult.public_id,
            url: uploadResult.secure_url,
            eventName,
            title,
            order: index
          }
        });

        return galleryImage;
      })
    );

    return NextResponse.json({
      success: true,
      images: uploadResults,
      uploaded: uploadResults.length
    });
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const images = await db.galleryImage.findMany({
      where: { isVisible: true },
      orderBy: [{ eventName: "desc" }, { order: "asc" }]
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
