import type { ConflictPolicy } from './types';

const INVALID_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f]/g;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

export function safeFileStem(title: string): string {
  let stem = title
    .normalize('NFKC')
    .replace(INVALID_CHARACTERS, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim();

  if (!stem) stem = '未命名网页';
  if (WINDOWS_RESERVED.test(stem)) stem = `_${stem}`;
  return stem.slice(0, 120).replace(/[. ]+$/g, '') || '未命名网页';
}

export function markdownFileName(title: string): string {
  return `${safeFileStem(title)}.md`;
}

export async function nextAvailableFileName(
  requestedName: string,
  exists: (fileName: string) => Promise<boolean>,
  overwrite: boolean,
): Promise<string> {
  if (overwrite || !(await exists(requestedName))) return requestedName;
  const stem = requestedName.replace(/\.md$/i, '');
  for (let suffix = 2; suffix < 10_000; suffix += 1) {
    const candidate = `${stem}-${suffix}.md`;
    if (!(await exists(candidate))) return candidate;
  }
  throw new Error('无法生成可用的文件名');
}

export function normalizeConflictPolicy(value: unknown): ConflictPolicy {
  return value === 'overwrite' ? 'overwrite' : 'uniquify';
}
