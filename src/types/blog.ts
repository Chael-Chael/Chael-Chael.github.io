export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  tags?: string[];
  author?: string;
  language?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
