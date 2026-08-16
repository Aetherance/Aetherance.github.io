import { describe, expect, it } from 'vitest';
import { homePagePath, pageCount, pageItems } from './pagination';

describe('home pagination', () => {
  it('splits posts into five-item pages', () => {
    const posts = Array.from({ length: 12 }, (_, index) => index + 1);
    expect(pageCount(posts.length)).toBe(3);
    expect(pageItems(posts, 2)).toEqual([6, 7, 8, 9, 10]);
    expect(pageItems(posts, 3)).toEqual([11, 12]);
  });

  it('keeps the first page at the language home URL', () => {
    expect(homePagePath('zh', 1)).toBe('/zh/');
    expect(homePagePath('zh', 2)).toBe('/zh/page/2/');
  });
});
