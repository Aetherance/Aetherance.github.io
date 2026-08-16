import { describe, expect, it } from 'vitest';
import { readingMinutes, slugFromId, tagSlug } from './content-utils';

describe('content utilities', () => {
  it('derives slugs from nested Markdown ids', () => {
    expect(slugFromId('zh/hello-world.md')).toBe('hello-world');
    expect(slugFromId('en/plain')).toBe('plain');
  });

  it('creates stable tag slugs for Latin and Chinese labels', () => {
    expect(tagSlug('Web Design')).toBe('web-design');
    expect(tagSlug('写作 随笔')).toBe('写作-随笔');
  });

  it('always returns at least one reading minute', () => {
    expect(readingMinutes('', 'zh')).toBe(1);
    expect(readingMinutes('hello world', 'en')).toBe(1);
  });
});
