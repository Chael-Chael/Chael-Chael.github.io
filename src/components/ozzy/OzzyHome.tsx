'use client';

import Link from 'next/link';
import { cloneElement, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';
import { Tooltip } from 'react-tooltip';
import { FaEnvelope, FaGithub, FaGraduationCap, FaXTwitter } from 'react-icons/fa6';
import { SiXiaohongshu } from 'react-icons/si';
import { ArrowRight, ArrowUpRight, BookOpen, Camera, Code2, Lightbulb, X } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ShowcaseHomeLocaleData, ShowcaseItem } from '@/types/showcase';
import styles from './OzzyHome.module.css';

interface OzzyHomeProps {
  data: ShowcaseHomeLocaleData;
}

interface GalleryItem {
  id: string;
  title: string;
  href: string;
  image: string;
  description?: string;
  meta?: string;
  external?: boolean;
}

const MAIR_GALLERY_ITEM: GalleryItem = {
  id: 'mair',
  title: 'MAIR Lab',
  href: 'https://github.com/MAIR-Lab-HUST',
  image: '/ascii-logo/MAIR_logo.png',
  external: true,
};

const LLAMA_BLOG_ITEM: GalleryItem = {
  id: 'llama3-tech-report',
  title: 'Notes on the Llama 3 Technical Report',
  href: '/blog',
  image: '/images/blog/llama3-tech-report/banner.png',
  meta: '2025.09 / Llama 3',
};

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

const INTEREST_DETAILS = [
  'Joint perception, reasoning, generation, and creation in one multimodal system.',
  'Agents that understand visual structure and turn language into grounded actions.',
  'Learning visual dynamics and aligning diffusion trajectories while preserving diversity.',
];

const PROJECT_THEMES = [
  { background: 'radial-gradient(circle at 18% 18%, #93a4ff 0 16%, transparent 44%), linear-gradient(135deg, #344df4, #6d7dff)', label: '#fff' },
  { background: 'radial-gradient(circle at 78% 22%, #f3d4e7 0 14%, transparent 42%), linear-gradient(135deg, #c5b8ef, #eee8fa)', label: '#49396f' },
  { background: 'radial-gradient(circle at 22% 28%, #df4d1e 0 10%, transparent 42%), linear-gradient(135deg, #080504, #351108)', label: '#ff713d' },
  { background: 'radial-gradient(circle at 72% 18%, #fff 0 12%, transparent 40%), linear-gradient(135deg, #cbdcff, #78a4ff)', label: '#164eaf' },
] as const;

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

