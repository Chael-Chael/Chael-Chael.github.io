export interface MarkdownHeading {
  id: string;
  text: string;
  level: number;
}

export function slugifyHeading(value: string): string {
  const slug = value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~\[\]()]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'section';
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  return Array.from(content.matchAll(/^(#{2,3})\s+(.+?)\s*#*$/gm)).map((match) => {
    const text = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .trim();
    return {
      id: slugifyHeading(text),
      text,
      level: match[1].length,
    };
  });
}
