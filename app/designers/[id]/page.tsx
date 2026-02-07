import Link from "next/link";
import { db } from "@/lib/db";
import BackButton from "@/app/BackButton";

interface DesignerPageProps {
  params: { id: string };
}

export default async function DesignerPage({ params }: DesignerPageProps) {
  const designer = await db.designerProfile.findUnique({
    where: { id: params.id },
    include: { products: { where: { isVisible: true }, include: { images: true } }, user: true }
  });

  if (!designer || !designer.isApproved || !designer.isVisible || !designer.user.isActive) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Designer not available</p>
          <Link href="/designers" className="text-purple-600 hover:text-purple-700 font-semibold">
            ← Back to designers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 md:mb-8">
        <BackButton fallbackUrl="/designers" />
      </div>

      {/* Designer Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 tracking-tight">
          {designer.brandName}
        </h1>
        
        {designer.bio && (
          <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
            {designer.bio}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
            {designer.products.length} {designer.products.length === 1 ? 'Design' : 'Designs'}
          </div>
        </div>
      </div>

      {/* Products Section */}
      {designer.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {designer.products.map((product: any) => (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="h-full rounded-2xl bg-white overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col hover:border-slate-300">
                {/* Product Image */}
                <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-sm">No image</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto pt-3">
                    <span className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl">
          <p className="text-slate-500 text-lg">No designs available yet</p>
        </div>
      )}
    </section>
  );
}
