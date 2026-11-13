'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Code2, NotebookPen } from 'lucide-react';
import type { ShowcaseItem } from '@/types/showcase';
import FlowShell, { FlowSection, vtAttr } from '@/components/flow/FlowShell';
import flow from '@/components/flow/Flow.module.css';
import homeStyles from './PortfolioHome.module.css';

type IndexVariant = 'projects' | 'publications' | 'blog';

interface PortfolioIndexPageProps {
  title: string;
  description?: string;
  variant: IndexVariant;
  items: ShowcaseItem[];
}

/** Bar titles and icons match the homepage section each page grows out of. */
const VARIANTS: Record<IndexVariant, { bar: string; icon: typeof BookOpen; key: string; noun: [string, string] }> = {
  publications: { bar: 'Publications', icon: BookOpen, key: 'publications', noun: ['paper', 'papers'] },
  projects: { bar: 'Open Source Projects', icon: Code2, key: 'open-source', noun: ['project', 'projects'] },
  blog: { bar: 'Blogs', icon: NotebookPen, key: 'blog', noun: ['note', 'notes'] },
};

function PublicationRow({ item }: { item: ShowcaseItem }) {
  return (
    <article className={homeStyles.publicationEntry}>
      <Link className={homeStyles.workRow} href={item.href}>
        {item.image && <span className={homeStyles.publicationPreview}><img src={item.image} alt="" {...vtAttr(item.href)} /><small>{item.date}</small></span>}
        <span className={homeStyles.workCopy}>
          <strong>{item.title}</strong>
          <small className={homeStyles.publicationAuthors}>{item.authors?.map((author, index) => <span key={`${author.name}-${index}`}>{author.isHighlighted ? <strong>{author.name}</strong> : author.name}{author.superscript?.includes('*') && <sup>*</sup>}{index < item.authors!.length - 1 && ', '}</span>)}</small>
          <small className={homeStyles.publicationMeta}>{item.badge && <span>{item.badge}</span>}{item.meta}</small>
        </span>
        <ArrowRight aria-hidden="true" />
      </Link>
      {item.links && item.links.length > 0 && (
        <div className={homeStyles.publicationActions}>
          {item.links.map((link) => (
            <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>{link.label} <ArrowUpRight aria-hidden="true" /></a>
          ))}
        </div>
      )}
    </article>
  );
}

export default function PortfolioIndexPage({ title, description, variant, items }: PortfolioIndexPageProps) {
  const [repoStars, setRepoStars] = useState<Record<string, number>>({});
  const config = VARIANTS[variant];

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

  // publications fall into one band per year, newest first
  const years = useMemo(() => {
    if (variant !== 'publications') return [];
    const groups = new Map<string, ShowcaseItem[]>();
    for (const item of items) {
      const year = (item.date || item.meta || '').match(/\d{4}/)?.[0] ?? 'Other';
      groups.set(year, [...(groups.get(year) ?? []), item]);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [items, variant]);

  const count = `${items.length} ${items.length === 1 ? config.noun[0] : config.noun[1]}`;

  return (
    <FlowShell lead={`${title}.`} intro={description} title={config.bar} icon={config.icon} aside={count} barKey={config.key}>
      {variant === 'projects' && (
        <section className={`${homeStyles.flowSection} ${homeStyles.projectsSection}`}>
          <div className={homeStyles.projectGrid}>
            {items.map((item) => {
              const meta = repoStars[item.id] === undefined ? item.meta : item.meta?.replace(/^★\s*\d+/, `★ ${repoStars[item.id]}`);
              const [stars, language] = meta?.split(/\s*·\s*/) ?? [];
              return (
                <div className={homeStyles.projectCell} key={item.id}>
                  <a className={homeStyles.projectCard} href={item.href} target="_blank" rel="noreferrer">
                    <span className={homeStyles.projectFrame}>
                      <span className={homeStyles.projectStage}>
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
        </section>
      )}

      {variant === 'publications' && years.map(([year, group]) => (
        <FlowSection key={year} title={year} icon={CalendarDays} count={group.length}>
          <div className={homeStyles.workList}>
            {group.map((item) => <PublicationRow item={item} key={item.id} />)}
          </div>
        </FlowSection>
      ))}

      {variant === 'blog' && (
        <FlowSection>
          {items.length > 0 ? (
            <div className={homeStyles.workList}>
              {items.map((item) => (
                <Link className={`${homeStyles.workRow} ${homeStyles.coverRow}`} href={item.href} key={item.id}>
                  {item.image ? <img src={item.image} alt="" {...vtAttr(item.href)} /> : <span />}
                  <span className={homeStyles.workCopy}>
                    <strong>{item.title}</strong>
                    {item.description && <small>{item.description}</small>}
                    {item.meta && <small>{item.meta}</small>}
                  </span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <p className={flow.empty}>Research notes are being prepared. The first one will live here soon.</p>
          )}
        </FlowSection>
      )}

    </FlowShell>
  );
}
