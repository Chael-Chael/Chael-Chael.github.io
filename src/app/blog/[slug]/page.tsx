/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { CalendarIcon, TagIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import 'katex/dist/katex.min.css';

import { getPostBySlug, getAllPosts } from '@/lib/blog';
import TableOfContents from '@/components/blog/TableOfContents';

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
}

function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_~`]/g, '');
    const id = slugify(text);
    headings.push({ level, id, text });
  }
  return headings;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);

  return (
    <div className="relative min-h-screen">
      <TableOfContents headings={headings} />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/blog" 
        className="inline-flex items-center text-sm text-neutral-500 hover:text-accent mb-8 transition-colors group"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Blog
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4 text-sm text-neutral-500 dark:text-neutral-600">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            {(() => {
              const d = new Date(post.date);
              return `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            })()}
          </span>
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-200 px-2 py-0.5 rounded-full text-xs">
                  <TagIcon className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6 leading-tight">
          {post.title}
        </h1>

        {post.image && (
          <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-2xl mb-8">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-700">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            h1: ({ children }) => {
              const id = slugify(String(children));
              return <h1 id={id} className="text-4xl font-tiempos-headline font-normal text-primary mt-10 mb-4 border-b-2 border-accent/20 pb-2">{children}</h1>;
            },
            h2: ({ children }) => {
              const id = slugify(String(children));
              return <h2 id={id} className="text-3xl font-tiempos-headline font-normal text-primary mt-8 mb-4 border-b border-neutral-100 dark:border-neutral-200 pb-2">{children}</h2>;
            },
            h3: ({ children }) => {
              const id = slugify(String(children));
              return <h3 id={id} className="text-2xl font-tiempos-headline font-normal text-primary mt-6 mb-3">{children}</h3>;
            },
            p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="pl-2">{children}</li>,
            mark: ({ children }) => (
              <mark className="bg-accent/20 text-accent font-medium rounded px-1 group-dark:bg-accent/30 selection:bg-accent selection:text-white">
                {children}
              </mark>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent bg-neutral-50 dark:bg-neutral-200/50 p-6 italic my-8 rounded-r-lg">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-neutral-100 dark:bg-neutral-200 rounded px-1.5 py-0.5 text-sm font-mono text-accent">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-neutral-900 text-neutral-100 p-6 rounded-xl overflow-x-auto my-8 border border-neutral-800 shadow-lg">
                {children}
              </pre>
            ),
            img: ({ src, alt }) => {
              if (alt === 'HUST') {
                return (
                  <span className="inline-block align-middle mx-1">
                    <img src="/HUST.png" alt={alt} className="h-5 w-auto dark:hidden" />
                    <img src="/HUST_night.png" alt={alt} className="hidden dark:block h-5 w-auto" />
                  </span>
                );
              }
              return (
                <span className="block my-6">
                  <img src={src} alt={alt} className="rounded-2xl shadow-xl mx-auto max-h-[600px] object-contain" />
                  {alt && <small className="block text-center text-neutral-500 mt-2 italic font-tiempos">{alt}</small>}
                </span>
              );
            },
            a: ({ href, children }) => (
              <a href={href} className="text-accent underline decoration-accent/30 hover:decoration-accent transition-all underline-offset-4" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            em: ({ children }) => <em className="font-tiempos italic">{children}</em>,
          }}
        >
          {post.content.replace(/==([\s\S]*?)==/g, '<mark>$1</mark>')}
        </ReactMarkdown>
      </div>
      
      <footer className="mt-20 pt-12 border-t border-neutral-100 dark:border-neutral-200">
        <div className="bg-neutral-50 dark:bg-neutral-100/50 p-8 rounded-3xl flex items-center gap-6">
           <img src="/avatar.png" alt="Author" className="h-16 w-16 rounded-full border-2 border-accent/20" />
           <div>
             <h4 className="font-bold text-primary">Written by Chenyu Zhu</h4>
             <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">Exploring the frontiers of AI and Multimodal Research.</p>
           </div>
        </div>
      </footer>
    </article>
    </div>
  );
}
