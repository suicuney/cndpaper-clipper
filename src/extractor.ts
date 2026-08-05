import Defuddle, { createMarkdownContent } from 'defuddle/full';
import type { PageClip } from './core/types';

declare global {
  interface Window {
    __cndpaperExtractorReady?: boolean;
  }
}

function metaContent(...selectors: string[]): string {
  for (const selector of selectors) {
    const value = document.querySelector<HTMLMetaElement>(selector)?.content?.trim();
    if (value) return value;
  }
  return '';
}

async function extractPage(): Promise<PageClip> {
  const parser = new Defuddle(document, { url: document.URL });
  const timeout = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('网页解析超时')), 10_000);
  });
  const parsed = await Promise.race([parser.parseAsync(), timeout]).catch(() => parser.parse());
  const url = document.URL;
  const title = parsed.title?.trim() || document.title.trim() || '未命名网页';
  const htmlContent = parsed.content?.trim() || document.body?.innerHTML || '';
  const markdown = createMarkdownContent(htmlContent, url).trim();
  if (!markdown) throw new Error('没有提取到可保存的网页正文');

  return {
    title,
    url,
    author: parsed.author?.trim() || metaContent('meta[name="author"]', 'meta[property="article:author"]'),
    published:
      parsed.published?.trim() ||
      metaContent(
        'meta[property="article:published_time"]',
        'meta[name="date"]',
        'meta[name="publishdate"]',
      ),
    description:
      parsed.description?.trim() ||
      metaContent('meta[name="description"]', 'meta[property="og:description"]'),
    site: parsed.site?.trim() || new URL(url).hostname,
    wordCount: Number(parsed.wordCount) || markdown.length,
    markdown,
  };
}

if (!window.__cndpaperExtractorReady) {
  window.__cndpaperExtractorReady = true;
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!message || typeof message !== 'object' || !('action' in message)) return undefined;
    if ((message as { action: string }).action !== 'cndpaper-extract-page') return undefined;
    void extractPage()
      .then((page) => sendResponse({ ok: true, page }))
      .catch((error: unknown) => {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : '网页解析失败' });
      });
    return true;
  });
}
