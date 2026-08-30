'use client';

import EditorialIndexPage from '@/components/editorial/EditorialIndexPage';
import PortfolioIndexPage from '@/components/portfolio/PortfolioIndexPage';
import { Publication } from '@/types/publication';
import { BlogPostMeta } from '@/types/blog';
import {
  PublicationPageConfig,
  TextPageConfig,
  CardPageConfig,
  BasePageConfig,
} from '@/types/page';
import type { ShowcaseItem } from '@/types/showcase';

export type DynamicPageLocaleData =
  | { type: 'publication'; config: PublicationPageConfig; publications: Publication[] }
  | { type: 'text'; config: TextPageConfig; content: string }
  | { type: 'card'; config: CardPageConfig }
  | { type: 'blog'; config: BasePageConfig; posts: BlogPostMeta[] };

interface DynamicPageClientProps {
  data: DynamicPageLocaleData;
}

export default function DynamicPageClient({ data: pageData }: DynamicPageClientProps) {

  if (pageData.type === 'publication') {
    return (
      <PortfolioIndexPage
        title={pageData.config.title}
        variant="publications"
        items={pageData.publications.map(publicationToShowcaseItem)}
      />
    );
  }

  if (pageData.type === 'text') {
    return (
      <EditorialIndexPage
        title={pageData.config.title}
        description={pageData.config.description}
        items={markdownHeadingsToItems(pageData.content, `/${slugFromTitle(pageData.config.title)}`)}
        content={pageData.content}
      />
    );
  }

  if (pageData.type === 'card') {
    if (pageData.config.title === 'Open Source') {
      return (
        <PortfolioIndexPage
          title="Projects"
          variant="projects"
          items={pageData.config.items.map((item, index) => cardToShowcaseItem(item, index))}
        />
      );
    }

    return (
      <EditorialIndexPage
        title={pageData.config.title}
        description={pageData.config.description}
        items={pageData.config.items.map((item, index) => cardToShowcaseItem(item, index))}
      />
    );
  }

  return (
    <PortfolioIndexPage
      title={pageData.config.title}
      variant="blog"
      items={pageData.posts.map(blogToShowcaseItem)}
    />
  );
}

function stripMarkup(value?: string): string | undefined {
  if (!value) return undefined;

  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugFromTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function publicationToShowcaseItem(publication: Publication): ShowcaseItem {
  const venue = publication.journal || publication.conference || publication.venue;

  return {
    id: publication.id,
    title: publication.title,
    href: `/publications/${publication.id}`,
    kind: 'publication',
    image: publication.preview ? `/papers/${publication.preview}` : undefined,
    meta: [venue, publication.year].filter(Boolean).join(' / '),
    description: stripMarkup(publication.description || publication.summary || publication.abstract),
    links: [
      publication.url && { label: 'Paper', href: publication.url },
      publication.code && { label: 'Code', href: publication.code },
      publication.project && { label: 'Project', href: publication.project },
    ].filter((link): link is { label: string; href: string } => Boolean(link)),
  };
}

function blogToShowcaseItem(post: BlogPostMeta): ShowcaseItem {
  return {
    id: post.slug,
    title: post.title,
    href: `/blog/${post.slug}`,
    kind: 'blog',
    image: post.image,
    meta: [post.date, post.tags?.[0]].filter(Boolean).join(' / '),
    description: post.excerpt,
  };
}

function cardToShowcaseItem(item: CardPageConfig['items'][number], index: number): ShowcaseItem {
  const id = item.slug || slugFromTitle(item.title || `item-${index + 1}`);

  return {
    id,
    title: item.title,
    href: item.link || `#${id}`,
    kind: 'card',
    image: item.image,
    meta: [item.date, item.subtitle].filter(Boolean).join(' / '),
    description: stripMarkup(item.content),
    external: Boolean(item.link?.startsWith('http')),
  };
}

function markdownHeadingsToItems(content: string, fallbackHref: string): ShowcaseItem[] {
  const headings = Array.from(content.matchAll(/^##\s+(.+)$/gm)).map((match) => match[1].trim());

  if (headings.length === 0) {
    return [];
  }

  return headings.map((heading) => {
    const id = slugFromTitle(heading);
    return {
      id,
      title: heading,
      href: `${fallbackHref}#${id}`,
      kind: 'text',
    };
  });
}
