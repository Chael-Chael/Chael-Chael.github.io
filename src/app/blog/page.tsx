import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getConfig } from '@/lib/config';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';
import BlogList from '@/components/blog/BlogList';

export async function generateMetadata(): Promise<Metadata> {
  const config = getConfig();
  return {
    title: 'Blog',
    description: `Thoughts and stories from ${config.author.name}`,
  };
}

export default async function BlogPage() {
  const config = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(config.i18n);
  
  // Note: We always fetch for the default locale first, 
  // but BlogList component handles dynamic locale switching via useLocaleStore in child cards if needed.
  // Actually, for SEO and initial render, we might want to fetch based on locale if we can.
  // But Next.js server components don't easily know the client-side locale store.
  // However, PRISM seems to handle this in DynamicPageClient by passing all data.
  // For simplicity here, we'll fetch all posts for both locales if enabled.
  
  const posts = getAllPosts(runtimeI18n.defaultLocale);

  return (
    <div className="bg-neutral-50/50 dark:bg-neutral-900/50 min-h-screen">
      <BlogList posts={posts} title="Research Blog" description="Explorations in AI, Diffusion Models, and Multimodal Learning." />
    </div>
  );
}
