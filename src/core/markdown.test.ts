import { describe, expect, it } from 'vitest';
import { buildMarkdown, markdownExcerpt } from './markdown';
import type { PageClip } from './types';

const page: PageClip = {
  title: '示例', url: 'https://example.com/post', author: '作者', published: '2026-08-01',
  description: '描述', site: 'example.com', wordCount: 100, markdown: '# 示例\n\n正文内容',
};

describe('markdown output', () => {
  it('writes fixed frontmatter and removes a duplicate heading', () => {
    const output = buildMarkdown(page, '示例', new Date(2026, 7, 3, 9, 7, 5));
    expect(output).toContain('title: "示例"');
    expect(output).toContain('source: "https://example.com/post"');
    expect(output.match(/^# 示例$/gm)).toHaveLength(1);
  });
  it('creates a plain excerpt', () => {
    expect(markdownExcerpt('## 标题\n\n[链接](https://example.com) **正文**')).toBe('标题 链接 正文');
  });
});
