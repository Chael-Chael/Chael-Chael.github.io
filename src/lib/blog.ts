import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';
import { BlogPost, BlogPostMeta } from '@/types/blog';

const BLOG_CONTENT_DIR = 'content/blog';
const CONTENT_DIR = 'content';

function normalizeLocale(locale: string): string {
  return locale.trim().replace('_', '-').toLowerCase();
}

export function getAllPosts(locale?: string): BlogPostMeta[] {
  const contentDir = locale 
    ? path.join(process.cwd(), `${CONTENT_DIR}_${normalizeLocale(locale)}`, 'blog')
    : path.join(process.cwd(), BLOG_CONTENT_DIR);

  if (!fs.existsSync(contentDir)) {
    // If localized blog dir doesn't exist, fallback to default if locale was provided
    if (locale) {
        return getAllPosts();
    }
    return [];
  }

  const files = fs.readdirSync(contentDir);
  const tomlFiles = files.filter(f => f.endsWith('.toml'));

  const posts = tomlFiles.map(file => {
    const slug = file.replace('.toml', '');
    const tomlContent = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    const meta = parse(tomlContent) as unknown as BlogPostMeta;
    
    return {
      ...meta,
      slug,
    };
  });

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string, locale?: string): BlogPost | null {
  const candidates = [];
  
  if (locale) {
    candidates.push(path.join(process.cwd(), `${CONTENT_DIR}_${normalizeLocale(locale)}`, 'blog'));
  }
  candidates.push(path.join(process.cwd(), BLOG_CONTENT_DIR));

  for (const dir of candidates) {
    const tomlPath = path.join(dir, `${slug}.toml`);
    const mdPath = path.join(dir, `${slug}.md`);

    if (fs.existsSync(tomlPath) && fs.existsSync(mdPath)) {
      const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
      const mdContent = fs.readFileSync(mdPath, 'utf-8');
      const meta = parse(tomlContent) as unknown as BlogPostMeta;

      return {
        ...meta,
        slug,
        content: mdContent,
      };
    }
  }

  return null;
}
