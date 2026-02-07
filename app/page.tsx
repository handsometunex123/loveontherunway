import Link from "next/link";
import { db } from "@/lib/db";

const ITEMS_PER_PAGE = 6;

export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Math.max(1, parseInt(searchParams.page || "1"));
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Get total count for pagination
  const totalProducts = await db.product.count({
    where: {
      isVisible: true,
      designer: {
        isApproved: true,
        isVisible: true,
        user: { isActive: true }
      }
    }
  });

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

  const products = await db.product.findMany({
    where: {
      isVisible: true,
      designer: {
        isApproved: true,
        isVisible: true,
        user: { isActive: true }
      }
    },
    include: {
      images: true,
      designer: { include: { user: true } },
      votes: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    skip,
    take: ITEMS_PER_PAGE
  });

  console.log('Fetched images:', products.map((p: any) => p.images.length));

  return (
    <section>
      <h1 className="text-4xl font-bold mb-2">Featured Runway Looks</h1>
      <p className="text-slate-600 mb-6">Discover the designers showcasing their best work.</p>
      <div className="grid auto-fit grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5 mb-8">
        {products.map((product: any) => (
          <div key={product.id} className="rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {product.images && product.images.length > 0 && (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-5">
              {/* <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 mb-2">
                {product.votes.length} votes
              </div> */}
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-slate-600 mb-4">{product.designer.brandName}</p>
              <Link href={`/products/${product.id}`} className="text-purple-600 hover:text-purple-700 font-semibold">
                View details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-8">
          {/* Previous Button */}
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

          {/* Page Numbers */}
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

          {/* Next Button */}
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

      {/* Pagination Info */}
      <div className="text-center text-slate-600 text-sm">
        Showing {skip + 1} to {Math.min(skip + ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
      </div>
    </section>
  );
}
