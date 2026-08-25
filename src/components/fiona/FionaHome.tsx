'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Github, GraduationCap, Mail } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ShowcaseHomeLocaleData, ShowcaseItem, ShowcaseKind, ShowcaseSection } from '@/types/showcase';
import FionaMarkdown from '@/components/fiona/FionaMarkdown';

interface FionaHomeProps {
  data: ShowcaseHomeLocaleData;
}

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith('mailto:');
}

function ShowcaseThumb({ item }: { item: ShowcaseItem }) {
  if (!item.image) return null;

  return (
    <figure className="fiona-page-thumb" aria-hidden="true">
      <img src={item.image} alt="" loading="lazy" />
    </figure>
  );
}

function HeaderSocialLinks({ social }: { social: ShowcaseHomeLocaleData['social'] }) {
  const links = [
    social.email
      ? {
          label: 'Email',
          href: `mailto:${social.email}`,
          icon: Mail,
          external: false,
        }
      : null,
    social.google_scholar
      ? {
          label: 'Google Scholar',
          href: social.google_scholar,
          icon: GraduationCap,
          external: true,
        }
      : null,
    social.github
      ? {
          label: 'GitHub',
          href: social.github,
          icon: Github,
          external: true,
        }
      : null,
  ].filter((link): link is {
    label: string;
    href: string;
    icon: LucideIcon;
    external: boolean;
  } => Boolean(link));

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="fiona-section-socials" aria-label="Profile links">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            title={link.label}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
          >
            <Icon aria-hidden="true" />
          </a>
        );
      })}
    </div>
  );
}

