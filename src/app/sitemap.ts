import { getAllPosts } from '@/lib/blog';
import { getConfig } from '@/lib/config';
import { MetadataRoute } from 'next';

/**
 * Next.js Sitemap Generator
 * This dynamically generates a sitemap.xml for Google indexing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Replace this with your actual domain when you deploy
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://chael-chael.github.io';
  const config = getConfig();
  
  // 1. Static pages from navigation (Home, Blog List, Publications, etc.)
  const staticPages = config.navigation
    .filter(nav => nav.type === 'page')
    .map(nav => ({
      url: `${baseUrl}${nav.href.startsWith('/') ? '' : '/'}${nav.href}`,
      lastModified: new Date(),
      changeFrequency: (nav.href === '/' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: nav.href === '/' ? 1.0 : 0.8,
    }));

  // 2. Dynamic Blog Posts
  const posts = getAllPosts();
  const blogPosts = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...blogPosts,
  ];
}
