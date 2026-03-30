'use client';

import { motion } from 'framer-motion';
import { BlogPostMeta } from '@/types/blog';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPostMeta[];
  title: string;
  description?: string;
  delay?: number;
}

export default function BlogList({ posts, title, description, delay = 0.4 }: BlogListProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="mb-16 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6">
          {title}
        </h1>
        {description && (
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto italic font-serif leading-relaxed">
            {description}
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-12">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} delay={delay} />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-neutral-500 italic">
            Stay tuned! More stories coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