export default function OzzyHome({ data }: OzzyHomeProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [repoStars, setRepoStars] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);

  const galleryItems = useMemo(() => {
    const selectedSections = data.sections.filter((section) => ['publications', 'open-source'].includes(section.id));
    const contentItems = selectedSections
      .flatMap((section) => section.items)
      .map(toGalleryItem)
      .filter((item): item is GalleryItem => Boolean(item));

    return [MAIR_GALLERY_ITEM, LLAMA_BLOG_ITEM, ...contentItems];
  }, [data.sections]);

  const about = data.sections.find((section) => section.id === 'about');
  const publications = data.sections.find((section) => section.id === 'publications');
  const openSource = data.sections.find((section) => section.id === 'open-source');
  const blogs = data.sections.find((section) => section.id === 'blog');

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
  const githubHandle = github.split('/').filter(Boolean).pop() || 'Chael-Chael';
  const githubAvatar = `${github.replace(/\/$/, '')}.png`;
  const scholar = typeof data.social.google_scholar === 'string' ? data.social.google_scholar : undefined;

  return (
    <div className={styles.root}>
      <section className={styles.left} aria-label="Portfolio feed">
        <p className={styles.introHero}>
            <span className={styles.introCopy}>
              hello, i&apos;m chenyu zhu. a third-year undergraduate at{' '}
              <a className={styles.brand} href="https://www.hust.edu.cn/" target="_blank" rel="noreferrer">
                huazhong university of science and technology
              </a>
              , and a member of{' '}
              <a className={styles.mair} href="https://github.com/MAIR-Lab-HUST" target="_blank" rel="noreferrer">
                mair<span>[.]</span>lab
              </a>
              . i work on unified multimodal models{' '}
              <span className={styles.muted}>that see, reason, imagine, and create.</span> my research spans mllms, diffusion post-training,
              and world models. i keep my work in{' '}
              <Link className={`${styles.pastelLink} ${styles.butter}`} href="/publications">publications</Link>, think out loud in{' '}
              <Link className={`${styles.pastelLink} ${styles.sky}`} href="/blog">blog</Link>, and live on{' '}
              <a className={`${styles.pastelLink} ${styles.mint}`} href={github} target="_blank" rel="noreferrer">github</a>{' '}
              <span className={styles.muted}>or</span>{' '}
              <a className={`${styles.pastelLink} ${styles.lilac}`} href={email}>email</a>.
            </span>
        </p>

        <div className={styles.flow}>

          <section className={`${styles.flowSection} ${styles.profileSection}`}>
            <header className={styles.profileHeader}>
              <img className={styles.avatar} src={githubAvatar} alt={`${data.author.name} on GitHub`} />
              <div>
                <h1>{data.author.name}</h1>
                <p>{data.author.title} · HUST</p>
              </div>
            </header>

            <div className={styles.profileBody}>
              <p className={styles.profileBio}>
                I explore unified multimodal intelligence across perception, reasoning, generation, and interaction, with a focus on MLLMs, diffusion post-training, and world models.
              </p>

              <div className={styles.socialPills}>
                <a href={github} target="_blank" rel="noreferrer" aria-label={`GitHub: ${githubHandle}`}><FaGithub aria-hidden="true" /><span>{githubHandle}</span></a>
                {scholar && <a href={scholar} target="_blank" rel="noreferrer" aria-label={`Google Scholar: ${data.author.name}`}><FaGraduationCap aria-hidden="true" /><span>{data.author.name}</span></a>}
                <a href={email} aria-label={`Email: ${data.social.email}`}><FaEnvelope aria-hidden="true" /><span>{data.social.email}</span></a>
                <a href="https://x.com/ChaelChaelAGI" target="_blank" rel="noreferrer" aria-label="X: @ChaelChaelAGI"><FaXTwitter aria-hidden="true" /><span>@ChaelChaelAGI</span></a>
                <a href="https://www.xiaohongshu.com/user/profile/5fe0725d000000000100aa2c" target="_blank" rel="noreferrer" aria-label="小红书: 新世纪 AGI 战士"><SiXiaohongshu aria-hidden="true" /><span>新世纪 AGI 战士</span></a>
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
            <h2 className={styles.sectionTitle}><Lightbulb aria-hidden="true" /> Research Interests</h2>
            <div className={styles.interestList}>
              {(about?.items ?? []).map((item, index) => (
                <div className={styles.interestRow} key={item.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <p>{INTEREST_DETAILS[index] ?? 'Exploring unified multimodal intelligence.'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}><BookOpen aria-hidden="true" /> Publications</h2>
            <div className={styles.workList}>
              {(publications?.items ?? []).slice(0, 2).map((item) => (
                <article className={styles.publicationEntry} key={item.id}>
                  <Link className={styles.workRow} href={item.href}>
                    {item.image && <img src={item.image} alt="" />}
                    <span className={styles.workCopy}><strong>{item.title}</strong><small>{item.meta}</small></span>
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
              {(openSource?.items ?? []).slice(0, 4).map((item, index) => {
                const meta = repoStars[item.id] === undefined ? item.meta : item.meta?.replace(/^★\s*\d+/, `★ ${repoStars[item.id]}`);
                const [stars, language] = meta?.split(/\s*·\s*/) ?? [];
                const theme = PROJECT_THEMES[index % PROJECT_THEMES.length];
                return <div className={styles.projectCell} key={item.id}>
                  <a className={styles.projectCard} href={item.href} target="_blank" rel="noreferrer">
                    <span className={styles.projectFrame}>
                      <span className={styles.projectStage} style={{ '--project-hover-bg': theme.background, '--project-hover-label': theme.label } as CSSProperties}>
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
              <Link href={openSource?.href || '/open-source'}>View All <ArrowUpRight aria-hidden="true" /></Link>
            </div>
          </section>

          <section className={styles.flowSection}>
            <h2 className={styles.sectionTitle}>Blogs</h2>
            <div className={styles.workList}>
              {[LLAMA_BLOG_ITEM].map((item) => (
                <Link className={styles.workRow} href={item.href} key={item.id}>
                  <img src={item.image} alt="" />
                  <span className={styles.workCopy}><strong>{item.title}</strong><small>{item.meta}</small></span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              ))}
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
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            role="presentation"
          >
            <motion.figure
              className={styles.lightboxCard}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
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
