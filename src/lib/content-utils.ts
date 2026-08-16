import type { Language } from '../i18n';

export function slugFromId(id: string): string {
  const part = id.split('/').at(-1) ?? id;
  return part.replace(/\.(md|mdx)$/i, '');
}

export function tagSlug(tag: string): string {
  return tag
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function readingMinutes(body: string, lang: Language): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>|[#>*_`\[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const amount = lang === 'zh' ? text.replace(/\s/g, '').length : text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(amount / (lang === 'zh' ? 400 : 200)));
}
