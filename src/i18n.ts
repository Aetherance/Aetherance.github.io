export const languages = ['zh', 'en'] as const;
export type Language = (typeof languages)[number];

export const languageNames: Record<Language, string> = {
  zh: '中文',
  en: 'English',
};

export const ui = {
  zh: {
    nav: { home: '首页', archive: '归档', tags: '标签', search: '搜索', about: '关于' },
    latest: '最新文章', allPosts: '查看全部文章', minuteRead: '分钟阅读', updated: '更新于',
    published: '发布于', translation: 'Read in English', toc: '本文目录', comments: '评论',
    previous: '上一篇', next: '下一篇', noPosts: '这里还没有文章。', theme: '切换明暗主题',
    rss: 'RSS 订阅', searchTitle: '搜索', searchPlaceholder: '输入关键词…', searchHelp: '搜索标题、摘要与正文',
    searchEmpty: '没有找到相关文章。', searchLoading: '正在载入搜索…', archiveTitle: '文章归档', tagsTitle: '所有标签',
    postsTagged: '篇文章', backHome: '返回首页', notFound: '页面没有找到', notFoundText: '它可能已经移动，或从未存在过。',
  },
  en: {
    nav: { home: 'Home', archive: 'Archive', tags: 'Tags', search: 'Search', about: 'About' },
    latest: 'Latest writing', allPosts: 'View all posts', minuteRead: 'min read', updated: 'Updated',
    published: 'Published', translation: '阅读中文版', toc: 'On this page', comments: 'Comments',
    previous: 'Previous', next: 'Next', noPosts: 'No posts here yet.', theme: 'Toggle color theme',
    rss: 'RSS feed', searchTitle: 'Search', searchPlaceholder: 'Type to search…', searchHelp: 'Search titles, summaries, and full text',
    searchEmpty: 'No matching posts found.', searchLoading: 'Loading search…', archiveTitle: 'Archive', tagsTitle: 'All tags',
    postsTagged: 'posts', backHome: 'Back home', notFound: 'Page not found', notFoundText: 'It may have moved, or perhaps it never existed.',
  },
} as const;

export function isLanguage(value: string | undefined): value is Language {
  return languages.includes(value as Language);
}

export function formatDate(date: Date, lang: Language): string {
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: lang === 'zh' ? 'long' : 'short',
    day: 'numeric',
  }).format(date);
}
