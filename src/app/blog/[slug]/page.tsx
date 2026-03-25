/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { CalendarIcon, TagIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { getPostBySlug, getAllPosts } from '@/lib/blog';

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

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link 
        href="/blog" 
        className="inline-flex items-center text-sm text-neutral-500 hover:text-accent mb-12 transition-colors group"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
        Back to Blog
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
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
                <span key={tag} className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs">
                  <TagIcon className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight">
          {post.title}
        </h1>

        {post.image && (
          <div className="aspect-video w-full relative rounded-2xl overflow-hidden shadow-2xl mb-12">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw]}
          components={{
            h2: ({ children }) => <h2 className="text-3xl font-serif font-bold text-primary mt-12 mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-2xl font-serif font-bold text-primary mt-8 mb-4">{children}</h3>,
            p: ({ children }) => <p className="mb-6 leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2">{children}</ol>,
            li: ({ children }) => <li className="pl-2">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent bg-neutral-50 dark:bg-neutral-800/50 p-6 italic my-8 rounded-r-lg">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 text-sm font-mono text-accent">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-neutral-900 text-neutral-100 p-6 rounded-xl overflow-x-auto my-8 border border-neutral-800 shadow-lg">
                {children}
              </pre>
            ),
            img: ({ src, alt }) => (
              <span className="block my-12">
                <img src={src} alt={alt} className="rounded-2xl shadow-xl mx-auto max-h-[600px] object-contain" />
                {alt && <small className="block text-center text-neutral-500 mt-4 italic font-serif">{alt}</small>}
              </span>
            ),
            a: ({ href, children }) => (
              <a href={href} className="text-accent underline decoration-accent/30 hover:decoration-accent transition-all underline-offset-4" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      
      <footer className="mt-20 pt-12 border-t border-neutral-100 dark:border-neutral-800">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-8 rounded-3xl flex items-center gap-6">
           <img src="/avatar.png" alt="Author" className="h-16 w-16 rounded-full border-2 border-accent/20" />
           <div>
             <h4 className="font-bold text-primary">Written by Chenyu Zhu</h4>
             <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">Exploring the frontiers of AI and Multimodal Research.</p>
           </div>
        </div>
      </footer>
    </article>
  );
}
