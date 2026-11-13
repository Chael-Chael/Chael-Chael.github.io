import fs from 'fs';
import path from 'path';
import { parse } from 'smol-toml';
import { BlogPost, BlogPostMeta, BlogPostVersion } from '@/types/blog';

/*
 * A post is `<slug>.toml` (shared meta: date, tags, cover, image, and the default title/excerpt)
 * plus one Markdown body per language:
 *   <slug>.en.md / <slug>.zh.md      body for that language
 *   <slug>.en.toml / <slug>.zh.toml  optional overrides for title / excerpt / takeaways
 * A plain `<slug>.md` is treated as the language named by `language` in the meta (default "en").
 * English is the default version whenever it exists.
 */
const BLOG_CONTENT_DIR = 'content/blog';
const LANGS = ['en', 'zh'] as const;
const LANG_SUFFIX = /\.[a-z]{2}\.toml$/;

/** A post with a [cover] table uses the generated cover from scripts/gen-covers.mjs. */
function withCover<T extends BlogPostMeta>(meta: T): T {
  return meta.cover ? { ...meta, image: `/images/blog/${meta.slug}/cover.svg` } : meta;
}

function blogDir() {
  return path.join(process.cwd(), BLOG_CONTENT_DIR);
}

function readToml<T>(file: string): T | null {
  return fs.existsSync(file) ? (parse(fs.readFileSync(file, 'utf-8')) as unknown as T) : null;
}

type Override = Partial<Pick<BlogPostVersion, 'title' | 'excerpt' | 'takeaways'>>;

function readVersions(dir: string, slug: string, meta: BlogPostMeta): BlogPostVersion[] {
  const baseLang = meta.language || 'en';
  const versions: BlogPostVersion[] = [];
  for (const lang of LANGS) {
    const langMd = path.join(dir, `${slug}.${lang}.md`);
    const plainMd = path.join(dir, `${slug}.md`);
    const mdPath = fs.existsSync(langMd) ? langMd : lang === baseLang && fs.existsSync(plainMd) ? plainMd : null;
    if (!mdPath) continue;
    const override = readToml<Override>(path.join(dir, `${slug}.${lang}.toml`)) ?? {};
    versions.push({
      lang,
      title: override.title ?? meta.title,
      excerpt: override.excerpt ?? meta.excerpt,
      takeaways: override.takeaways ?? meta.takeaways,
      content: fs.readFileSync(mdPath, 'utf-8'),
    });
  }
  return versions;
}

/** Meta as the list pages show it: the English title/excerpt when an English override exists. */
function listMeta(dir: string, slug: string, meta: BlogPostMeta): BlogPostMeta {
  const en = readToml<Override>(path.join(dir, `${slug}.en.toml`));
  return en ? { ...meta, ...en } : meta;
}

// `locale` is kept for call-site compatibility; languages now live side by side in content/blog.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAllPosts(locale?: string): BlogPostMeta[] {
  const dir = blogDir();
  if (!fs.existsSync(dir)) return [];

  const posts = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.toml') && !LANG_SUFFIX.test(f))
    .map((file) => {
      const slug = file.replace('.toml', '');
      const meta = readToml<BlogPostMeta>(path.join(dir, file))!;
      return withCover(listMeta(dir, slug, { ...meta, slug }));
    });

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getPostBySlug(slug: string, locale?: string): BlogPost | null {
  const dir = blogDir();
  const meta = readToml<BlogPostMeta>(path.join(dir, `${slug}.toml`));
  if (!meta) return null;

  const versions = readVersions(dir, slug, { ...meta, slug });
  if (versions.length === 0) return null;
  const primary = versions[0];

  return withCover({
    ...meta,
    slug,
    title: primary.title,
    excerpt: primary.excerpt,
    takeaways: primary.takeaways,
    language: primary.lang,
    content: primary.content,
    versions,
  });
}
