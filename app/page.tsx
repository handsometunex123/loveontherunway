import type { Metadata } from "next";
import Link from "next/link";
import type { ProductImage } from "@prisma/client";

import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Love On The Runway | Featured Designers & Collections",
  description:
    "Browse featured fashion designers and exclusive runway collections. Vote for your favorite designs and shop unique pieces from emerging designers.",
  openGraph: {
    title: "Love On The Runway | Featured Designers & Collections",
    description: "Browse featured fashion designers and exclusive runway collections",
    url: "https://loveontherunway.com",
    images: [
      {
        url: "https://loveontherunway.com/og-image.png",
        width: 1200,
        height: 630
      }
    ]
  }
};

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

type HomePageProps = {
  searchParams: { page?: string };
};

const getPrimaryImage = (images: ProductImage[]) => images[0]?.url ?? null;
const normalizeHandle = (handle?: string | null) => handle?.replace(/^@/, "") ?? "";

export default async function HomePage({ searchParams }: HomePageProps) {
  const pageParam = Number.parseInt(searchParams.page ?? "1", 10);
  const currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [totalProducts, designers, productsRaw] = await Promise.all([
    db.product.count({
      where: {
        isVisible: true,
        designer: {
          isApproved: true,
          isVisible: true,
          user: { isActive: true }
        }
      }
    }),
    db.designerProfile.findMany({
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
          include: { images: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    db.product.findMany({
      where: {
        isVisible: true,
        isDeleted: false,
        designer: {
          isApproved: true,
          isVisible: true,
          user: { isActive: true }
        }
      },
      include: {
        images: true,
        designer: { include: { user: true } }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE
    })
  ]);

  // Serialize Decimal fields in products
  const products = productsRaw.map((product: any) => ({
    ...product,
    price: typeof product.price === 'object' && product.price !== null && 'toNumber' in product.price
      ? product.price.toNumber()
      : product.price
  }));

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const startItem = totalProducts === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + ITEMS_PER_PAGE, totalProducts);

  return (
    <section className="py-2">
      {/* Hero Banner with Event Flier */}
      <div className="relative w-full h-[500px] md:h-[600px] mb-12 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src="/card-logo.jpeg"
          alt="Love On The Runway Event"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            Love On The Runway 2026
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl drop-shadow-md">
            Relive the magic of last year's spectacular fashion showcase. An unforgettable celebration of emerging designers and breathtaking runway moments.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/gallery"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              View Past Events
            </Link>
            <Link
              href="/designers"
              className="px-8 py-4 bg-white/90 hover:bg-white text-slate-900 font-bold rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Browse Designers
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Runway Looks</h2>
            <p className="text-slate-600">Discover the designers showcasing their best work. Each piece tells a story of creativity and passion.</p>
          </div>
        </div>
        <div className="grid auto-fit grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 mb-8">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow block focus:outline-none focus:ring-2 focus:ring-purple-500"
              tabIndex={0}
              style={{ textDecoration: 'none' }}
            >
              {product.images?.length ? (
                <div className="w-full aspect-[4/5] bg-slate-50 flex items-center justify-center">
                  <img
                    src={getPrimaryImage(product.images) ?? ""}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/5] bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                  No image
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center mb-4">
                  {product.designer.brandLogo ? (
                    <img
                      src={product.designer.brandLogo}
                      alt={`${product.designer.brandName} logo`}
                      className="h-6 w-6 object-cover rounded-md border border-slate-200 mr-2"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-md bg-slate-200 flex items-center justify-center text-slate-700 font-bold mr-2 text-xs">
                      {product.designer.brandName?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-slate-600">{product.designer.brandName}</span>
                </div>
                <span className="text-purple-600 hover:text-purple-700 font-semibold">View details →</span>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-8">
            {currentPage > 1 ? (
              <Link
                href={`/?page=${currentPage - 1}`}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-semibold"
              >
                ← Previous
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed font-semibold"
              >
                ← Previous
              </button>
            )}

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/?page=${page}`}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-purple-600 text-white"
                      : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>

            {currentPage < totalPages ? (
              <Link
                href={`/?page=${currentPage + 1}`}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-semibold"
              >
                Next →
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-slate-300 text-slate-500 cursor-not-allowed font-semibold"
              >
                Next →
              </button>
            )}
          </div>
        )}

        <div className="text-center text-slate-600 text-sm">
          Showing {startItem} to {endItem} of {totalProducts} products
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-2 text-slate-900">Top Designers of 2026</h2>
            <p className="text-slate-600">View all designers rocking the runway this year.</p>
          </div>
          <Link href="/designers" className="text-purple-600 hover:text-purple-700 font-semibold">
            View all designers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map((designer: any) => (
            <div
              key={designer.id}
              className="group rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6 bg-gradient-to-br from-slate-50 to-white">
                <div className="flex items-start gap-4 mb-4">
                  {designer.brandLogo ? (
                    <img
                      src={designer.brandLogo}
                      alt={`${designer.brandName} logo`}
                      className="h-14 w-14 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                      {designer.brandName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link href={`/designers/${designer.id}`} className="block">
                      <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-purple-700">
                        {designer.brandName}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                      {designer.products.length} {designer.products.length === 1 ? "Design" : "Designs"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">
                  {designer.bio ?? "Showcased their stunning collection at Love On The Runway 2025"}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {designer.website && (
                      <a
                        href={designer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Website"
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zM12 6C9.24 6 7 8.24 7 11h2c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1-1 2-2 3h2c0-2.76-2.24-5-5-5z" />
                        </svg>
                      </a>
                    )}
                    {designer.instagram && (
                      <a
                        href={`https://instagram.com/${normalizeHandle(designer.instagram)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram"
                        className="p-2 rounded-lg bg-pink-100 hover:bg-pink-200 transition-colors"
                      >
                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.322a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                        </svg>
                      </a>
                    )}
                    {designer.twitter && (
                      <a
                        href={`https://twitter.com/${normalizeHandle(designer.twitter)}`}
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
                        href={`https://tiktok.com/@${normalizeHandle(designer.tiktok)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="TikTok"
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.01-.01z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/designers/${designer.id}`}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    View profile →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
