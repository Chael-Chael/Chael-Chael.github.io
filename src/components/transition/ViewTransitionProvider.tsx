'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizePath, vtKey } from '@/lib/viewTransition';

/*
 * The "one take" between pages.
 *
 * A same-site link click runs inside document.startViewTransition. One element morphs across the
 * cut: whatever stands for the page being opened (or left) in both pages, found by its `data-vt`
 * key, such as the homepage "Publications" title and the bar on /publications. The rest of each page
 * is pinned to that element: the old page and the new one pan together by the distance it travels,
 * crossfading on the way, so the camera seems to glide from one page into the next without a cut.
 */

const SHARED = 'vt-shared';
const DURATION = 760;
const EASE = 'cubic-bezier(0.7, 0, 0.2, 1)';

/** Where the homepage was scrolled when it was left, to land back on the same spot. */
let homeScroll: number | null = null;

function scroller(): HTMLElement {
  const stage = document.querySelector<HTMLElement>('[data-scroll-root]');
  if (stage && stage.scrollHeight > stage.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(stage).overflowY)) return stage;
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}

function inView(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;
}

function byKey(key: string): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(`[data-vt="${CSS.escape(key)}"]`));
}

type ViewTransitionLike = { ready: Promise<void>; finished: Promise<void> };
type StartViewTransition = (update: () => Promise<void>) => ViewTransitionLike;

export default function ViewTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const arrived = useRef<(() => void) | null>(null);
  const running = useRef(false);

  // the new page has committed (its own layout effects ran first): let the transition read it
  useLayoutEffect(() => {
    arrived.current?.();
    arrived.current = null;
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;

    const go = (href: string, from: string, to: string, anchor: HTMLAnchorElement) => {
      const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition?.bind(document);
      if (!start || running.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href);
        return;
      }

      // going up the tree keys on the page being left (its bar flies back into its section title);
      // going down keys on the page being opened (its section title flies up into its bar)
      const up = to === '/' || from.startsWith(`${to}/`);
      const keys = (up ? [vtKey(from), vtKey(to)] : [vtKey(to), vtKey(from)]).filter(Boolean);
      let key = '';
      let source: HTMLElement | null = null;
      for (const candidate of keys) {
        source = byKey(candidate).find(inView) ?? null;
        if (source) { key = candidate; break; }
      }
      // nothing on screen stands for it: the clicked link itself flies in (a hero pill, say)
      if (!source && keys[0] && inView(anchor)) {
        key = keys[0];
        source = anchor;
      }

      if (from === '/') homeScroll = scroller().scrollTop;
      const from_ = source?.getBoundingClientRect() ?? null;
      if (source) source.style.viewTransitionName = SHARED;
      root.dataset.vtNav = 'true';
      root.dataset.vtDir = up ? 'up' : 'down';
      running.current = true;

      let target: HTMLElement | null = null;
      let pushed = false;
      const push = () => {
        if (pushed) return;
        pushed = true;
        router.push(href, { scroll: false });
      };
      const transition = start(async () => {
        await new Promise<void>((resolve) => {
          arrived.current = resolve;
          window.setTimeout(resolve, 2500);
          push();
        });
        if (source) source.style.viewTransitionName = '';

        target = key ? byKey(key)[0] ?? null : null;
        const stage = scroller();
        if (to === '/' && homeScroll !== null) {
          stage.scrollTop = homeScroll;
        } else if (to === '/' && target && from_) {
          // entered a subpage directly: land home with its section where the bar was
          stage.scrollTop += target.getBoundingClientRect().top - from_.top;
        } else if (!href.includes('#')) {
          stage.scrollTop = 0;
        }
        if (target) target.style.viewTransitionName = SHARED;
      });

      // a page that is not rendering (a background tab) never captures the old frame: just go
      window.setTimeout(() => {
        if (pushed) return;
        (transition as ViewTransitionLike & { skipTransition?: () => void }).skipTransition?.();
        push();
      }, 400);

      transition.ready.then(() => {
        const to_ = target?.getBoundingClientRect() ?? null;
        const limit = window.innerHeight * 0.55;
        let shift = from_ && to_ ? to_.top - from_.top : 0;
        // no anchor, or one that barely moves: still drift the way we are heading
        if (Math.abs(shift) < 48) shift = up ? 72 : -72;
        shift = Math.max(-limit, Math.min(limit, shift));

        const timing = { duration: DURATION, easing: EASE, fill: 'both' as const };
        root.animate(
          [
            { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
            { opacity: 0.4, offset: 0.35 },
            { transform: `translateY(${shift}px)`, opacity: 0, filter: 'blur(3px)' },
          ],
          { ...timing, pseudoElement: '::view-transition-old(root)' },
        );
        root.animate(
          [
            { transform: `translateY(${-shift}px)`, opacity: 0, filter: 'blur(3px)' },
            { opacity: 0, offset: 0.3 },
            { transform: 'translateY(0)', opacity: 1, filter: 'blur(0px)' },
          ],
          { ...timing, pseudoElement: '::view-transition-new(root)' },
        );
      }).catch(() => {});

      transition.finished.finally(() => {
        if (target) target.style.viewTransitionName = '';
        if (source) source.style.viewTransitionName = '';
        delete root.dataset.vtDir;
        running.current = false;
      });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || !anchor.href || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const from = normalizePath(window.location.pathname);
      const to = normalizePath(url.pathname);
      if (from === to) return; // same page or an in-page anchor

      event.preventDefault();
      go(`${to}${url.search}${url.hash}`, from, to, anchor);
    };

    // capture: runs before next/link, which then sees the click as handled
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [router]);

  return <>{children}</>;
}
