'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { DetailLink, DetailPair } from '@/types/showcase';
import EditorialMarkdown from '@/components/editorial/EditorialMarkdown';

interface EditorialDetailPageProps {
  title: string;
  content: string;
  details?: DetailPair[];
  links?: DetailLink[];
  coverImage?: string;
  coverAlt?: string;
  notes?: string;
  footer?: string;
}

export default function EditorialDetailPage({
  title,
  content,
  details = [],
  links = [],
  coverImage,
  coverAlt,
  notes,
  footer,
}: EditorialDetailPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="editorial-detail-shell"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.5, 0.08, 0, 0.99] }}
    >
      <Link href="/" className="editorial-close-button" aria-label="Close and return home">
        <span className="sans">×</span>
      </Link>

      <div className="editorial-page-content">
        <header className="editorial-content-title">
          <h1 className="editorial-big-title">{title}</h1>
        </header>

        {coverImage && (
          <figure className="editorial-content-cover">
            <div className="editorial-cover-image">
              <div className="editorial-lazy-image">
                <img src={coverImage} alt={coverAlt || title} loading="eager" />
              </div>
            </div>
            {coverAlt && <figcaption className="sans">{coverAlt}</figcaption>}
          </figure>
        )}

        {(details.length > 0 || links.length > 0) && (
          <aside className="editorial-content-infos">
            {details.map((detail) => (
              <div key={`${detail.label}-${detail.value}`} className="editorial-details sans">
                <div className="label">
                  <h4>{detail.label}</h4>
                </div>
                <div className="detail">
                  <p>{detail.value}</p>
                </div>
              </div>
            ))}
            {links.length > 0 && (
              <div className="editorial-details sans">
                <div className="label">
                  <h4>Links</h4>
                </div>
                <div className="detail">
                  {links.map((link) => (
                    <p key={link.href}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        <main className="editorial-content-main">
          <div className="editorial-content-text">
            <div className="editorial-content-text-text">
              <EditorialMarkdown content={content} />
            </div>
            {notes && (
              <aside className="editorial-content-text-notes sans">
                <EditorialMarkdown content={notes} compact />
              </aside>
            )}
          </div>
          {footer && <p className="editorial-detail-footer sans">{footer}</p>}
        </main>
      </div>
    </motion.article>
  );
}
