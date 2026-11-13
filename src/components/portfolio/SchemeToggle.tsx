'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import styles from './PortfolioHome.module.css';

export type Scheme = 'light' | 'dark';
type Preference = Scheme | 'system';

const SCHEME_KEY = 'home-scheme';
const NEXT: Record<Preference, Preference> = { system: 'light', light: 'dark', dark: 'system' };
const LABEL: Record<Preference, string> = { system: 'System theme', light: 'Light mode', dark: 'Dark mode' };

function readPreference(): Preference {
  try {
    const stored = localStorage.getItem(SCHEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* storage blocked: fall back to the system */ }
  return 'system';
}

function systemScheme(): Scheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Theme switch shared by the homepage and every subpage. Cycles system → light → dark; the applied
 * scheme lives on <html data-scheme>, and "system" follows the OS live.
 */
export default function SchemeToggle({ onChange }: { onChange?: (scheme: Scheme) => void }) {
  const [preference, setPreference] = useState<Preference>('system');

  useEffect(() => {
    setPreference(readPreference());
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const scheme = preference === 'system' ? systemScheme() : preference;
      document.documentElement.dataset.scheme = scheme;
      onChange?.(scheme);
    };
    apply();
    if (preference !== 'system') return undefined;
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference]);

  const cycle = () => {
    const next = NEXT[preference];
    setPreference(next);
    try {
      if (next === 'system') localStorage.removeItem(SCHEME_KEY);
      else localStorage.setItem(SCHEME_KEY, next);
    } catch { /* storage blocked: the choice still applies for this visit */ }
  };

  const Icon = preference === 'system' ? Monitor : preference === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      className={styles.schemeToggle}
      onClick={cycle}
      aria-label={`${LABEL[preference]} (click to switch to ${LABEL[NEXT[preference]].toLowerCase()})`}
      title={LABEL[preference]}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
