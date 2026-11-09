'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Hash,
  Lightbulb,
  type LucideIcon,
  Wrench,
} from 'lucide-react';
import { slugifyHeading } from '@/lib/heading';
import { vtKey } from '@/lib/viewTransition';
import home from '@/components/portfolio/PortfolioHome.module.css';
import styles from './Flow.module.css';

/* ------------------------------------------------------------ shell */

interface FlowShellProps {
  /** Hero-style display line above the column: the lead prints in ink, the rest muted. */
  lead: ReactNode;
  intro?: ReactNode;
  /** The page bar: its title, icon and where its back arrow leads. */
  title: string;
  icon: LucideIcon;
  back?: { href: string; label: string };
  aside?: ReactNode;
  /** Shared-element key of the page bar (defaults to this page's own key). */
  barKey: string;
  children: ReactNode;
}

/**
 * A subpage laid out as the homepage feed: the same scroll stage, the same 720px dashed column and
 * the same hero type above it. The bar on top is what the homepage section title becomes.
 */
export default function FlowShell({ lead, intro, title, icon: Icon, back = { href: '/', label: 'Back to home' }, aside, barKey, children }: FlowShellProps) {
  return (
    <div className={home.root}>
      <section className={home.left} data-scroll-root>
        <div className={home.introHero}>
          <span className={home.introCopy}>
            <strong className={home.emphasis}>{lead}</strong>
            {intro && <> {intro}</>}
          </span>
        </div>

        <div className={home.flow}>
          <header className={styles.pageBar} data-vt={barKey}>
            <Link className={styles.back} href={back.href} aria-label={back.label} title={back.label}>
              <ArrowLeft aria-hidden="true" />
            </Link>
            <h1 className={styles.pageTitle}><Icon aria-hidden="true" /><span>{title}</span></h1>
            {aside && <span className={styles.barAside}>{aside}</span>}
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ sections */

interface FlowSectionProps {
  title?: string;
  icon?: LucideIcon;
  id?: string;
  count?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}

/** One dashed band of the column, titled the way the homepage titles its sections. */
export function FlowSection({ title, icon: Icon, id, count, flush, children }: FlowSectionProps) {
  return (
    <section className={`${home.flowSection} ${flush ? home.projectsSection : ''}`}>
      {title && (
        <h2 className={home.sectionTitle} id={id}>
          {Icon && <Icon aria-hidden="true" />}
          {title}
          {count !== undefined && <span className={styles.sectionCount}>{count}</span>}
        </h2>
      )}
      {children}
    </section>
  );
}

/** The closing band: a quiet line on the left, the way onward on the right. */
export function FlowFooter({ note, href, label, direction = 'back' }: { note?: ReactNode; href: string; label: string; direction?: 'back' | 'next' }) {
  return (
    <section className={home.flowSection}>
      <div className={styles.footerNav}>
        <span>{note}</span>
        <Link href={href}>
          {direction === 'back' && <ArrowLeft aria-hidden="true" data-dir="back" />}
          {label}
          {direction === 'next' && <ArrowRight aria-hidden="true" data-dir="next" />}
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ markdown */

export function FlowMarkdown({ content }: { content: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h2: ({ children }) => <h2 id={slugifyHeading(String(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={slugifyHeading(String(children))}>{children}</h3>,
          p: ({ node, children }) => {
            const onlyImage = node?.children?.some((child) => child.type === 'element' && child.tagName === 'img');
            return onlyImage ? <>{children}</> : <p>{children}</p>;
          },
          a: ({ href = '', children }) => {
            const external = /^https?:\/\//.test(href);
            if (external || href.startsWith('mailto:') || href.startsWith('#')) {
              return <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>{children}</a>;
            }
            return <Link href={href}>{children}</Link>;
          },
          img: ({ src, alt }) => {
            if (alt === 'HUST') return <img src="/ascii-logo/HUST.png" alt={alt} className={styles.inlineLogo} />;
            return (
              <figure>
                <img src={typeof src === 'string' ? src : undefined} alt={alt || ''} loading="lazy" />
                {alt && <figcaption>{alt}</figcaption>}
              </figure>
            );
          },
        }}
      >
        {content.replace(/==([\s\S]*?)==/g, '<mark>$1</mark>')}
      </ReactMarkdown>
    </div>
  );
}

interface MarkdownPart {
  title?: string;
  body: string;
}

/** Splits markdown at its `## ` headings (outside code fences) so each becomes a column section. */
export function splitMarkdownSections(content: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [{ body: '' }];
  let fenced = false;

  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^##\s+(.+?)\s*#*$/);
    if (heading) {
      parts.push({ title: heading[1].trim(), body: '' });
    } else {
      parts[parts.length - 1].body += `${line}\n`;
    }
  }

  return parts.filter((part) => part.title || part.body.trim());
}

const SECTION_ICONS: Array<[RegExp, LucideIcon]> = [
  [/educat|school|degree/i, GraduationCap],
  [/experience|work|intern|employ/i, BriefcaseBusiness],
  [/skill|tool|stack/i, Wrench],
  [/award|honou?r|prize/i, Award],
  [/publication|paper/i, BookOpen],
  [/abstract|summary|overview/i, FileText],
  [/why|idea|interest|research/i, Lightbulb],
];

export function iconForHeading(title: string): LucideIcon {
  return SECTION_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? Hash;
}

/** Markdown rendered as a run of column sections, one per `##` heading. */
export function MarkdownSections({ content }: { content: string }) {
  return (
    <>
      {splitMarkdownSections(content).map((part, index) => (
        <FlowSection
          key={`${part.title ?? 'lead'}-${index}`}
          title={part.title}
          id={part.title ? slugifyHeading(part.title) : undefined}
          icon={part.title ? iconForHeading(part.title) : undefined}
        >
          {part.body.trim() && <FlowMarkdown content={part.body} />}
        </FlowSection>
      ))}
    </>
  );
}

/** `data-vt` for an element that stands for the page at `href`. */
export function vtAttr(href: string): { 'data-vt'?: string } {
  const key = vtKey(href);
  return key ? { 'data-vt': key } : {};
}
