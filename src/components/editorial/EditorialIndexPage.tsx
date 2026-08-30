'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { ShowcaseItem } from '@/types/showcase';
import EditorialMarkdown from '@/components/editorial/EditorialMarkdown';

interface EditorialIndexPageProps {
  title: string;
  description?: string;
  items: ShowcaseItem[];
  content?: string;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export default function EditorialIndexPage({ title, description, items, content }: EditorialIndexPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="editorial-detail-shell"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.5, 0.08, 0, 0.99] }}
    >
      <Link href="/" className="editorial-close-button" aria-label="Close and return home">
        <span className="sans">×</span>
      </Link>
      <div className="editorial-page-content">
        <header className="editorial-content-title">
          <h1 className="editorial-big-title">{title}</h1>
        </header>

        <main className="editorial-content-main">
          {description && <p className="editorial-index-description sans">{description}</p>}

          {items.length > 0 && (
            <ul className="editorial-index-list">
              {items.map((item) => (
                <li key={item.id} id={item.id}>
                  <Link
                    href={item.href}
                    target={item.external || isExternal(item.href) ? '_blank' : undefined}
                    rel={item.external || isExternal(item.href) ? 'noopener noreferrer' : undefined}
                  >
                    <span>{item.title}</span>
                    {item.image && (
                      <figure className="editorial-page-thumb" aria-hidden="true">
                        <img src={item.image} alt="" loading="lazy" />
                      </figure>
                    )}
                  </Link>
                  {item.meta && <p className="sans">{item.meta}</p>}
                  {item.description && <p className="editorial-item-description">{item.description}</p>}
                </li>
              ))}
            </ul>
          )}

          {content && <EditorialMarkdown content={content} />}
        </main>
      </div>
    </motion.article>
  );
}
