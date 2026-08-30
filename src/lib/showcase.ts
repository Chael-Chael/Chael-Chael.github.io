import { getConfig } from '@/lib/config';
import { getAllPosts } from '@/lib/blog';
import {
  getBibtexContent,
  getMarkdownContent,
  getPageConfig,
  getTomlContent,
} from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import type { BlogPostMeta } from '@/types/blog';
import type { CardItem, CardPageConfig, PublicationPageConfig } from '@/types/page';
import type { Publication } from '@/types/publication';
import type { HomeContentConfig, ShowcaseHomeLocaleData, ShowcaseItem, ShowcaseKind, ShowcaseSection } from '@/types/showcase';

interface NewsItem {
  date: string;
  content: string;
}

type NavigationItem = ReturnType<typeof getConfig>['navigation'][number];
type HomeSectionTarget = 'about' | 'news' | 'publications' | 'blog' | 'open-source';

const HOME_SECTION_ORDER: HomeSectionTarget[] = [
  'about',
  'news',
  'publications',
  'blog',
  'open-source',
];

const HOME_SECTION_FALLBACKS: Record<HomeSectionTarget, { title: string; href: string }> = {
  about: { title: 'Chenyu Zhu', href: '/' },
  news: { title: 'News', href: '/#news' },
  publications: { title: 'Publications', href: '/publications' },
  blog: { title: 'Research Blog', href: '/blog' },
  'open-source': { title: 'Open Source', href: '/open-source' },
};

