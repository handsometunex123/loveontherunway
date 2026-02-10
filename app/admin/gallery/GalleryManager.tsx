"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import imageCompression from "browser-image-compression";
import type { GalleryImage } from "@prisma/client";

type Props = {
  initialImages: GalleryImage[];
};

type FilePreview = {
  file: File;
  preview: string;
  id: string;
};

export default function GalleryManager({ initialImages }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [eventName, setEventName] = useState("Love On The Runway 2026");
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const previews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      setFilePreviews((prev) => [...prev, ...previews]);
    }
    // Reset the input
    e.target.value = "";
  };

  const handleRemoveFile = (id: string) => {
    setFilePreviews((prev) => {
      const fileToRemove = prev.find((fp) => fp.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((fp) => fp.id !== id);
    });
  };

  const handleUpload = async () => {
    if (filePreviews.length === 0) {
      showToast("Please select images to upload", "warning");
      return;
    }

    if (!eventName.trim()) {
      showToast("Please enter an event name", "warning");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("eventName", eventName);

      // Compress images before upload
      const compressionOptions = {
        maxSizeMB: 4.5, // Target 4.5MB to stay safely under 5MB limit
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/jpeg" as const
      };

      showToast("Compressing images...", "info", 2000);

      for (const fp of filePreviews) {
        try {
          let fileToUpload = fp.file;
          
          // Only compress if file is larger than 4.5MB
          if (fp.file.size > 4.5 * 1024 * 1024) {
            const compressedFile = await imageCompression(fp.file, compressionOptions);
            fileToUpload = new File([compressedFile], fp.file.name, {
              type: compressedFile.type
            });
            console.log(`Compressed ${fp.file.name}: ${(fp.file.size / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
          }
          
          formData.append("files", fileToUpload);
        } catch (compressionError) {
          console.error(`Failed to compress ${fp.file.name}:`, compressionError);
          showToast(`Failed to compress ${fp.file.name}. Please try a smaller image.`, "error");
          throw compressionError;
        }
      }

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData
      });

      const contentType = res.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");

      if (!res.ok) {
        const errorBody = isJson ? await res.json() : await res.text();
        const message =
          typeof errorBody === "string"
            ? errorBody.includes("<!DOCTYPE")
              ? "Upload failed. Please ensure you are signed in as a Super Admin."
              : errorBody
            : errorBody.message || "Upload failed";
        throw new Error(message);
      }

      const data = isJson ? await res.json() : null;
      const uploadedCount = data?.uploaded ?? filePreviews.length;
      showToast(`Successfully uploaded ${uploadedCount} images!`, "success");
      
      // Clean up previews
      filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
      setFilePreviews([]);
      
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      showToast(error instanceof Error ? error.message : "Failed to upload images", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        const errorBody = isJson ? await res.json() : await res.text();
        const message =
          typeof errorBody === "string"
            ? errorBody.includes("<!DOCTYPE")
              ? "Delete failed. Please ensure you are signed in as a Super Admin."
              : errorBody
            : errorBody.message || "Failed to delete";
        throw new Error(message);
      }

      showToast("Image deleted successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      showToast(error instanceof Error ? error.message : "Failed to delete image", "error");
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisibility })
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") ?? "";
        const isJson = contentType.includes("application/json");
        const errorBody = isJson ? await res.json() : await res.text();
        const message =
          typeof errorBody === "string"
            ? errorBody.includes("<!DOCTYPE")
              ? "Update failed. Please ensure you are signed in as a Super Admin."
              : errorBody
            : errorBody.message || "Failed to update";
        throw new Error(message);
      }

      showToast("Visibility updated successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      showToast(error instanceof Error ? error.message : "Failed to update visibility", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Upload New Images</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Love On The Runway 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Select Images (Multiple)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {filePreviews.length > 0 && (
              <p className="mt-2 text-sm text-slate-600">
                {filePreviews.length} file(s) selected
              </p>
            )}
          </div>

          {/* File Previews */}
          {filePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filePreviews.map((fp) => (
                <div
                  key={fp.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-300 hover:border-purple-400 transition-all"
                >
                  <img
                    src={fp.preview}
                    alt={fp.file.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(fp.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                    {fp.file.name}
                  </div>
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold ${
                    fp.file.size > 4.5 * 1024 * 1024
                      ? "bg-orange-500 text-white"
                      : "bg-slate-900/70 text-white"
                  }`}>
                    {(fp.file.size / 1024 / 1024).toFixed(2)}MB
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={uploading || filePreviews.length === 0}
              className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : `Upload ${filePreviews.length} Image(s)`}
            </button>
            {filePreviews.length > 0 && !uploading && (
              <button
                onClick={() => {
                  filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
                  setFilePreviews([]);
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Existing Images */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <h2 className="text-xl font-bold mb-4">
          Gallery Images ({initialImages.length})
        </h2>

        {initialImages.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialImages.map((image) => (
              <div
                key={image.id}
                className="group relative rounded-xl overflow-hidden border border-slate-300 hover:border-purple-400 transition-all"
              >
                <img
                  src={image.url}
                  alt={image.title || "Gallery image"}
                  className="w-full h-64 object-cover"
                />
                <div className="p-4 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
                  <p className="text-white font-semibold text-sm">
                    {image.eventName}
                  </p>
                  {image.title && (
                    <p className="text-white/80 text-xs">{image.title}</p>
                  )}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(image.id, image.isVisible)}
                    className={`opacity-0 group-hover:opacity-100 transition-all px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 ${
                      image.isVisible
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-slate-500 hover:bg-slate-600 text-white"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      {image.isVisible ? (
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      ) : null}
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {image.isVisible ? "Visible" : "Hidden"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
