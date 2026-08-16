import type { APIRoute } from 'astro';
import { siteConfig } from '../config';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(siteConfig.siteUrl);
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', origin).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
