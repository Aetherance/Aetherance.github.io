# Personal Blog

一个使用 Astro 构建的中英双语个人写作博客。文章保存在 Markdown 中，站点可完整静态部署到 GitHub Pages。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

生产构建会同时生成 Pagefind 搜索索引：

```bash
npm run check
npm test
npm run build
npm run preview
```

开发服务器没有搜索索引；请使用生产构建预览来测试搜索。

## 修改个人资料

个人资料集中在 `src/config.ts`，当前配置对应 Aether 的 GitHub 主页、置顶项目与 GitHub Pages 地址。部署时也应将仓库的 GitHub Actions 变量 `SITE_URL` 设置为 `https://aetherance.github.io`；如果以后使用自定义域名，再同步修改这里的地址。

## 写文章

把 Markdown 文件放入 `src/content/posts/zh` 或 `src/content/posts/en`。frontmatter 示例：

```yaml
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-08-14
updatedDate: 2026-08-15 # 可选
lang: zh
translationKey: shared-key # 可选；两种语言使用相同值即可互相关联
tags:
  - 写作
draft: false
---
```

文件名会成为文章 URL。草稿在本地开发环境可见，在生产构建中隐藏。

## 启用评论

1. 在博客对应的 GitHub 仓库启用 Discussions，并安装 [Giscus](https://giscus.app/zh-CN)。
2. 从 Giscus 配置页面取得 `repoId` 与 `categoryId`。
3. 填入 `src/config.ts` 的 `giscus` 配置，并将 `enabled` 改为 `true`。

未完成配置时，生产站点不会显示空评论区。

## 部署

1. 将源码推送到 `main` 分支。
2. 在仓库 Settings → Pages 中选择 **Deploy from a branch**，发布分支设为 `master`、目录设为 `/ (root)`。
3. 添加 `SITE_URL` Actions variable；以后每次推送 `main`，工作流都会验证并构建站点，然后更新 `master` 上的静态文件。

当前配置面向 `username.github.io` 或自定义域名的根路径部署。
