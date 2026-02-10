import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import GalleryManager from "./GalleryManager";

export default async function AdminGalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const images = await db.galleryImage.findMany({
    orderBy: [{ eventName: "desc" }, { order: "asc" }]
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Event Gallery Management</h1>
        <p className="text-slate-600">Upload and manage images from past events</p>
      </div>
      
      <GalleryManager initialImages={images} />
    </div>
  );
}
