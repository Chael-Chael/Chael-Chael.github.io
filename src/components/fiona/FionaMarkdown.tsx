'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { slugifyHeading } from '@/lib/heading';

interface FionaMarkdownProps {
  content: string;
  className?: string;
  compact?: boolean;
}

export default function FionaMarkdown({ content, className = '', compact = false }: FionaMarkdownProps) {
  return (
    <div className={`fiona-markdown ${compact ? 'fiona-markdown-compact' : ''} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({ children }) => {
            const id = slugifyHeading(String(children));
            return <h1 id={id}>{children}</h1>;
          },
          h2: ({ children }) => {
            const id = slugifyHeading(String(children));
            return <h2 id={id}>{children}</h2>;
          },
          h3: ({ children }) => {
            const id = slugifyHeading(String(children));
            return <h3 id={id}>{children}</h3>;
          },
          p: ({ node, children }) => {
            const containsImage = node?.children?.some(
              (child) => child.type === 'element' && child.tagName === 'img',
            );
            return containsImage ? <>{children}</> : <p>{children}</p>;
          },
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            if (alt === 'HUST') {
              return <img src="/HUST_night.png" alt={alt} className="fiona-inline-logo" />;
            }

            return (
              <figure className="fiona-markdown-figure">
                <img src={src} alt={alt || ''} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
              </figure>
            );
          },
          mark: ({ children }) => <mark>{children}</mark>,
        }}
      >
        {content.replace(/==([\s\S]*?)==/g, '<mark>$1</mark>')}
      </ReactMarkdown>
    </div>
  );
}
