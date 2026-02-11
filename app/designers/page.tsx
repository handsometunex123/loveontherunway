import Link from "next/link";
import { Metadata } from "next";
import { db } from "@/lib/db";
import DesignerProductCarousel from "./DesignerProductCarousel";
import BackButton from "../BackButton";

export const metadata: Metadata = {
  title: "Our Designers | Love On The Runway",
  description: "Meet talented fashion designers showcasing their unique collections on Love On The Runway. Discover emerging talent and exclusive designs.",
  openGraph: {
    title: "Our Designers | Love On The Runway",
    description: "Meet talented fashion designers showcasing their unique collections",
    url: "https://loveontherunway.com/designers"
  }
};

export const dynamic = "force-dynamic";

export default async function DesignersPage() {
  const designers = await db.designerProfile.findMany({
    where: {
      isApproved: true,
      isVisible: true,
      isDeleted: false,
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
              <div className="flex items-start gap-4 mb-4">
                {designer.brandLogo && (
                  <img
                    src={designer.brandLogo}
                    alt={`${designer.brandName} logo`}
                    className="h-16 w-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight line-clamp-2">
                    {designer.brandName}
                  </h3>
                  
                  {/* Product Count Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase tracking-widest">
                      {designer.products.length} {designer.products.length === 1 ? 'Design' : 'Designs'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                {designer.bio ?? "Exclusive designer collection on love on the runway"}
              </p>

              {/* Social Links */}
              <div className="mt-4 flex flex-wrap gap-2">
                {designer.website && (
                  <a
                    href={designer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Website"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zM12 6C9.24 6 7 8.24 7 11h2c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1-1 2-2 3h2c0-2.76-2.24-5-5-5z" />
                    </svg>
                  </a>
                )}
                {designer.instagram && (
                  <a
                    href={`https://instagram.com/${designer.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="p-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.322a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </a>
                )}
                {designer.twitter && (
                  <a
                    href={`https://twitter.com/${designer.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter/X"
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                    </svg>
                  </a>
                )}
                {designer.tiktok && (
                  <a
                    href={`https://tiktok.com/@${designer.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.01-.01z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Products Carousel */}
            <div className="flex-1 p-6 md:p-8 overflow-hidden">
              <DesignerProductCarousel
                designerId={designer.id}
                products={designer.products.map((product: any) => ({
                  ...product,
                  price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
                    ? product.price.toNumber()
                    : product.price
                }))}
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
