import { getCollection, type CollectionEntry } from 'astro:content';
import type { Language } from '../i18n';
import { slugFromId, tagSlug } from './content-utils';

export type Post = CollectionEntry<'posts'>;

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPosts(lang: Language): Promise<Post[]> {
  return (await getAllPosts()).filter((post) => post.data.lang === lang);
}

export function postSlug(post: Post): string {
  return slugFromId(post.id);
}

export function postPath(post: Post): string {
  return `/${post.data.lang}/posts/${postSlug(post)}/`;
}

export async function getTranslation(post: Post): Promise<Post | undefined> {
  if (!post.data.translationKey) return undefined;
  return (await getAllPosts()).find(
    (candidate) =>
      candidate.data.translationKey === post.data.translationKey && candidate.data.lang !== post.data.lang,
  );
}

export async function getTags(lang: Language) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const post of await getPosts(lang)) {
    for (const name of post.data.tags) {
      const slug = tagSlug(name);
      const current = counts.get(slug);
      counts.set(slug, { name: current?.name ?? name, count: (current?.count ?? 0) + 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
