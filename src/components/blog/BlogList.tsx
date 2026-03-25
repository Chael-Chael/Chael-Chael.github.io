'use client';

import { motion } from 'framer-motion';
import { BlogPostMeta } from '@/types/blog';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPostMeta[];
  title: string;
  description?: string;
}

export default function BlogList({ posts, title, description }: BlogListProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto italic">
            {description}
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
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
