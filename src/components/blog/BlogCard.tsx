/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { BlogPostMeta } from '@/types/blog';

interface BlogCardProps {
  post: BlogPostMeta;
  index: number;
}

export default function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <Link href={`/blog/${post.slug}`} className="relative h-48 overflow-hidden block">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
             <span className="text-neutral-400 dark:text-neutral-600 font-serif italic text-2xl opacity-20">{post.title}</span>
          </div>
        )}
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-4 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3.5 w-3.5" />
            {(() => {
              const d = new Date(post.date);
              return `${String(d.getFullYear()).slice(-2)}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
            })()}
          </span>
          {post.tags && post.tags.length > 0 && (
            <span className="flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5" />
              {post.tags[0]}
            </span>
          )}
        </div>
        
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-accent transition-colors leading-tight">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3 mb-6 flex-grow">
          {post.excerpt}
        </p>
        
        <Link 
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-accent text-sm font-semibold hover:gap-2 transition-all"
        >
          Read More
          <span className="ml-1">→</span>
        </Link>
      </div>
    </motion.div>
  );
}
