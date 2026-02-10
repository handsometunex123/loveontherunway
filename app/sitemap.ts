import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://loveontherunway.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
  ]

  // Get all visible designers
  const designers = await db.designerProfile.findMany({
    where: {
      isApproved: true,
      isVisible: true,
      user: { isActive: true }
    },
    select: {
      id: true,
      updatedAt: true,
    }
  })

  const designerRoutes: MetadataRoute.Sitemap = designers.map((designer: any) => ({
    url: `${baseUrl}/designers/${designer.id}`,
    lastModified: designer.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Get all visible products
  const products = await db.product.findMany({
    where: {
      isVisible: true,
      designer: {
        isApproved: true,
        isVisible: true,
        user: { isActive: true }
      }
    },
    select: {
      id: true,
      updatedAt: true,
    }
  })

  const productRoutes: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...designerRoutes, ...productRoutes]
}
