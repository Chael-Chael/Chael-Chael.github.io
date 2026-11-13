export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  tags?: string[];
  author?: string;
  language?: string;
  /** Conclusions shown before the body, 1-5 lines. */
  takeaways?: string[];
  /** Generated Mono Dither cover (scripts/gen-covers.mjs). When set, it replaces `image`. */
  cover?: BlogCover | true;
}

export interface BlogCover {
  shape?: 'beam' | 'trails' | 'flare' | 'horizon';
  color?: string;
  seed?: number;
  /** Big serif word on the cover, default: first English word of the title + "." */
  word?: string;
  /** Corner date, default: post date as M.DD */
  date?: string;
  /** Bottom-right small text, default: first two tags (use \n for two lines) */
  caption?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
