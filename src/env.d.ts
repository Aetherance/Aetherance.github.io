/// <reference types="astro/client" />

declare module '/pagefind/pagefind.js' {
  export function init(): Promise<void>;
  export function search(
    query: string,
    options?: { filters?: Record<string, string> },
  ): Promise<{ results: Array<{ data(): Promise<PagefindResult> }> }>;

  interface PagefindResult {
    url: string;
    excerpt: string;
    meta: { title?: string };
  }
}
