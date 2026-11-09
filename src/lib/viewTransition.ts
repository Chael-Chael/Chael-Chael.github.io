/**
 * Shared-element keys for the page-to-page "one take" transition.
 *
 * Every page is addressed by a key derived from its path ("/publications/x" → "publications:x").
 * Elements that stand for a page carry `data-vt={key}`: the homepage section title that leads to
 * /publications, the publication thumbnail that leads to its detail page, the page bar on the
 * subpage itself, and so on. When navigating, the element with the shared key in the old page
 * morphs into the one in the new page while the rest of both pages pans along with it.
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Strips the deploy base path and any trailing slash: "/repo/publications/" → "/publications". */
export function normalizePath(pathname: string): string {
  let path = pathname;
  if (BASE_PATH && path.startsWith(BASE_PATH)) path = path.slice(BASE_PATH.length) || '/';
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

/** The shared-element key a page (or a link to it) stands for; "" for the homepage. */
export function vtKey(href: string): string {
  const path = normalizePath(href.split(/[?#]/)[0] || '/');
  return path.split('/').filter(Boolean).map(decodeURIComponent).join(':');
}
