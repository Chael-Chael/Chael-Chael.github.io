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
  const [isHovered, setIsHovered] = useState(false);
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
      rootMargin: '-10% 0px -80% 0px', // When the header is near the top
      threshold: 1.0,
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
      className="fixed right-4 lg:right-12 top-1/2 -translate-y-1/2 z-40 hidden xl:block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="flex flex-col items-end gap-3 max-h-[80vh] overflow-y-auto no-scrollbar py-8 group/toc">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          
          return (
            <button
              key={heading.id}
              onClick={() => scrollTo(heading.id)}
              className={clsx(
                "flex items-center gap-4 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group/item",
                heading.level === 1 ? "mb-2" : "",
                heading.level > 2 ? "opacity-60 scale-90" : ""
              )}
            >
              {/* Heading Text - Hidden by default, visible on hover */}
              <span className={clsx(
                "text-right text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden pointer-events-none translate-x-4 opacity-0 group-hover/toc:opacity-100 group-hover/toc:translate-x-0",
                isActive 
                   ? "text-primary scale-105 font-bold opacity-100 translate-x-0" 
                   : "text-neutral-400 group-hover/item:text-accent",
                // Show H1 headers even when unhovered for context
                !isHovered && heading.level === 1 && "opacity-100 translate-x-0 text-neutral-500 font-semibold"
              )}>
                {heading.text}
              </span>

              {/* Minimal Indicator (TOC Dash) */}
              <div 
                className={clsx(
                  "h-1 rounded-full transition-all duration-300",
                  isActive 
                    ? "w-8 bg-accent shadow-[0_0_8px_rgba(var(--accent-rgb),0.4)]" 
                    : "w-4 bg-neutral-200 dark:bg-neutral-800 group-hover/item:w-6 group-hover/item:bg-accent/40",
                  heading.level === 1 ? "h-1.5" : "",
                  heading.level === 3 ? "w-3" : ""
                )}
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
