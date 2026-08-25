'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { DetailLink, DetailPair } from '@/types/showcase';
import FionaMarkdown from '@/components/fiona/FionaMarkdown';

interface FionaDetailPageProps {
  title: string;
  content: string;
  details?: DetailPair[];
  links?: DetailLink[];
  coverImage?: string;
  coverAlt?: string;
  notes?: string;
  footer?: string;
}

export default function FionaDetailPage({
  title,
  content,
  details = [],
  links = [],
  coverImage,
  coverAlt,
  notes,
  footer,
}: FionaDetailPageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="fiona-detail-shell"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.5, 0.08, 0, 0.99] }}
    >
      <Link href="/" className="fiona-close-button" aria-label="Close and return home">
        <span className="sans">×</span>
      </Link>

      <div className="fiona-page-content">
        <header className="fiona-content-title">
          <h1 className="fiona-big-title">{title}</h1>
        </header>

        {coverImage && (
          <figure className="fiona-content-cover">
            <div className="fiona-cover-image">
              <div className="fiona-lazy-image">
                <img src={coverImage} alt={coverAlt || title} loading="eager" />
              </div>
            </div>
            {coverAlt && <figcaption className="sans">{coverAlt}</figcaption>}
          </figure>
        )}

        {(details.length > 0 || links.length > 0) && (
          <aside className="fiona-content-infos">
            {details.map((detail) => (
              <div key={`${detail.label}-${detail.value}`} className="fiona-details sans">
                <div className="label">
                  <h4>{detail.label}</h4>
                </div>
                <div className="detail">
                  <p>{detail.value}</p>
                </div>
              </div>
            ))}
            {links.length > 0 && (
              <div className="fiona-details sans">
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

        <main className="fiona-content-main">
          <div className="fiona-content-text">
            <div className="fiona-content-text-text">
              <FionaMarkdown content={content} />
            </div>
            {notes && (
              <aside className="fiona-content-text-notes sans">
                <FionaMarkdown content={notes} compact />
              </aside>
            )}
          </div>
          {footer && <p className="fiona-detail-footer sans">{footer}</p>}
        </main>
      </div>
    </motion.article>
  );
}