function InlineItemDetail({
  item,
  sectionTitle,
  onClose,
  reduceMotion,
}: {
  item: ShowcaseItem;
  sectionTitle: string;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const external = item.external || isExternal(item.href);

  return (
    <motion.article
      className="fiona-item-layer"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: '100%' }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.5, 0.08, 0, 0.99] }}
      aria-modal="false"
    >
      <header className="fiona-item-layer-header sans">
        <span>{sectionTitle}</span>
        <button type="button" onClick={onClose} aria-label="Close item detail">×</button>
      </header>

      <div className={`fiona-inline-detail ${item.image ? 'has-image' : ''}`}>
        <div className="fiona-inline-detail-heading">
          <h3>{item.title}</h3>
        </div>

        <dl className="fiona-inline-detail-meta sans">
          {item.meta && (
            <>
              <dt>Details</dt>
              <dd>{item.meta}</dd>
            </>
          )}
          <dt>Type</dt>
          <dd>{item.kind}</dd>
          <dt>Link</dt>
          <dd>
            <a
              href={item.href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
            >
              {external ? 'Open link' : 'Open full page'}
            </a>
          </dd>
        </dl>

        {item.image && (
          <figure className="fiona-inline-detail-media">
            <img src={item.image} alt={item.title} loading="lazy" />
          </figure>
        )}

        <div className="fiona-inline-detail-copy">
          {item.description ? (
            <p>{item.description}</p>
          ) : (
            <p className="sans">More details are available from the linked page.</p>
          )}
          <button type="button" className="fiona-inline-back sans" onClick={onClose}>
            Back to list
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function SectionList({
  items,
  selectedItem,
  previewedItem,
  onSelect,
  onPreview,
  onClearPreview,
  sectionKind,
  canPreview,
}: {
  items: ShowcaseItem[];
  selectedItem: ShowcaseItem | null;
  previewedItem: ShowcaseItem | null;
  onSelect: (item: ShowcaseItem) => void;
  onPreview: (item: ShowcaseItem) => void;
  onClearPreview: () => void;
  sectionKind: ShowcaseKind;
  canPreview: boolean;
}) {
  if (items.length === 0) {
    return <p className="fiona-section-note sans">More soon.</p>;
  }

  const isSpacedList = sectionKind === 'news' || sectionKind === 'publication' || sectionKind === 'card';
  const showMetaLabel = sectionKind === 'news' || sectionKind === 'publication' || sectionKind === 'card';
  const getMetaLabel = (item: ShowcaseItem) => {
    if (!item.meta) return null;
    if (sectionKind === 'publication') {
      return item.meta.split('/')[0]?.split(',')[0]?.trim() || null;
    }

    return item.meta;
  };

  return (
    <ul className={`fiona-pages-list ${isSpacedList ? 'fiona-pages-list--spaced' : ''} ${showMetaLabel ? 'fiona-pages-list--labeled' : ''}`}>
      {items.map((item) => {
        const metaLabel = getMetaLabel(item);

        return (
          <li
            key={item.id}
            className={`fiona-page-title ${item.image ? 'has-thumb' : ''} ${selectedItem?.id === item.id ? 'is-selected' : ''} ${previewedItem?.id === item.id ? 'is-previewed' : ''}`}
            onMouseEnter={() => {
              if (canPreview) onPreview(item);
            }}
            onMouseLeave={() => {
              if (canPreview) onClearPreview();
            }}
            onFocus={() => {
              if (canPreview) onPreview(item);
            }}
            onBlur={() => {
              if (canPreview) onClearPreview();
            }}
          >
            {showMetaLabel && metaLabel && (
              <span className={`fiona-page-meta fiona-page-meta--${sectionKind}`}>{metaLabel}</span>
            )}
            <button
              type="button"
              className="fiona-page-item-button"
              onClick={() => onSelect(item)}
              aria-expanded={selectedItem?.id === item.id}
            >
              <span>{item.title}</span>
              <ShowcaseThumb item={item} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260604_125109_19424216-4e2a-4560-b9f2-f1b5f6eb2c2e.mp4';
  // 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4';

function SectionPreview({ item, reduceMotion }: { item: ShowcaseItem; reduceMotion: boolean }) {
  return (
    <motion.div
      key={item.id}
      className={`fiona-section-preview ${item.image ? 'has-image' : 'is-placeholder'}`}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 28, scaleY: 0.94 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scaleY: 0.96 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.62, ease: [0.5, 0.08, 0, 0.99] }}
      aria-hidden="true"
    >
      {item.image ? (
        <img className="fiona-section-preview-image" src={item.image} alt="" loading="lazy" />
      ) : (
        <div className="fiona-section-preview-placeholder">
          <span>{item.title}</span>
        </div>
      )}
      <div className="fiona-section-preview-caption sans">
        <span>{item.kind}</span>
        {item.meta && <span>{item.meta}</span>}
      </div>
    </motion.div>
  );
}

function githubLabel(href: string): string {
  try {
    const url = new URL(href);
    if (url.hostname.toLowerCase().includes('github.com')) {
      return url.pathname.replace(/^\/|\/$/g, '') || href;
    }
  } catch {
    return href;
  }

  return href;
}

function AboutSection({
  section,
  social,
}: {
  section: ShowcaseSection;
  social: ShowcaseHomeLocaleData['social'];
}) {
  const email = social.email || section.email;
  const contactLinks = [
    email
      ? {
          label: 'Email',
          value: email,
          href: `mailto:${email}`,
          external: false,
        }
      : null,
    social.google_scholar
      ? {
          label: 'Google Scholar',
          value: 'Profile',
          href: social.google_scholar,
          external: true,
        }
      : null,
    social.github
      ? {
          label: 'Github',
          value: githubLabel(social.github),
          href: social.github,
          external: true,
        }
      : null,
  ].filter((link): link is {
    label: string;
    value: string;
    href: string;
    external: boolean;
  } => Boolean(link));

  return (
    <div className="fiona-about-block">
      {section.intro && <FionaMarkdown content={section.intro} compact />}
      {section.items.length > 0 && (
        <>
          <h3 className="fiona-about-list-title sans">Research Interest</h3>
          <ul className="fiona-about-list sans">
            {section.items.map((item) => (
              <li key={item.id}>
                {item.meta && <span>{item.meta}</span>}
                {item.href && item.href !== '/' ? <Link href={item.href}>{item.title}</Link> : <strong>{item.title}</strong>}
              </li>
            ))}
          </ul>
        </>
      )}
      {contactLinks.length > 0 && (
        <div className="fiona-mail fiona-contact-list sans">
          {contactLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              <strong>{link.label}:</strong> {link.value}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function ShowcaseSectionPanel({
  section,
  index,
  isActive,
  isHovered,
  isPinned,
  selectedItem,
  previewedItem,
  social,
  onActivate,
  onClose,
  onSelectItem,
  onPreviewItem,
  onClearPreview,
  onSectionHover,
  onSectionLeave,
  reduceMotion,
  canHover,
}: {
  section: ShowcaseSection;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  isPinned: boolean;
  selectedItem: ShowcaseItem | null;
  previewedItem: ShowcaseItem | null;
  social: ShowcaseHomeLocaleData['social'];
  onActivate: (section: ShowcaseSection) => void;
  onClose: () => void;
  onSelectItem: (item: ShowcaseItem) => void;
  onPreviewItem: (item: ShowcaseItem) => void;
  onClearPreview: () => void;
  onSectionHover: (section: ShowcaseSection) => void;
  onSectionLeave: (section: ShowcaseSection) => void;
  reduceMotion: boolean;
  canHover: boolean;
}) {
  const canPreviewItems = canHover && isActive && section.kind !== 'about' && section.kind !== 'news';
  const isVideoHero = index === 0;

  return (
    <section
      className={`fiona-section ${isVideoHero ? 'fiona-section--video-hero' : ''} ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''} ${isPinned ? 'is-pinned' : ''} ${previewedItem ? 'has-preview' : ''}`}
      style={{ '--section-index': index + 1 } as CSSProperties}
      onMouseEnter={() => onSectionHover(section)}
      onMouseLeave={() => onSectionLeave(section)}
    >
      {isVideoHero && !reduceMotion && (
        <video
          className="fiona-section-hero-video"
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
        />
      )}
      <div className="fiona-section-content">
        <div className="fiona-section-header">
          <div className="fiona-section-title-group">
            <h2 className="fiona-section-title sans">
              <button
                type="button"
                className="fiona-section-title-link"
                onClick={() => onActivate(section)}
                aria-expanded={isActive}
              >
                {section.title}
              </button>
            </h2>
            {section.kind === 'about' && <HeaderSocialLinks social={social} />}
          </div>
          <button
            type="button"
            className="fiona-section-close sans"
            onClick={onClose}
            aria-label={`Close ${section.title}`}
          >
            ×
          </button>
        </div>
        <div className="fiona-section-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="section-list"
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.5, 0.08, 0, 0.99] }}
            >
              {section.kind === 'about' ? (
                <AboutSection section={section} social={social} />
              ) : (
                <>
                  {section.intro && <p className="fiona-section-intro sans">{section.intro}</p>}
                  <SectionList
                    items={section.items}
                    selectedItem={selectedItem}
                    previewedItem={previewedItem}
                    onSelect={onSelectItem}
                    onPreview={onPreviewItem}
                    onClearPreview={onClearPreview}
                    sectionKind={section.kind}
                    canPreview={canPreviewItems}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            {previewedItem && canPreviewItems && (
              <SectionPreview item={previewedItem} reduceMotion={reduceMotion} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function FionaHome({ data }: FionaHomeProps) {
  const sections = useMemo(() => data?.sections || [], [data]);
  const [activeItem, setActiveItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const [previewItem, setPreviewItem] = useState<{ sectionId: string; itemId: string } | null>(null);
  const reduceMotion = useReducedMotion();

  const activeLayerSection = activeItem
    ? sections.find((section) => section.id === activeItem.sectionId) || null
    : null;
  const activeLayerItem = activeLayerSection && activeItem
    ? activeLayerSection.items.find((item) => item.id === activeItem.itemId) || null
    : null;
  return (
    <div className={`fiona-home fiona-home--expanded ${activeLayerItem ? 'has-item-layer' : ''}`}>
      <nav className="fiona-menu" style={{ '--sectionscount': sections.length } as CSSProperties}>
        {sections.map((section, index) => {
          const selectedItem = activeItem?.sectionId === section.id
            ? section.items.find((item) => item.id === activeItem.itemId) || null
            : null;
          const previewedItem = previewItem?.sectionId === section.id
            ? section.items.find((item) => item.id === previewItem.itemId) || null
            : null;

          return (
            <ShowcaseSectionPanel
              key={section.id}
              section={section}
              index={index}
              isActive
              isHovered={false}
              isPinned={false}
              selectedItem={selectedItem}
              previewedItem={previewedItem}
              social={data.social}
              onActivate={() => {
                setActiveItem(null);
                setPreviewItem(null);
              }}
              onClose={() => {
                setActiveItem(null);
                setPreviewItem(null);
              }}
              onSelectItem={(item) => {
                setPreviewItem(null);
                setActiveItem({ sectionId: section.id, itemId: item.id });
              }}
              onPreviewItem={(item) => {
                setPreviewItem({ sectionId: section.id, itemId: item.id });
              }}
              onClearPreview={() => {
                setPreviewItem((current) => current?.sectionId === section.id ? null : current);
              }}
              onSectionHover={() => {}}
              onSectionLeave={() => {}}
              reduceMotion={Boolean(reduceMotion)}
              canHover={false}
            />
          );
        })}
        <footer className="fiona-page-footer">
          <div className="fiona-footer-content sans">
            <span className="fiona-footer-quote">
              Consciousness is in the first place not a matter of ‘I think that’ but of ‘I can’.
            </span>
          </div>
        </footer>
      </nav>

      <AnimatePresence>
        {activeLayerItem && activeLayerSection && (
          <InlineItemDetail
            key={`${activeLayerSection.id}-${activeLayerItem.id}`}
            item={activeLayerItem}
            sectionTitle={activeLayerSection.title}
            onClose={() => setActiveItem(null)}
            reduceMotion={Boolean(reduceMotion)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
