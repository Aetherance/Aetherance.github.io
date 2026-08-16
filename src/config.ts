export const siteConfig = {
  title: 'AETHER',
  author: 'Aether',
  handle: 'Aetherance',
  avatar: 'https://avatars.githubusercontent.com/u/98370028?v=4',
  description: {
    zh: 'Aether 的个人博客，记录分布式系统、存储引擎与软件工程。',
    en: "Aether's notes on distributed systems, storage engines, and software engineering.",
  },
  intro: {
    zh: 'Enjoy coding. Interested in distributed storage.',
    en: 'Enjoy coding. Interested in distributed storage.',
  },
  siteUrl: 'https://aetherance.github.io',
  defaultLanguage: 'zh',
  social: {
    github: 'https://github.com/Aetherance',
    email: null as string | null,
  },
  projects: [
    {
      name: 'apache/dubbo-go',
      url: 'https://github.com/apache/dubbo-go',
      language: 'Go',
      description: {
        zh: 'Apache Dubbo 的 Go 语言实现。',
        en: 'The Go implementation of Apache Dubbo.',
      },
    },
    {
      name: 'apache/dubbo-go-samples',
      url: 'https://github.com/apache/dubbo-go-samples',
      language: 'Go',
      description: {
        zh: 'Apache Dubbo Go 的示例与使用参考。',
        en: 'Examples and usage references for Apache Dubbo Go.',
      },
    },
    {
      name: 'Aetherance/taluskv',
      url: 'https://github.com/Aetherance/taluskv',
      language: 'Go',
      description: {
        zh: '采用自定义 Raft 实现的分布式键值存储。',
        en: 'A distributed key-value store with a custom Raft implementation.',
      },
    },
    {
      name: 'Aetherance/talusdb',
      url: 'https://github.com/Aetherance/talusdb',
      language: 'C++',
      description: {
        zh: '可嵌入的 LSM-tree 存储引擎。',
        en: 'An embeddable LSM-tree storage engine.',
      },
    },
  ],
  giscus: {
    enabled: false,
    repo: 'Aetherance/Aetherance.github.io',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
} as const;
