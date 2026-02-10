import { Metadata } from "next";
import { db } from "@/lib/db";
import GalleryClient from "./GalleryClient";
import BackButton from "../BackButton";

export const metadata: Metadata = {
  title: "Event Gallery | Love On The Runway",
  description: "Relive the spectacular moments from Love On The Runway 2025. Browse our stunning collection of runway shows, designer showcases, and unforgettable behind-the-scenes moments from last year's glorious event."
};

export default async function GalleryPage() {
  let groupedImages: Record<string, any> = {};

  try {
    const images = await db.galleryImage.findMany({
      where: { isVisible: true },
      orderBy: [{ eventName: "desc" }, { order: "asc" }]
    });

    // Group images by event name
    groupedImages = images.reduce((acc: any, image: any) => {
      if (!acc[image.eventName]) {
        acc[image.eventName] = [];
      }
      acc[image.eventName].push(image);
      return acc;
    }, {} as Record<string, typeof images>);
  } catch (error) {
    // Gracefully handle database errors during build time
    console.warn("Gallery: Unable to fetch images from database", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
        <div className="mb-6">
          <BackButton label="Back" fallbackUrl="/" />
        </div>
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-4 text-slate-900 tracking-tight">
            Love On The Runway 2025
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            Relive the extraordinary fashion showcase. Browse breathtaking runway moments and unforgettable memories from last year's celebrated event.
          </p>
        </div>

        {Object.keys(groupedImages).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">Gallery images from the 2025 event will be available soon</p>
          </div>
        ) : (
          <GalleryClient groupedImages={groupedImages} />
        )}
      </div>
    </div>
  );
}
