/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { BlogPostMeta } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
  index: number;
  delay?: number;
}

export default function BlogCard({ post, index, delay = 0.4 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: delay + 0.1 * index }}
      className="group bg-white dark:bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 hover:border-accent/30 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col md:flex-row h-full min-h-[320px]"
    >
      <Link href={`/blog/${post.slug}`} className="relative h-64 md:h-auto md:w-[38%] overflow-hidden block">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-neutral-50 dark:bg-neutral-200/50 flex items-center justify-center p-8">
             <span className="text-neutral-400 dark:text-neutral-600 font-serif italic text-2xl opacity-20 text-center leading-tight">{post.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent md:hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="p-8 md:p-10 flex flex-col flex-grow md:w-[62%]">
        <div className="flex items-center flex-wrap gap-4 mb-5 text-sm font-medium text-neutral-500 dark:text-neutral-600">
          <span className="flex items-center gap-2 px-3 py-1 bg-neutral-100 dark:bg-neutral-200 rounded-full text-xs">
            <CalendarIcon className="h-4 w-4" />
            {(() => {
              const d = new Date(post.date);
              return `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            })()}
          </span>
          {post.tags && post.tags.length > 0 && (
            <span className="flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">
              <TagIcon className="h-4 w-4" />
              {post.tags[0]}
            </span>
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-4 group-hover:text-accent transition-colors leading-tight decoration-accent/0 group-hover:decoration-accent/10 underline underline-offset-4">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-neutral-600 dark:text-neutral-600 text-lg leading-relaxed line-clamp-2 md:line-clamp-3 mb-8 flex-grow">
          {post.excerpt}
        </p>
        
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-accent text-sm font-bold tracking-wider hover:translate-x-2 transition-transform uppercase"
        >
          Read the full story
          <span className="ml-2 font-serif text-xl">→</span>
        </Link>
      </div>
    </motion.div>
  );
}
