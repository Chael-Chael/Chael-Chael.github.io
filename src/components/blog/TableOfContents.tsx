'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0.1,
    });

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [headings]);

  // Auto-scroll the TOC to the active heading
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (activeId && navRef.current) {
      const activeElement = navRef.current.querySelector(`[data-id="${activeId}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [activeId]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for top header
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) return null;

  return (
    <aside 
      className="fixed right-2 lg:right-3 xl:right-4 top-1/2 -translate-y-1/2 z-40 hidden xl:block transition-all duration-300"
    >
      <nav 
        ref={navRef}
        className="flex flex-col items-start gap-3 h-[450px] overflow-y-auto pl-2 no-scrollbar py-12 group/toc scroll-smooth mask-vertical"
      >
        <style jsx>{`
          .mask-vertical {
            mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          }
          /* Hide scrollbar for Chrome, Safari and Opera */
          nav::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          nav {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          
          return (
            <button
              key={heading.id}
              data-id={heading.id}
              onClick={() => scrollTo(heading.id)}
              className={clsx(
                "flex items-center gap-6 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group/item py-2 pl-4 pr-12 -ml-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-200/50",
                heading.level === 1 ? "mb-2" : "",
                heading.level > 2 ? "opacity-60 scale-90" : ""
              )}
            >
              {/* Minimal Indicator (TOC Dash) */}
              <div 
                className={clsx(
                  "h-1 rounded-full transition-all duration-300 flex-shrink-0",
                  isActive 
                    ? "w-8 bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]" 
                    : "w-4 bg-neutral-200 dark:bg-neutral-200 group-hover/item:w-6 group-hover/item:bg-accent/40",
                  heading.level === 1 ? "h-1.5" : "",
                  heading.level === 3 ? "w-3" : ""
                )}
              />

              {/* Heading Text - Hidden by default, visible on hover */}
              <span className={clsx(
                "text-left text-xs font-serif transition-all duration-300 whitespace-nowrap overflow-hidden pointer-events-none -translate-x-4 opacity-0 group-hover/toc:opacity-100 group-hover/toc:translate-x-0 truncate max-w-[180px]",
                isActive 
                   ? "text-primary scale-105 font-bold opacity-100 translate-x-0" 
                   : "text-neutral-400 dark:text-neutral-600 group-hover/item:text-accent"
              )}>
                {heading.text}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
