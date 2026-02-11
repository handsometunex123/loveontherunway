"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import Select from "@/app/components/Select";
import Loader, { ButtonLoader } from "@/components/Loader";
import imageCompression from "browser-image-compression";

// Image upload constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_IMAGES = 6; // Maximum 6 images
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type UploadedImage = {
  publicId: string;
  url: string;
  isNew?: boolean;
};

type Variant = {
  size: string;
  color: string;
  measurements: Record<string, string>;
  measurementsText?: string;
  stock?: number;
};

type InitialProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category: ProductCategory;
  isVisible?: boolean;
  images: { url: string }[];
  variants: {
    size: string;
    color: string;
    measurements: Record<string, string>;
    stock?: number | null;
  }[];
};

type ProductCategory = "MALE" | "FEMALE";

const MALE_SIZES = ["S", "M", "L", "XL", "XXL"];
const FEMALE_SIZES = ["8", "10", "12", "14", "16", "18", "20", "22"];
const FEMALE_MEASUREMENTS_TEMPLATE = '{"bust": "36in", "waist": "28in", "hip": "60in", "inseam": "30in"}';
const MALE_MEASUREMENTS_TEMPLATE = '{"chest": "42", "neck": "17", "shoulder": "19", "round sleeve": "16", "sleeve length": "9", "shirt length": "31"}';

const getMeasurementsTemplate = (category: ProductCategory) =>
  category === "MALE" ? MALE_MEASUREMENTS_TEMPLATE : FEMALE_MEASUREMENTS_TEMPLATE;

