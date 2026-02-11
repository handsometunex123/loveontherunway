import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://loveontherunway.com';

  // Static routesss
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/designers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vote`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Get all visible designers
  const designers = await db.designerProfile.findMany({
    where: {
      isApproved: true,
      isVisible: true,
      isDeleted: false,
      user: { isActive: true }
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const designerRoutes = designers.map((designer: any) => ({
    url: `${baseUrl}/designers/${designer.id}`,
    lastModified: designer.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Get all visible products
  const products = await db.product.findMany({
    where: {
      isVisible: true,
      isDeleted: false,
      designer: {
        isApproved: true,
        isVisible: true,
        user: { isActive: true },
      },
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const productRoutes = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const allRoutes = [...staticRoutes, ...designerRoutes, ...productRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    allRoutes.map(route => `\n  <url>\n    <loc>${route.url}</loc>\n    <lastmod>${new Date(route.lastModified).toISOString()}</lastmod>\n    <changefreq>${route.changeFrequency}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`).join('') +
    '\n</urlset>';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
