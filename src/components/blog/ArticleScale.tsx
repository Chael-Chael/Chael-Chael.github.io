'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { MarkdownHeading } from '@/lib/heading';
import styles from './ResearchBlog.module.css';

interface ArticleScaleProps {
  headings: MarkdownHeading[];
}

export default function ArticleScale({ headings }: ArticleScaleProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (headings.length === 0) return;

    const updateActiveHeading = () => {
      const threshold = window.innerHeight * 0.3;
      let current = headings[0].id;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= threshold) current = heading.id;
      }

      setActiveId(current);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);
    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [headings]);

  const activeHeading = useMemo(
    () => headings.find((heading) => heading.id === activeId) ?? headings[0],
    [activeId, headings],
  );

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  if (headings.length === 0) return null;

  return (
    <>
      <aside className={styles.desktopScale} aria-label="Table of contents">
        <nav className={styles.scaleNav}>
          {headings.map((heading) => {
            const active = activeId === heading.id;
            return (
              <button
                key={heading.id}
                type="button"
                className={`${styles.scaleItem} ${active ? styles.scaleItemActive : ''} ${heading.level === 3 ? styles.scaleItemNested : ''}`}
                onClick={() => goTo(heading.id)}
                aria-current={active ? 'location' : undefined}
              >
                <span className={styles.tick} />
                <span className={styles.scaleLabel}>{heading.text}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <aside className={`${styles.mobileScale} ${mobileOpen ? styles.mobileScaleOpen : ''}`}>
        <button
          type="button"
          className={styles.mobileScaleToggle}
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
        >
          <span>{activeHeading?.text}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        <div className={styles.mobileTicks} aria-hidden="true">
          {headings.map((heading) => (
            <span key={heading.id} className={activeId === heading.id ? styles.mobileTickActive : ''} />
          ))}
        </div>
        <div className={styles.mobileScaleMenu}>
          {headings.map((heading) => (
            <button
              key={heading.id}
              type="button"
              className={activeId === heading.id ? styles.mobileMenuActive : ''}
              onClick={() => goTo(heading.id)}
            >
              {heading.text}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
