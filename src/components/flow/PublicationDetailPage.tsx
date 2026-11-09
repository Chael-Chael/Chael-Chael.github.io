'use client';

import { useState } from 'react';
import { ArrowUpRight, BookOpen, Check, Copy, FileText, Info, Quote } from 'lucide-react';
import type { Publication } from '@/types/publication';
import type { DetailLink, DetailPair } from '@/types/showcase';
import home from '@/components/portfolio/PortfolioHome.module.css';
import FlowShell, { FlowFooter, FlowMarkdown, FlowSection } from './FlowShell';
import styles from './Flow.module.css';

interface PublicationDetailPageProps {
  publication: Publication;
  /** `publications:<id>`, shared with the thumbnail that leads here. */
  coverKey: string;
  venue?: string;
  cover?: string;
  details: DetailPair[];
  links: DetailLink[];
}

function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={styles.codeBlock}>
      <pre>{text}</pre>
      <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function PublicationDetailPage({ publication, coverKey, venue, cover, details, links }: PublicationDetailPageProps) {
  const summary = publication.description || publication.summary || publication.abstract;
  const where = publication.journal || publication.venue;
  const intro = [venue, publication.year].filter(Boolean).join(', ');

  return (
    <FlowShell
      lead={publication.title}
      intro={intro ? `${intro}.` : undefined}
      title="Publication"
      icon={BookOpen}
      back={{ href: '/publications', label: 'All publications' }}
      aside={publication.year}
      barKey="publications"
    >
      <FlowSection>
        <div className={styles.detailHead}>
          {cover && <img className={styles.cover} src={cover} alt={publication.badge || publication.title} data-vt={coverKey} />}
          <p className={styles.detailAuthors}>
            {publication.authors.map((author, index) => (
              <span key={`${author.name}-${index}`}>
                {author.isHighlighted ? <strong>{author.name}</strong> : author.name}
                {author.superscript?.includes('*') && <sup>*</sup>}
                {author.isCorresponding && <sup>†</sup>}
                {index < publication.authors.length - 1 && ', '}
              </span>
            ))}
          </p>
          {(publication.conference || where) && (
            <p className={styles.detailMeta}>{publication.conference && <span>{publication.conference}</span>}{[where, publication.year].filter(Boolean).join(' / ')}</p>
          )}
          {links.length > 0 && (
            <div className={`${home.publicationActions} ${styles.detailActions}`}>
              {links.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.href}>{link.label} <ArrowUpRight aria-hidden="true" /></a>)}
            </div>
          )}
        </div>
      </FlowSection>

      {summary && (
        <FlowSection title="Abstract" icon={FileText}>
          <FlowMarkdown content={summary} />
        </FlowSection>
      )}

      {details.length > 0 && (
        <FlowSection title="Details" icon={Info}>
          <dl className={styles.pairList}>
            {details.map((pair) => (
              <div className={styles.pair} key={pair.label}>
                <dt>{pair.label}</dt>
                <dd>{pair.value}</dd>
              </div>
            ))}
          </dl>
        </FlowSection>
      )}

      {publication.bibtex && (
        <FlowSection title="BibTeX" icon={Quote}>
          <CopyBlock text={publication.bibtex} />
        </FlowSection>
      )}

      <FlowFooter note="Chenyu Zhu / Research notes and publications" href="/publications" label="All publications" />
    </FlowShell>
  );
}
