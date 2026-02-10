import Link from "next/link";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import BackButton from "@/app/BackButton";
import ShareDesignerButton from "../ShareDesignerButton";
import DesignerInvitationCard from "../DesignerInvitationCard";


interface DesignerPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: DesignerPageProps): Promise<Metadata> {
  const designer = await db.designerProfile.findUnique({
    where: { id: params.id },
    select: { brandName: true, bio: true, brandLogo: true }
  });

  if (!designer) {
    return {
      title: "Designer Not Found | Love On The Runway"
    };
  }

  return {
    title: `${designer.brandName} | Love On The Runway`,
    description: designer.bio || `Explore ${designer.brandName}'s collection on Love On The Runway.`,
    openGraph: {
      title: `${designer.brandName} | Love On The Runway`,
      description: designer.bio || `Explore ${designer.brandName}'s collection on Love On The Runway.`,
      images: designer.brandLogo ? [{ url: designer.brandLogo }] : undefined
    }
  };
}

export default async function DesignerPage({ params }: DesignerPageProps) {
  const session = await getServerSession(authOptions);
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

  const isOwner = session?.user?.role === "DESIGNER" && session.user.id === designer.userId;

  // JSON-LD Structured Data
  const designerSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": designer.brandName,
    "description": designer.bio || `${designer.brandName} - Fashion designer on Love On The Runway`,
    "logo": designer.brandLogo,
    "url": `https://loveontherunway.com/designers/${designer.id}`,
    "sameAs": [
      designer.website,
      designer.instagram && `https://instagram.com/${designer.instagram.replace('@', '')}`,
      designer.twitter && `https://twitter.com/${designer.twitter.replace('@', '')}`,
      designer.tiktok && `https://tiktok.com/@${designer.tiktok.replace('@', '')}`
    ].filter(Boolean)
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://loveontherunway.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Designers",
        "item": "https://loveontherunway.com/designers"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": designer.brandName
      }
    ]
  };

  return (
    <section>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(designerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mb-6 md:mb-8">
        <BackButton fallbackUrl="/designers" />
      </div>

      {/* Designer Header */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-4">
              {designer.brandLogo && (
                <img
                  src={designer.brandLogo}
                  alt={`${designer.brandName} logo`}
                  className="h-20 w-20 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-black mb-2 text-slate-900 tracking-tight">
                  {designer.brandName}
                </h1>
                
                {designer.bio && (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {designer.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {designer.products.length} {designer.products.length === 1 ? 'Design' : 'Designs'}
              </div>

              {(designer.website || designer.instagram || designer.twitter || designer.tiktok) && (
                <div className="flex flex-wrap gap-2">
                  {designer.website && (
                    <a
                      href={designer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Visit website"
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
                      title="Follow on Instagram"
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
                      title="Follow on Twitter"
                      className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z" />
                      </svg>
                    </a>
                  )}
                  
                  {designer.tiktok && (
                    <a
                      href={`https://tiktok.com/@${designer.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Follow on TikTok"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.01-.01z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <ShareDesignerButton designerId={params.id} designerName={designer.brandName} />
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

      {/* Invitation Card Section */}
      {isOwner && (
        <div className="mt-16 pt-12 border-t border-slate-200">
          <h2 className="text-3xl font-black mb-8 text-slate-900">Share Your Brand</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <DesignerInvitationCard
                designerId={designer.id}
                brandName={designer.brandName}
                brandLogo={designer.brandLogo || undefined}
                bio={designer.bio || undefined}
              />
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Tips for Sharing</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  Share on Instagram Stories for maximum visibility
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  Tag your followers and fellow designers
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  Pin the invitation card on Pinterest
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  Use relevant hashtags (#LoveOnTheRunway)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
