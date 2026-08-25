import type { SiteConfig } from '@/lib/config';

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
  description?: string;
  external?: boolean;
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

export interface ShowcaseHomeLocaleData {
  author: SiteConfig['author'];
  social: SiteConfig['social'];
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
