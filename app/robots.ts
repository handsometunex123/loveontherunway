import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/designers',
          '/designers/*',
          '/products/*',
          '/vote',
          '/login'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/cart',
          '/checkout',
          '/order-confirmation/*'
        ],
      },
    ],
    sitemap: 'https://loveontherunway.com/sitemap.xml',
  }
}