function stripMarkup(value?: string): string | undefined {
  if (!value) return undefined;

  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#127775;/g, '')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstMarkdownHeading(content: string): string | undefined {
  return content.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function getPublicationPreview(publication: Publication): string | undefined {
  return publication.preview ? `/papers/${publication.preview}` : undefined;
}

export function getPublicationVenue(publication: Publication): string | undefined {
  return publication.journal || publication.conference || publication.venue || undefined;
}

export function getAllPublications(locale?: string): Publication[] {
  const pageConfig = getPageConfig<PublicationPageConfig>('publications', locale);
  const source = pageConfig?.source || 'publications.bib';
  const bibtex = getBibtexContent(source, locale);
  return parseBibTeX(bibtex, locale);
}

export function getPublicationById(id: string, locale?: string): Publication | null {
  return getAllPublications(locale).find((publication) => publication.id === id) || null;
}

function publicationToItem(publication: Publication): ShowcaseItem {
  const venue = getPublicationVenue(publication);

  return {
    id: publication.id,
    title: publication.title,
    href: `/publications/${publication.id}`,
    kind: 'publication',
    image: getPublicationPreview(publication),
    meta: [venue, publication.year].filter(Boolean).join(' / '),
    description: stripMarkup(publication.description || publication.summary || publication.abstract),
    links: [
      publication.url && { label: 'Paper', href: publication.url },
      publication.code && { label: 'Code', href: publication.code },
      publication.project && { label: 'Project', href: publication.project },
    ].filter((link): link is { label: string; href: string } => Boolean(link)),
  };
}

function blogToItem(post: BlogPostMeta): ShowcaseItem {
  return {
    id: post.slug,
    title: post.title,
    href: `/blog/${post.slug}`,
    kind: 'blog',
    image: post.image,
    meta: [formatDate(post.date), post.tags?.[0]].filter(Boolean).join(' / '),
    description: post.excerpt,
  };
}

function cardToItem(item: CardItem, index: number, pageHref: string, kind: ShowcaseKind): ShowcaseItem {
  const itemSlug = item.slug || slugify(item.title || `item-${index + 1}`);

  return {
    id: itemSlug,
    title: item.title,
    href: item.link || `${pageHref}#${itemSlug}`,
    kind,
    image: item.image,
    meta: [item.date, item.subtitle].filter(Boolean).join(' / '),
    description: stripMarkup(item.content),
    external: Boolean(item.link && /^https?:\/\//.test(item.link)),
  };
}

function textToItems(content: string, pageHref: string): ShowcaseItem[] {
  const headings = Array.from(content.matchAll(/^##\s+(.+)$/gm)).map((match) => match[1].trim());

  if (headings.length > 0) {
    return headings.map((heading) => ({
      id: slugify(heading),
      title: heading,
      href: `${pageHref}#${slugify(heading)}`,
      kind: 'text',
    }));
  }

  const fallbackTitle = firstMarkdownHeading(content) || 'Read';
  return [{
    id: slugify(fallbackTitle),
    title: fallbackTitle,
    href: pageHref,
    kind: 'text',
    description: stripMarkup(content),
  }];
}

function newsToItems(locale?: string): ShowcaseItem[] {
  const newsData = getTomlContent<{ news: NewsItem[] }>('news.toml', locale);

  return (newsData?.news || []).map((item, index) => ({
    id: `news-${index}`,
    title: stripMarkup(item.content) || item.content,
    href: `/#news-${index}`,
    kind: 'news',
    meta: item.date,
    description: stripMarkup(item.content),
  }));
}

function buildSectionForNavItem(
  item: NavigationItem,
  locale?: string,
): ShowcaseSection | null {
  const config = getConfig(locale);

  if (item.target === 'about') {
    const aboutConfig = getPageConfig<{ profile?: { research_interests?: string[] } }>('about', locale);
    const interests = aboutConfig?.profile?.research_interests || [];
    const interestItems = interests.map((interest, index): ShowcaseItem => ({
      id: `interest-${index}`,
      title: interest,
      href: '/',
      kind: 'about',
    }));

    return {
      id: item.target,
      title: config.author.name,
      href: item.href,
      kind: 'about',
      intro: getMarkdownContent('bio.md', locale),
      email: config.social.email,
      items: interestItems,
    };
  }

  if (item.target === 'publications') {
    const pageConfig = getPageConfig<PublicationPageConfig>(item.target, locale);
    return {
      id: item.target,
      title: pageConfig?.title || item.title,
      href: item.href,
      kind: 'publication',
      intro: pageConfig?.description,
      items: getAllPublications(locale).map(publicationToItem),
    };
  }

  if (item.target === 'blog') {
    const pageConfig = getPageConfig<{ title?: string; description?: string }>(item.target, locale);
    return {
      id: item.target,
      title: pageConfig?.title || item.title,
      href: item.href,
      kind: 'blog',
      intro: pageConfig?.description,
      items: getAllPosts(locale).map(blogToItem),
    };
  }

  const pageConfig = getPageConfig<CardPageConfig | { type: 'text'; title: string; description?: string; source: string }>(item.target, locale);
  if (!pageConfig) return null;

  if (pageConfig.type === 'card') {
    return {
      id: item.target,
      title: pageConfig.title || item.title,
      href: item.href,
      kind: 'card',
      intro: pageConfig.description,
      items: pageConfig.items.map((cardItem, index) => cardToItem(cardItem, index, item.href, 'card')),
    };
  }

  if (pageConfig.type === 'text') {
    const content = getMarkdownContent(pageConfig.source, locale);
    return {
      id: item.target,
      title: pageConfig.title || item.title,
      href: item.href,
      kind: 'text',
      intro: pageConfig.description,
      items: textToItems(content, item.href),
    };
  }

  return null;
}

function getNavigationItem(
  config: ReturnType<typeof getConfig>,
  target: HomeSectionTarget,
): NavigationItem {
  const fallback = HOME_SECTION_FALLBACKS[target];
  return config.navigation.find((item) => item.target === target) || {
    title: fallback.title,
    type: 'page',
    target,
    href: fallback.href,
  };
}

function buildNewsSection(locale?: string): ShowcaseSection {
  return {
    id: 'news',
    title: HOME_SECTION_FALLBACKS.news.title,
    href: HOME_SECTION_FALLBACKS.news.href,
    kind: 'news',
    intro: 'Recent updates from research work and academic life.',
    items: newsToItems(locale),
  };
}

function buildHomeSection(target: HomeSectionTarget, locale?: string): ShowcaseSection | null {
  const config = getConfig(locale);

  if (target === 'news') {
    return buildNewsSection(locale);
  }

  return buildSectionForNavItem(getNavigationItem(config, target), locale);
}

export function getShowcaseHomeData(locale?: string): ShowcaseHomeLocaleData {
  const config = getConfig(locale);
  const home = getTomlContent<HomeContentConfig>('home.toml', locale);
  if (!home) throw new Error('Failed to load content/home.toml');
  const sections = HOME_SECTION_ORDER
    .map((target) => buildHomeSection(target, locale))
    .filter((item): item is ShowcaseSection => Boolean(item));

  return {
    author: config.author,
    social: config.social,
    home,
    sections,
  };
}

export function getIndexItemsForPage(slug: string, locale?: string): ShowcaseItem[] {
  const config = getConfig(locale);
  const item = config.navigation.find((navItem) => navItem.target === slug);
  if (!item) return [];

  return buildSectionForNavItem(item, locale)?.items || [];
}
