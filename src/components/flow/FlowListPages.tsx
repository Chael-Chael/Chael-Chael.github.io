'use client';

import { Award, FileText, HandHeart, LayoutList, type LucideIcon } from 'lucide-react';
import type { CardItem } from '@/types/page';
import home from '@/components/portfolio/PortfolioHome.module.css';
import FlowShell, { FlowSection, MarkdownSections, vtAttr } from './FlowShell';
import styles from './Flow.module.css';

const PAGE_ICONS: Array<[RegExp, LucideIcon]> = [
  [/award|honou?r/i, Award],
  [/service/i, HandHeart],
  [/cv|resume|curriculum/i, FileText],
];

function iconFor(title: string): LucideIcon {
  return PAGE_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? LayoutList;
}

function plain(value?: string): string | undefined {
  return value
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface CardListPageProps {
  title: string;
  description?: string;
  items: CardItem[];
  barKey: string;
}

/** Awards, services and other card pages, laid out like the homepage news list. */
export function CardListPage({ title, description, items, barKey }: CardListPageProps) {
  const count = `${items.length} ${items.length === 1 ? 'entry' : 'entries'}`;

  return (
    <FlowShell lead={`${title}.`} intro={description} title={title} icon={iconFor(title)} aside={count} barKey={barKey}>
      <FlowSection>
        <div className={home.newsList}>
          {items.map((item, index) => {
            const external = Boolean(item.link?.startsWith('http'));
            return (
              <article className={home.newsItem} key={`${item.title}-${index}`} id={item.slug}>
                <time>{item.date}</time>
                <div className={styles.cardCopy}>
                  {item.title && <strong>
                    {item.link
                      ? <a href={item.link} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} {...(external ? {} : vtAttr(item.link))}>{item.title}</a>
                      : item.title}
                  </strong>}
                  {item.subtitle && <small>{item.subtitle}</small>}
                  {item.content && <p>{plain(item.content)}</p>}
                  {item.tags && item.tags.length > 0 && <div className={styles.tagList}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
                </div>
              </article>
            );
          })}
        </div>
      </FlowSection>
    </FlowShell>
  );
}

interface TextFlowPageProps {
  title: string;
  description?: string;
  content: string;
  barKey: string;
}

/** Markdown pages (the CV): every `##` heading opens a titled band of the column. */
export function TextFlowPage({ title, description, content, barKey }: TextFlowPageProps) {
  return (
    <FlowShell lead={`${title}.`} intro={description} title={title} icon={iconFor(title)} barKey={barKey}>
      <MarkdownSections content={content} />
    </FlowShell>
  );
}
