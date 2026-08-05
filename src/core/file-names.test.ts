import { describe, expect, it } from 'vitest';
import { markdownFileName, nextAvailableFileName, safeFileStem } from './file-names';

describe('file names', () => {
  it('removes invalid path characters', () => {
    expect(markdownFileName('A/B: C?')).toBe('A-B- C-.md');
  });
  it('protects reserved and empty names', () => {
    expect(safeFileStem('CON')).toBe('_CON');
    expect(safeFileStem('   ')).toBe('未命名网页');
  });
  it('adds a suffix for existing files', async () => {
    const existing = new Set(['文章.md', '文章-2.md']);
    expect(await nextAvailableFileName('文章.md', async (name) => existing.has(name), false)).toBe('文章-3.md');
  });
});
