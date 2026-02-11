import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/cart',
          '/checkout',
          '/order-confirmation',
          '/order-confirmation/*',
          '/profile',
          '/settings',
          '/auth',
          '/auth/*',
          '/login',
        ],
      },
    ],
    sitemap: 'https://loveontherunway.com/sitemap.xml',
  };
}
