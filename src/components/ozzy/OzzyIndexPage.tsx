'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ShowcaseItem } from '@/types/showcase';
import homeStyles from './OzzyHome.module.css';
import styles from './OzzyIndexPage.module.css';

type IndexVariant = 'projects' | 'publications' | 'blog';

interface OzzyIndexPageProps {
  title: string;
  variant: IndexVariant;
  items: ShowcaseItem[];
}

const PROJECT_THEMES = [
  { background: 'radial-gradient(circle at 18% 18%, #93a4ff 0 16%, transparent 44%), linear-gradient(135deg, #344df4, #6d7dff)', label: '#fff' },
  { background: 'radial-gradient(circle at 78% 22%, #f3d4e7 0 14%, transparent 42%), linear-gradient(135deg, #c5b8ef, #eee8fa)', label: '#49396f' },
  { background: 'radial-gradient(circle at 22% 28%, #df4d1e 0 10%, transparent 42%), linear-gradient(135deg, #080504, #351108)', label: '#ff713d' },
  { background: 'radial-gradient(circle at 72% 18%, #fff 0 12%, transparent 40%), linear-gradient(135deg, #cbdcff, #78a4ff)', label: '#164eaf' },
] as const;

export default function OzzyIndexPage({ title, variant, items }: OzzyIndexPageProps) {
  const [repoStars, setRepoStars] = useState<Record<string, number>>({});

  useEffect(() => {
    if (variant !== 'projects') return;
    const controller = new AbortController();
    const repositories = items.filter((item) => item.href.startsWith('https://github.com/'));

    void Promise.all(repositories.map(async (item) => {
      try {
        const repository = new URL(item.href).pathname.replace(/^\//, '');
        const response = await fetch(`https://api.github.com/repos/${repository}`, {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        });
        if (!response.ok) return null;
        const result = await response.json() as { stargazers_count?: number };
        return typeof result.stargazers_count === 'number' ? [item.id, result.stargazers_count] as const : null;
      } catch {
        return null;
      }
    })).then((entries) => {
      if (!controller.signal.aborted) setRepoStars(Object.fromEntries(entries.filter((entry) => entry !== null)));
    });

    return () => controller.abort();
  }, [items, variant]);

  return (
    <div className={styles.root}>
      <div className={styles.sky} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/" aria-label="Back to home"><ArrowLeft aria-hidden="true" /></Link>
        <h1>{title}</h1>
      </header>

      <section className={`${styles.content} ${variant === 'projects' ? styles.projectContent : ''}`}>
        {variant === 'projects' ? (
          <div className={homeStyles.projectGrid}>
            {items.map((item, index) => {
              const meta = repoStars[item.id] === undefined ? item.meta : item.meta?.replace(/^★\s*\d+/, `★ ${repoStars[item.id]}`);
              const [stars, language] = meta?.split(/\s*·\s*/) ?? [];
              const theme = PROJECT_THEMES[index % PROJECT_THEMES.length];

              return (
                <div className={homeStyles.projectCell} key={item.id}>
                  <a className={homeStyles.projectCard} href={item.href} target="_blank" rel="noreferrer">
                    <span className={homeStyles.projectFrame}>
                      <span className={homeStyles.projectStage} style={{ '--project-hover-bg': theme.background, '--project-hover-label': theme.label } as CSSProperties}>
                        <span className={homeStyles.projectLabel}>{item.id === 'tmpo' ? 'Paper & Code' : 'GitHub Repository'}</span>
                        <span className={homeStyles.projectScreenshot}>{item.image && <img src={item.image} alt="" />}</span>
                      </span>
                    </span>
                    <span className={homeStyles.projectDetails}>
                      <span className={homeStyles.projectTitleRow}>
                        <strong>{item.title}</strong>
                        <span className={homeStyles.projectStars} aria-live="polite">{stars}</span>
                      </span>
                      <span className={homeStyles.projectDescription}>{item.description}</span>
                      <span className={homeStyles.projectFooter}>
                        <span className={homeStyles.projectCta}>View Project <ArrowUpRight aria-hidden="true" /></span>
                        <em>{language}</em>
                      </span>
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={homeStyles.workList}>
            {items.map((item) => (
              <article className={variant === 'publications' ? homeStyles.publicationEntry : undefined} key={item.id}>
                <Link className={homeStyles.workRow} href={item.href}>
                  {item.image && <img src={item.image} alt="" />}
                  <span className={homeStyles.workCopy}>
                    <strong>{item.title}</strong>
                    <small>{item.meta || item.description}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
                {variant === 'publications' && item.links && (
                  <div className={homeStyles.publicationActions}>
                    {item.links.map((link) => (
                      <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>{link.label} <ArrowUpRight aria-hidden="true" /></a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      <div className={styles.floor} aria-hidden="true" />
    </div>
  );
}
