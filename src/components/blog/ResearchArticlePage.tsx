'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { BlogPost } from '@/types/blog';
import { extractMarkdownHeadings } from '@/lib/heading';
import FionaMarkdown from '@/components/fiona/FionaMarkdown';
import ArticleScale from './ArticleScale';
import styles from './ResearchBlog.module.css';

interface ResearchArticlePageProps {
  post: BlogPost;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export default function ResearchArticlePage({ post }: ResearchArticlePageProps) {
  const headings = extractMarkdownHeadings(post.content);

  return (
    <div className={styles.blogShell}>
      <Link href="/" className={styles.homeLink}>
        <ArrowLeft aria-hidden="true" />
        <span>chenyu zhu</span>
      </Link>
      <Link href="/blog" className={styles.blogLink}>
        all notes <ArrowUpRight aria-hidden="true" />
      </Link>

      <ArticleScale headings={headings} />

      <article
        className={styles.article}
      >
        <header className={styles.articleHeader}>
          <h1>{post.title}</h1>
          {post.excerpt && <p className={styles.subtitle}>{post.excerpt}</p>}
          {post.image && (
            <figure className={styles.cover}>
              <img src={post.image} alt={post.title} />
            </figure>
          )}
          <div className={styles.byline}>
            <img src="/avatar.png" alt="" />
            <strong>{post.author || 'Chenyu Zhu'}</strong>
            <span>·</span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </header>

        <FionaMarkdown content={post.content} className={styles.articleBody} />

        <footer className={styles.articleFooter}>
          <span>thanks for reading.</span>
          <Link href="/blog">more research notes <ArrowUpRight /></Link>
        </footer>
      </article>
    </div>
  );
}
