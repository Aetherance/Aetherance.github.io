import type { Language } from '../i18n';

export const POSTS_PER_PAGE = 5;

export function pageCount(totalItems: number, pageSize = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function pageItems<T>(items: T[], page: number, pageSize = POSTS_PER_PAGE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function homePagePath(lang: Language, page: number): string {
  return page <= 1 ? `/${lang}/` : `/${lang}/page/${page}/`;
}
