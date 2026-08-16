import rss from '@astrojs/rss';
import type { APIContext, GetStaticPaths } from 'astro';
import { languages, type Language } from '../../i18n';
import { siteConfig } from '../../config';
import { getPosts, postPath } from '../../lib/posts';

export const getStaticPaths: GetStaticPaths = () => languages.map((lang) => ({ params: { lang }, props: { lang } }));

export async function GET(context: APIContext) {
  const lang = context.props.lang as Language;
  const posts = await getPosts(lang);
  return rss({
    title: siteConfig.title,
    description: siteConfig.description[lang],
    site: context.site ?? siteConfig.siteUrl,
    customData: `<language>${lang === 'zh' ? 'zh-CN' : 'en'}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: postPath(post),
      categories: post.data.tags,
    })),
  });
}
