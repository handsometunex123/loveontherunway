import Link from "next/link";
import { db } from "@/lib/db";
import DesignerProductCarousel from "./DesignerProductCarousel";
import BackButton from "../BackButton";

export const dynamic = "force-dynamic";

export default async function DesignersPage() {
  const designers = await db.designerProfile.findMany({
    where: {
      isApproved: true,
      isVisible: true,
      user: { isActive: true }
    },
    include: {
      user: true,
      products: {
        where: { isVisible: true },
        include: { images: true },
        orderBy: { createdAt: "desc" },
        take: 10 // Limit to 10 products for performance
      }
    }
  });

  return (
    <section>
      <div className="mb-6 md:mb-8">
        <BackButton fallbackUrl="/" />
      </div>

      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-900 tracking-tight">
          Our Designers
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          Discover the talented creators behind love on the runway. Each designer brings their unique vision and craftsmanship to our curated collection.
        </p>
      </div>

      {/* Designers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {designers.map((designer: any) => (
          <div 
            key={designer.id} 
            className="group rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-slate-200 flex flex-col"
          >
            {/* Designer Header Card */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight line-clamp-2">
                {designer.brandName}
              </h3>
              
              {/* Product Count Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-widest">
                  {designer.products.length} {designer.products.length === 1 ? 'Design' : 'Designs'}
                </span>
              </div>

              {/* Bio */}
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                {designer.bio ?? "Exclusive designer collection on love on the runway"}
              </p>
            </div>

            {/* Products Carousel */}
            <div className="flex-1 p-6 md:p-8 overflow-hidden">
              <DesignerProductCarousel
                designerId={designer.id}
                products={designer.products}
              />
            </div>

            {/* CTA Button */}
            <div className="p-6 md:p-8 border-t border-slate-100 bg-gradient-to-br from-white to-slate-50">
              <Link
                href={`/designers/${designer.id}`}
                className="w-full block text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 font-semibold transition-all duration-300 text-sm uppercase tracking-widest shadow-lg hover:shadow-xl"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {designers.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <p className="text-slate-500 text-lg">No designers available at the moment.</p>
        </div>
      )}
    </section>
  );
}
