'use client';

import { NotebookPen } from 'lucide-react';
import type { BlogPost } from '@/types/blog';
import { extractMarkdownHeadings } from '@/lib/heading';
import FlowShell, { FlowFooter, FlowSection, MarkdownSections } from '@/components/flow/FlowShell';
import flow from '@/components/flow/Flow.module.css';
import ArticleScale from './ArticleScale';

interface ResearchArticlePageProps {
  post: BlogPost;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

function shortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function ResearchArticlePage({ post }: ResearchArticlePageProps) {
  const headings = extractMarkdownHeadings(post.content).filter((heading) => heading.level === 2);

  return (
    <>
      <ArticleScale headings={headings} />
      <FlowShell
        lead={`${post.title}.`}
        intro={post.excerpt}
        title="Blogs"
        icon={NotebookPen}
        back={{ href: '/blog', label: 'All notes' }}
        aside={shortDate(post.date)}
        barKey="blog"
      >
        <FlowSection>
          <div className={flow.detailHead}>
            {post.image && <img className={flow.cover} src={post.image} alt={post.title} data-vt={`blog:${post.slug}`} />}
            <div className={flow.byline}>
              <img src="/avatar.png" alt="" />
              <strong>{post.author || 'Chenyu Zhu'}</strong>
              <span>·</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            {post.tags && post.tags.length > 0 && <div className={flow.tagList}>{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
          </div>
        </FlowSection>

        <MarkdownSections content={post.content} />

        <FlowFooter note="Thanks for reading." href="/blog" label="More research notes" />
      </FlowShell>
    </>
  );
}
