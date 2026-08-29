'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { BlogPostMeta } from '@/types/blog';
import styles from './ResearchBlog.module.css';

interface ResearchBlogIndexProps {
  title: string;
  description?: string;
  posts: BlogPostMeta[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function ResearchBlogIndex({ title, description, posts }: ResearchBlogIndexProps) {
  return (
    <div className={styles.blogShell}>
      <Link href="/" className={styles.homeLink}>
        <ArrowLeft aria-hidden="true" />
        <span>chenyu zhu</span>
      </Link>

      <main
        className={styles.index}
      >
        <header className={styles.indexHeader}>
          <span>notes on intelligence, generation, and worlds</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </header>

        <section className={styles.postList} aria-label="Blog posts">
          {posts.length > 0 ? posts.map((post, index) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postRow}>
              <span className={styles.postNumber}>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.postCopy}>
                <div className={styles.postMeta}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  {post.tags?.[0] && <span>{post.tags[0]}</span>}
                </div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
              </div>
              {post.image && <img src={post.image} alt="" />}
              <ArrowUpRight className={styles.postArrow} aria-hidden="true" />
            </Link>
          )) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyTick} />
              <p>research notes are being prepared.<br />the first one will live here soon.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
