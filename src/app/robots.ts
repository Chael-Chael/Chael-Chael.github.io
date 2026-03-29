import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

/**
 * Next.js Robots.txt Generator
 * Tells Google and other search engines what they can crawl.
 */
export default function robots(): MetadataRoute.Robots {
  // Use environment variable for domain, fallback to placeholder
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chael-chael.github.io';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
