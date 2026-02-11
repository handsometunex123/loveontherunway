import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import ProductForm from "./ProductForm";
import BackButton from "@/app/BackButton";

export default async function CreateProductPage() {
  const session = await requireRole(["SUPER_ADMIN", "DESIGNER"]);

  const designerProfile = session.user.role === "DESIGNER"
    ? await db.designerProfile.findUnique({ where: { userId: session.user.id, isDeleted: false } })
    : null;

  if (session.user.role === "DESIGNER" && !designerProfile) {
    return <p>Designer profile not found.</p>;
  }

  return (
    <section className="min-h-screen py-2 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <BackButton fallbackUrl="/admin/products" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            Create Product
          </h1>
          <p className="text-slate-600 md:text-lg">
            Add a new design to showcase on the platform
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white shadow-none md:shadow-lg overflow-hidden">
          <div className="md:p-8">
            <ProductForm designerProfile={designerProfile} />
          </div>
        </div>
      </div>
    </section>
  );
}
