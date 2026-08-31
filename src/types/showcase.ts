import type { SiteConfig } from '@/lib/config';
import type { Author } from '@/types/publication';

export type ShowcaseKind =
  | 'about'
  | 'publication'
  | 'blog'
  | 'photo'
  | 'card'
  | 'text'
  | 'news'
  | 'link';

export interface ShowcaseItem {
  id: string;
  title: string;
  href: string;
  kind: ShowcaseKind;
  image?: string;
  meta?: string;
  badge?: string;
  date?: string;
  description?: string;
  authors?: Author[];
  external?: boolean;
  links?: DetailLink[];
}

export interface ShowcaseSection {
  id: string;
  title: string;
  href: string;
  kind: ShowcaseKind;
  intro?: string;
  email?: string;
  items: ShowcaseItem[];
}

export interface HomeFeaturedItem {
  id: string;
  title: string;
  href: string;
  image: string;
  meta?: string;
  description?: string;
  external?: boolean;
}

export interface HomeContentConfig {
  hero: {
    before_university: string;
    university: string;
    university_url: string;
    before_lab: string;
    lab_prefix: string;
    lab_suffix: string;
    lab_url: string;
    before_shimmer: string;
    shimmer: string;
    after_shimmer: string;
    publications_label: string;
    after_publications: string;
    blog_label: string;
    after_blog: string;
    github_label: string;
    connector: string;
    email_label: string;
  };
  profile: {
    institution_short: string;
    bio: string;
    collaboration: string;
  };
  experiences: Array<{
    organization: string;
    role: string;
    period: string;
    location: string;
    image: string;
    href: string;
    details: string[];
    tags: string[];
  }>;
  limits: {
    publications: number;
    projects: number;
  };
  research_interests: Array<{
    title: string;
    description: string;
  }>;
  featured_blog: HomeFeaturedItem;
  gallery: HomeFeaturedItem[];
}

export interface ShowcaseHomeLocaleData {
  author: SiteConfig['author'];
  social: SiteConfig['social'];
  home: HomeContentConfig;
  sections: ShowcaseSection[];
}

export interface DetailPair {
  label: string;
  value: string;
}

export interface DetailLink {
  label: string;
  href: string;
}
