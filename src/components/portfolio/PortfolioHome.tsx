'use client';

import Link from 'next/link';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';
import { Tooltip } from 'react-tooltip';
import { FaEnvelope, FaGithub, FaGraduationCap, FaXTwitter } from 'react-icons/fa6';
import { SiXiaohongshu } from 'react-icons/si';
import { ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Camera, ChevronDown, Code2, Lightbulb, NotebookPen, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { CSSProperties } from 'react';
import type { HomeFeaturedItem, ShowcaseHomeLocaleData, ShowcaseItem } from '@/types/showcase';
import styles from './PortfolioHome.module.css';

interface PortfolioHomeProps {
  data: ShowcaseHomeLocaleData;
}

type GalleryItem = HomeFeaturedItem;

const CALENDAR_THEME = {
  light: ['#f4f4f5', '#d4d4d8', '#a1a1aa', '#52525b', '#18181b'],
};

const CARD_OFFSETS = [
  { x: '-18px', r: '-2.8deg' },
  { x: '7px', r: '1.5deg' },
  { x: '18px', r: '2.4deg' },
  { x: '2px', r: '-1.2deg' },
  { x: '-22px', r: '2.6deg' },
  { x: '-36px', r: '-2.1deg' },
  { x: '-28px', r: '1.2deg' },
  { x: '-8px', r: '-1.8deg' },
];

function isExternal(href: string) {
  return /^https?:\/\//.test(href) || href.startsWith('mailto:');
}

function toGalleryItem(item: ShowcaseItem): GalleryItem | null {
  if (!item.image) return null;
  return {
    id: item.id,
    title: item.title,
    href: item.href,
    image: item.image,
    description: item.description,
    external: item.external,
  };
}

function GalleryCard({
  item,
  index,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  onOpen: (item: GalleryItem) => void;
}) {
  const offset = CARD_OFFSETS[index % CARD_OFFSETS.length];
  const style = {
    '--offset-x': offset.x,
    '--rotation': offset.r,
    '--reveal-delay': `${Math.min(index, 8) * 55}ms`,
  } as CSSProperties;

  return (
    <figure className={styles.clip} style={style}>
      <button
        type="button"
        className={styles.clipButton}
        onClick={() => onOpen(item)}
        aria-label={`Open ${item.title}`}
      >
        <span className={styles.clipTab}>
          <img src={item.image} alt="" aria-hidden="true" />
          <span>{item.title}</span>
        </span>
        <span className={styles.clipMedia}>
          <img className={styles.clipImage} src={item.image} alt="" loading={index < 5 ? 'eager' : 'lazy'} />
          <span className={styles.camera} aria-hidden="true">
            <Camera />
          </span>
        </span>
      </button>
    </figure>
  );
}

function GallerySet({ items, onOpen }: { items: GalleryItem[]; onOpen: (item: GalleryItem) => void }) {
  return (
    <div className={styles.gallerySet}>
      {items.map((item, index) => (
        <GalleryCard key={`${item.id}-${index}`} item={item} index={index} onOpen={onOpen} />
      ))}
    </div>
  );
}

export default function PortfolioHome({ data }: PortfolioHomeProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [repoStars, setRepoStars] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const [expandedExperience, setExpandedExperience] = useState<string | null>(data.home.experiences[0]?.organization ?? null);

  const galleryItems = useMemo(() => {
    const selectedSections = data.sections.filter((section) => ['publications', 'open-source'].includes(section.id));
    const contentItems = selectedSections
      .flatMap((section) => section.items)
      .map(toGalleryItem)
      .filter((item): item is GalleryItem => Boolean(item));

    return [...data.home.gallery, data.home.featured_blog, ...contentItems];
  }, [data.home.featured_blog, data.home.gallery, data.sections]);

  const publications = data.sections.find((section) => section.id === 'publications');
  const openSource = data.sections.find((section) => section.id === 'open-source');
  const blogs = data.sections.find((section) => section.id === 'blog');
  const { hero, profile, experiences, limits, research_interests: researchInterests, featured_blog: featuredBlog } = data.home;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const controller = new AbortController();
    const repositories = (openSource?.items ?? []).filter((item) => item.href.startsWith('https://github.com/'));

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
  }, [openSource]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const email = data.social.email ? `mailto:${data.social.email}` : '/';
  const github = data.social.github || 'https://github.com/Chael-Chael';
  const heroMarkdown = hero.markdown
    .replace(/==(.+?)==/g, '[$1](# "shimmer")')
    .replaceAll('{github}', github)
    .replaceAll('{email}', email);
  const githubHandle = github.split('/').filter(Boolean).pop() || 'Chael-Chael';
  const githubAvatar = `${github.replace(/\/$/, '')}.png`;
  const scholar = typeof data.social.google_scholar === 'string' ? data.social.google_scholar : undefined;
  const x = typeof data.social.x === 'string' ? data.social.x : undefined;
  const xLabel = typeof data.social.x_label === 'string' ? data.social.x_label : undefined;
  const xiaohongshu = typeof data.social.xiaohongshu === 'string' ? data.social.xiaohongshu : undefined;
  const xiaohongshuLabel = typeof data.social.xiaohongshu_label === 'string' ? data.social.xiaohongshu_label : undefined;

  return (
    <div className={styles.root}>
      <section className={styles.left} aria-label="Portfolio feed">
        <div className={styles.introHero}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <span className={styles.introCopy}>{children}</span>,
              a: ({ href = '', title, children }) => {
                const effect = title && ['shimmer', 'brand', 'mair', 'butter', 'sky', 'mint', 'lilac'].includes(title) ? title : '';
                if (effect === 'shimmer') return <span className={`${styles.muted} ${styles.shimmer}`}>{children}</span>;
                const className = effect === 'brand' || effect === 'mair'
                  ? styles[effect]
                  : effect ? `${styles.pastelLink} ${styles[effect]}` : undefined;
                const content = <>{effect === 'brand' && <span className={styles.brandLogo} aria-hidden="true" />}{effect === 'mair' && <img src="/ascii-logo/MAIR_logo.png" alt="" aria-hidden="true" />}{children}</>;
                return isExternal(href)
                  ? <a className={className} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{content}</a>
                  : <Link className={className} href={href}>{content}</Link>;
              },
            }}
          >{heroMarkdown}</ReactMarkdown>
        </div>

        <div className={styles.flow}>

          <section className={`${styles.flowSection} ${styles.profileSection}`}>
            <header className={styles.profileHeader}>
              <img className={styles.avatar} src={githubAvatar} alt={`${data.author.name} on GitHub`} />
              <div>
                <h1>{data.author.name}</h1>
                <p>{data.author.title} · {profile.institution_short}</p>
              </div>
            </header>

            <div className={styles.profileBody}>
              <p className={styles.profileBio}>{profile.bio}</p>
              <p className={styles.profileCollaboration}>{profile.collaboration.replace(/email me\.$/, '')}<a href={email}>email me</a>.</p>

              <div className={styles.socialPills}>
                <a href={github} target="_blank" rel="noreferrer" aria-label={`GitHub: ${githubHandle}`}><FaGithub aria-hidden="true" /><span>{githubHandle}</span></a>
                {scholar && <a href={scholar} target="_blank" rel="noreferrer" aria-label={`Google Scholar: ${data.author.name}`}><FaGraduationCap aria-hidden="true" /><span>{data.author.name}</span></a>}
                <a href={email} aria-label={`Email: ${data.social.email}`}><FaEnvelope aria-hidden="true" /><span>{data.social.email}</span></a>
                {x && xLabel && <a href={x} target="_blank" rel="noreferrer" aria-label={`X: ${xLabel}`}><FaXTwitter aria-hidden="true" /><span>{xLabel}</span></a>}
                {xiaohongshu && xiaohongshuLabel && <a href={xiaohongshu} target="_blank" rel="noreferrer" aria-label={`小红书: ${xiaohongshuLabel}`}><SiXiaohongshu aria-hidden="true" /><span>{xiaohongshuLabel}</span></a>}
              </div>

              <div className={styles.commitHead}>
                <strong>{githubHandle} on GitHub</strong>
                <a href={github} target="_blank" rel="noreferrer">View profile <ArrowRight aria-hidden="true" /></a>
              </div>
              <div className={styles.contributionScroll}>
                {mounted && <GitHubCalendar
                  username={githubHandle}
                  year="last"
                  colorScheme="light"
                  theme={CALENDAR_THEME}
                  blockSize={10}
                  blockMargin={2.5}
                  blockRadius={2}
                  fontSize={12}
                  showWeekdayLabels={['mon', 'wed', 'fri']}
                  labels={{ totalCount: '{{count}} activities in {{year}}' }}
                  className={styles.githubCalendar}
                  renderBlock={(block, activity) => cloneElement(block, {
                    'data-tooltip-id': 'github-contribution-tooltip',
                    'data-tooltip-content': `${activity.count} contribution${activity.count === 1 ? '' : 's'} on ${activity.date}`,
                    className: styles.contributionBlock,
                    style: { ...block.props.style, stroke: 'rgba(0, 0, 0, 0.08)', cursor: 'pointer' },
                  })}
                />}
                {mounted && <Tooltip id="github-contribution-tooltip" className={styles.contributionTooltip} place="top" opacity={1} />}
              </div>
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}><BriefcaseBusiness aria-hidden="true" /> Experiences</h2>
            <div className={styles.experienceList}>
              {experiences.map((item) => {
                const expanded = expandedExperience === item.organization;
                return <article className={styles.experienceItem} data-open={expanded} key={item.organization}>
                  <button className={styles.experienceRow} type="button" aria-expanded={expanded} onClick={() => setExpandedExperience(expanded ? null : item.organization)}>
                    <span className={styles.experienceLogo}><img src={item.image} alt="" /></span>
                    <span className={styles.experienceMain}><strong>{item.organization}</strong><small>{item.role}</small></span>
                    <span className={styles.experienceMeta}><strong>{item.period}</strong><small>{item.location}</small></span>
                    <ChevronDown aria-hidden="true" />
                  </button>
                  <div className={styles.experienceDetailsClip} aria-hidden={!expanded}>
                    <div className={styles.experienceDetailsInner} inert={!expanded}>
                      <div className={styles.experienceDetails}>
                        <ul>{item.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                        <div className={styles.experienceTags}>{item.tags.map((tag) => <span key={tag}>{tag}</span>)}<a href={item.href} target="_blank" rel="noreferrer">Visit <ArrowUpRight aria-hidden="true" /></a></div>
                      </div>
                    </div>
                  </div>
                </article>;
              })}
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}><Lightbulb aria-hidden="true" /> Research Interests</h2>
            <div className={styles.interestList}>
              {researchInterests.map((item, index) => (
                <div className={styles.interestRow} key={item.title}>
                  <h3><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}><BookOpen aria-hidden="true" /> Publications</h2>
            <div className={styles.workList}>
              {(publications?.items ?? []).slice(0, limits.publications).map((item) => (
                <article className={styles.publicationEntry} key={item.id}>
                  <Link className={styles.workRow} href={item.href}>
                    {item.image && <span className={styles.publicationPreview}><img src={item.image} alt="" /><small>{item.date}</small></span>}
                    <span className={styles.workCopy}>
                      <strong>{item.title}</strong>
                      <small className={styles.publicationAuthors}>{item.authors?.map((author, index) => <span key={`${author.name}-${index}`}>{author.isHighlighted ? <strong>{author.name}</strong> : author.name}{author.superscript?.includes('*') && <sup>*</sup>}{index < item.authors!.length - 1 && ', '}</span>)}</small>
                      <small className={styles.publicationMeta}>{item.badge && <span>{item.badge}</span>}{item.meta}</small>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <div className={styles.publicationActions}>
                    {item.links?.map((link) => <a href={link.href} target="_blank" rel="noreferrer" key={link.label}>{link.label} <ArrowUpRight aria-hidden="true" /></a>)}
                  </div>
                </article>
              ))}
              <Link className={styles.viewAll} href={publications?.href || '/publications'}>View all publications <ArrowRight aria-hidden="true" /></Link>
            </div>
          </section>

          <section className={`${styles.flowSection} ${styles.projectsSection}`}>
            <h2 className={styles.sectionTitle}><Code2 aria-hidden="true" /> Open Source Projects</h2>
            <div className={styles.projectGrid}>
              {(openSource?.items ?? []).slice(0, limits.projects).map((item) => {
                const meta = repoStars[item.id] === undefined ? item.meta : item.meta?.replace(/^★\s*\d+/, `★ ${repoStars[item.id]}`);
                const [stars, language] = meta?.split(/\s*·\s*/) ?? [];
                return <div className={styles.projectCell} key={item.id}>
                  <a className={styles.projectCard} href={item.href} target="_blank" rel="noreferrer">
                    <span className={styles.projectFrame}>
                      <span className={styles.projectStage}>
                        <span className={styles.projectLabel}>{item.id === 'tmpo' ? 'Paper & Code' : 'GitHub Repository'}</span>
                        <span className={styles.projectScreenshot}>{item.image && <img src={item.image} alt="" />}</span>
                      </span>
                    </span>
                    <span className={styles.projectDetails}>
                      <span className={styles.projectTitleRow}>
                        <strong>{item.title}</strong>
                        <span className={styles.projectStars} aria-live="polite">{stars}</span>
                      </span>
                      <span className={styles.projectDescription}>{item.description}</span>
                      <span className={styles.projectFooter}>
                        <span className={styles.projectCta}>View Project <ArrowUpRight aria-hidden="true" /></span>
                        <em>{language}</em>
                      </span>
                    </span>
                  </a>
                </div>;
              })}
            </div>
            <div className={styles.projectViewAll}>
              <Link href={openSource?.href || '/open-source'}>View all projects <ArrowRight aria-hidden="true" /></Link>
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}><NotebookPen aria-hidden="true" /> Blogs</h2>
            <div className={styles.workList}>
              <Link className={styles.workRow} href={featuredBlog.href}>
                <img src={featuredBlog.image} alt="" />
                <span className={styles.workCopy}><strong>{featuredBlog.title}</strong><small>{featuredBlog.meta}</small></span>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link className={styles.viewAll} href={blogs?.href || '/blog'}>View all notes <ArrowRight aria-hidden="true" /></Link>
            </div>
          </section>
        </div>
      </section>

      <section className={styles.gallery} aria-label="Selected work">
        <div className={styles.track}>
          <GallerySet items={galleryItems} onOpen={setSelected} />
          <GallerySet items={galleryItems} onOpen={setSelected} />
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setSelected(null)}
            role="presentation"
          >
            <motion.figure
              className={styles.lightboxCard}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)', transition: { duration: 0.15 } }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <img src={selected.image} alt={selected.title} />
              <figcaption>
                <span>{selected.title}</span>
                <a
                  href={selected.href}
                  target={selected.external || isExternal(selected.href) ? '_blank' : undefined}
                  rel={selected.external || isExternal(selected.href) ? 'noreferrer' : undefined}
                >
                  view project <ArrowUpRight />
                </a>
              </figcaption>
            </motion.figure>
            <button type="button" className={styles.close} onClick={() => setSelected(null)} aria-label="Close preview">
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
