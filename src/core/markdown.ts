import { formatLocalTimestamp } from './date';
import type { PageClip } from './types';

function yamlString(value: string): string {
  return JSON.stringify(value.replace(/\r\n?/g, '\n'));
}

function removeMatchingHeading(markdown: string, title: string): string {
  const normalized = markdown.trim();
  const lines = normalized.split('\n');
  const firstLine = lines[0]?.replace(/^#\s+/, '').trim();
  return firstLine === title.trim() ? lines.slice(1).join('\n').trim() : normalized;
}

export function buildMarkdown(page: PageClip, title: string, clippedAt = new Date()): string {
  const cleanTitle = title.trim() || page.title.trim() || '未命名网页';
  const body = removeMatchingHeading(page.markdown, cleanTitle);
  const frontmatter = [
    '---',
    `title: ${yamlString(cleanTitle)}`,
    `source: ${yamlString(page.url)}`,
    `author: ${yamlString(page.author)}`,
    `published: ${yamlString(page.published)}`,
    `clipped_at: ${yamlString(formatLocalTimestamp(clippedAt))}`,
    `domain: ${yamlString(page.site)}`,
    '---',
  ].join('\n');
  return `${frontmatter}\n\n# ${cleanTitle}\n\n${body}\n`;
}

export function markdownExcerpt(markdown: string, maxLength = 240): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^[#>*+-]+\s*/gm, '')
    .replace(/[`*_~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