export default function ProductForm({
  designerProfile,
  initialProduct,
  mode = "create"
}: {
  designerProfile: any;
  initialProduct?: InitialProduct | null;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = mode === "edit" && !!initialProduct?.id;
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [price, setPrice] = useState(initialProduct?.price ? String(initialProduct.price) : "");
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category ?? "FEMALE");
  const [isVisible, setIsVisible] = useState(initialProduct?.isVisible ?? false);
  
  // Image state - now stores uploaded Cloudinary images
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    initialProduct?.images?.map((img) => ({ publicId: "", url: img.url, isNew: false })) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  
  const [variants, setVariants] = useState<Variant[]>(
    initialProduct?.variants?.length
      ? initialProduct.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          measurements: variant.measurements ?? {},
          measurementsText: JSON.stringify(variant.measurements ?? {}),
          stock: variant.stock ?? 0
        }))
      : [
          {
            size: "",
            color: "",
            measurements: JSON.parse(getMeasurementsTemplate("FEMALE")),
            measurementsText: getMeasurementsTemplate("FEMALE"),
            stock: 1
          }
        ]
  );
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  const availableSizes = category === "MALE" ? MALE_SIZES : FEMALE_SIZES;

  // Fetch fresh product data on mount when in edit mode
  useEffect(() => {
    const fetchFreshProduct = async () => {
      if (!isEdit || !initialProduct?.id) return;
      
      setFetchingProduct(true);
      try {
        const response = await fetch(`/api/admin/products/${initialProduct.id}`, {
          cache: "no-store"
        });
        
        if (response.ok) {
          const freshProduct = await response.json();
          
          // Update all form fields with fresh data
          setName(freshProduct.name ?? "");
          setDescription(freshProduct.description ?? "");
          setPrice(freshProduct.price ? String(freshProduct.price) : "");
          setCategory(freshProduct.category ?? "FEMALE");
          setIsVisible(freshProduct.isVisible ?? false);
          setUploadedImages(
            freshProduct.images?.map((img: any) => ({ 
              publicId: img.publicId || "", 
              url: img.url, 
              isNew: false 
            })) ?? []
          );
          setVariants(
            freshProduct.variants?.length
              ? freshProduct.variants.map((variant: any) => ({
                  size: variant.size,
                  color: variant.color,
                  measurements: variant.measurements ?? {},
                  measurementsText: JSON.stringify(variant.measurements ?? {}),
                  stock: variant.stock ?? 0
                }))
              : [
                  {
                    size: "",
                    color: "",
                    measurements: JSON.parse(getMeasurementsTemplate(freshProduct.category ?? "FEMALE")),
                    measurementsText: getMeasurementsTemplate(freshProduct.category ?? "FEMALE"),
                    stock: 1
                  }
                ]
          );
        }
      } catch (error) {
        console.error("Failed to fetch fresh product data:", error);
        // Fall back to initialProduct if fetch fails
      } finally {
        setFetchingProduct(false);
      }
    };

    fetchFreshProduct();
  }, [isEdit, initialProduct?.id]);

  // Sync form state when initialProduct changes (e.g., after navigation or data refresh)
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name ?? "");
      setDescription(initialProduct.description ?? "");
      setPrice(initialProduct.price ? String(initialProduct.price) : "");
      setCategory(initialProduct.category ?? "FEMALE");
      setIsVisible(initialProduct.isVisible ?? false);
      setUploadedImages(
        initialProduct.images?.map((img) => ({ publicId: "", url: img.url, isNew: false })) ?? []
      );
      setVariants(
        initialProduct.variants?.length
          ? initialProduct.variants.map((variant) => ({
              size: variant.size,
              color: variant.color,
              measurements: variant.measurements ?? {},
              measurementsText: JSON.stringify(variant.measurements ?? {}),
              stock: variant.stock ?? 0
            }))
          : [
              {
                size: "",
                color: "",
                measurements: JSON.parse(getMeasurementsTemplate(initialProduct.category ?? "FEMALE")),
                measurementsText: getMeasurementsTemplate(initialProduct.category ?? "FEMALE"),
                stock: 1
              }
            ]
      );
    }
  }, [initialProduct]);

  const formatPrice = (value: string) => {
    // If empty, return empty string
    if (!value) return "";
    
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "");
    
    // If cleaned is empty, return empty string
    if (!cleaned) return "";
    
    // Ensure only one decimal point
    const parts = cleaned.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";
    
    // Format integer part with thousands separator
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Combine and return
    return decimalPart ? `${formatted}.${decimalPart}` : formatted;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setPrice(formatted);
  };

  const handleCategoryChange = (newCategory: ProductCategory) => {
    const template = getMeasurementsTemplate(newCategory);
    setCategory(newCategory);
    // Clear variant sizes when changing category and reset measurement template
    setVariants(
      variants.map(v => ({
        ...v,
        size: "",
        measurementsText: template,
        measurements: JSON.parse(template)
      }))
    );
  };

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];
    const currentCount = uploadedImages.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (files.length > remainingSlots) {
      errors.push(`You can only add ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}. Maximum ${MAX_IMAGES} images allowed.`);
      files = files.slice(0, remainingSlots);
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" has invalid type. Allowed: JPEG, PNG, WebP, GIF`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds 5MB limit`);
        continue;
      }

      valid.push(file);
    }

    return { valid, errors };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const { valid, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      errors.forEach(error => showToast(error, "error"));
    }

    if (valid.length === 0) {
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress("Compressing images...");

    try {
      const compressionOptions = {
        maxSizeMB: 4.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true
      };

      const compressedFiles: File[] = [];

      for (const file of valid) {
        try {
          const compressed = await imageCompression(file, compressionOptions);
          const compressedFile = new File([compressed], file.name, { type: compressed.type });
          compressedFiles.push(compressedFile);
        } catch (compressionError) {
          console.error(`Failed to compress ${file.name}:`, compressionError);
          showToast(`Failed to compress ${file.name}. Please try a smaller image.`, "error");
          throw compressionError;
        }
      }

      setUploadProgress(`Uploading ${compressedFiles.length} image${compressedFiles.length !== 1 ? 's' : ''}...`);

      const formData = new FormData();
      compressedFiles.forEach(file => formData.append("files", file));

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to upload images", "error");
        return;
      }

      const data = await response.json();
      
      // Add uploaded images to state
      const newImages: UploadedImage[] = data.images.map((img: any) => ({
        publicId: img.publicId,
        url: img.url,
        isNew: true
      }));

      setUploadedImages(prev => [...prev, ...newImages]);
      showToast(`Successfully uploaded ${data.count} image${data.count !== 1 ? 's' : ''}`, "success");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Failed to upload images. Please try again.", "error");
    } finally {
      setUploading(false);
      setUploadProgress("");
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field === "measurements") {
      updated[index].measurements = value;
      updated[index].measurementsText = JSON.stringify(value);
    } else if (field === "measurementsText") {
      updated[index].measurementsText = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setVariants(updated);
  };

  const addVariant = () => {
    const template = getMeasurementsTemplate(category);
    setVariants([
      ...variants,
      {
        size: "",
        color: "",
        measurements: JSON.parse(template),
        measurementsText: template,
        stock: 1
      }
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        showToast("Product name is required", "error");
        setLoading(false);
        return;
      }

      if (!price || parseFloat(price.replace(/,/g, "")) <= 0) {
        showToast("Valid price is required", "error");
        setLoading(false);
        return;
      }

      if (variants.some(v => !v.size || !v.color)) {
        showToast("All variants must have a size and color", "error");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price.replace(/,/g, ""));
      formData.append("category", category);
      formData.append("isVisible", String(isVisible));
      formData.append("designerId", designerProfile?.id);
      
      // Send uploaded image URLs and publicIds
      formData.append("images", JSON.stringify(uploadedImages.map(img => ({
        publicId: img.publicId,
        url: img.url
      }))));

      formData.append("variants", JSON.stringify(variants));

      const endpoint = isEdit && initialProduct?.id
        ? `/api/admin/products/${initialProduct.id}`
        : "/api/admin/products";

      const response = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to save product", "error");
        return;
      }

      const product = await response.json();
      showToast(isEdit ? "Product updated successfully" : "Product created successfully", "success");
      router.push(`/admin/products`);
    } catch (err) {
      showToast("An error occurred while saving the product", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" text="Loading product data..." />
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div className="rounded-2xl bg-white p-8 border border-slate-200">
        <h3 className="text-2xl font-bold mb-6 text-slate-900">Product Information</h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Emerald Evening Gown"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Description
            </label>
            <textarea
              placeholder="Product description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-28 rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Price (NGN) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-500 font-semibold">₦</span>
              <input
                type="text"
                placeholder="0.00"
                value={price}
                onChange={handlePriceChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-8 text-sm placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Product Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleCategoryChange("MALE")}
                className={`flex-1 rounded-lg border-2 py-2.5 font-semibold text-sm transition-all ${
                  category === "MALE"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-purple-300"
                }`}
              >
                👔 Men's Collection
              </button>
              <button
                type="button"
                onClick={() => handleCategoryChange("FEMALE")}
                className={`flex-1 rounded-lg border-2 py-2.5 font-semibold text-sm transition-all ${
                  category === "FEMALE"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-purple-300"
                }`}
              >
                👗 Women's Collection
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2.5">
              Visibility
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVisible(true)}
                className={`flex-1 rounded-lg border-2 py-2.5 font-semibold text-sm transition-all ${
                  isVisible
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-emerald-300"
                }`}
              >
                👁️ Visible
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className={`flex-1 rounded-lg border-2 py-2.5 font-semibold text-sm transition-all ${
                  !isVisible
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-300 bg-slate-50 text-slate-700 hover:border-rose-300"
                }`}
              >
                🙈 Hidden
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">Choose whether this product is displayed on the platform</p>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl bg-white p-8 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Product Images</h3>
          <span className="text-sm font-medium text-slate-500">
            {uploadedImages.length}/{MAX_IMAGES} images
          </span>
        </div>

        <div className="space-y-5">
          {/* Upload area */}
          {uploadedImages.length < MAX_IMAGES && (
            <label className="block cursor-pointer">
              <span className="text-sm font-semibold text-slate-900 mb-3 block">
                Upload Images <span className="text-slate-500 font-normal">(Max 5MB each, JPEG/PNG/WebP/GIF)</span>
              </span>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <div className={`border-2 border-dashed rounded-xl p-6 transition-all text-center ${
                  uploading 
                    ? "border-purple-400 bg-purple-50 cursor-wait" 
                    : "border-slate-300 hover:border-purple-400 hover:bg-purple-50 cursor-pointer bg-slate-50"
                }`}>
                  <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                      <>
                        <svg className="w-8 h-8 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm font-semibold text-purple-700">{uploadProgress}</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Click to upload images</p>
                          <p className="text-xs text-slate-500 mt-1">Select multiple images at once</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </label>
          )}

          {/* Image limit reached message */}
          {uploadedImages.length >= MAX_IMAGES && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-amber-800">
                Maximum {MAX_IMAGES} images reached. Remove an image to upload more.
              </p>
            </div>
          )}

          {/* Uploaded images preview */}
          {uploadedImages.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">
                Uploaded Images ({uploadedImages.length})
              </p>
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 transition-all hover:border-purple-400">
                    <img
                      src={image.url}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                        Main
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                💡 Tip: The first image will be used as the main product image
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-2xl bg-white p-8 border border-slate-200">
        <h3 className="text-2xl font-bold mb-6 text-slate-900">Product Variants <span className="text-red-500">*</span></h3>

        <div className="space-y-4">
          {variants.map((variant, idx) => (
            <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 to-white hover:border-purple-300 transition-all space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  Variant {idx + 1}
                </span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                  >
                    × Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={variant.size}
                    onChange={(value) => handleVariantChange(idx, "size", value)}
                    options={availableSizes.map((size) => ({ label: size, value: size }))}
                    placeholder="Select a size"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Black, Blue"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                  Stock (optional)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={variant.stock || ""}
                  onChange={(e) => handleVariantChange(idx, "stock", e.target.value ? parseInt(e.target.value) : 0)}
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                  Measurements (JSON - optional)
                </label>
                <textarea
                  placeholder={getMeasurementsTemplate(category)}
                  value={variant.measurementsText ?? getMeasurementsTemplate(category)}
                  onChange={(e) => {
                    handleVariantChange(idx, "measurementsText", e.target.value);
                    try {
                      const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                      handleVariantChange(idx, "measurements", parsed);
                    } catch {
                      // Invalid JSON - user is still typing
                    }
                  }}
                  className="w-full min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-xs placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariant}
            className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Variant
          </button>
        </div>
      </div>

      {/* Submit */}
      {/* <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 p-8 shadow-lg"> */}
        <button
          className="border border-gray-300 w-full rounded-lg bg-white px-6 py-3 font-bold text-purple-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <ButtonLoader size="sm" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isEdit ? "Update Product" : "Create Product"}
            </>
          )}
        </button>
      {/* </div> */}
    </form>
  );
}
