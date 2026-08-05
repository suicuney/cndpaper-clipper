import { formatLocalDate } from './core/date';
import { getDirectoryHandle } from './core/database';
import { ensureDirectoryPermission, saveMarkdownFile } from './core/file-system';
import { markdownFileName } from './core/file-names';
import { buildMarkdown, markdownExcerpt } from './core/markdown';
import { loadSettings } from './core/settings';
import type { AppSettings, PageClip } from './core/types';

interface ExtractResponse { ok: boolean; page?: PageClip; error?: string }

let pageClip: PageClip | undefined;
let directoryHandle: FileSystemDirectoryHandle | undefined;
let appSettings: AppSettings | undefined;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`缺少界面元素：${id}`);
  return found as T;
}

function setStatus(message: string, kind: 'neutral' | 'success' | 'error' = 'neutral'): void {
  const status = element<HTMLDivElement>('status-message');
  status.textContent = message;
  status.dataset.kind = kind;
  status.hidden = !message;
}

function updateDestinationPreview(): void {
  const title = element<HTMLInputElement>('page-title').value;
  const directoryName = directoryHandle?.name ?? '尚未选择目录';
  element<HTMLDivElement>('destination-path').textContent = [
    directoryName,
    formatLocalDate(),
    markdownFileName(title),
  ].join(' / ');
}

function renderPage(page: PageClip): void {
  element<HTMLInputElement>('page-title').value = page.title;
  element<HTMLDivElement>('page-source').textContent = `${page.site} · 约 ${Math.max(
    1,
    Math.ceil(page.wordCount / 300),
  )} 分钟阅读`;
  element<HTMLParagraphElement>('page-excerpt').textContent =
    markdownExcerpt(page.markdown) || page.description || '已提取网页正文';
  element<HTMLDivElement>('page-content').hidden = false;
  updateDestinationPreview();
}

async function activeTab(): Promise<chrome.tabs.Tab> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) throw new Error('无法获取当前标签页');
  if (!/^https?:\/\//i.test(tab.url)) throw new Error('当前页面不支持裁剪，请打开普通网页后重试');
  return tab;
}

async function extractCurrentPage(): Promise<PageClip> {
  const tab = await activeTab();
  await chrome.scripting.executeScript({ target: { tabId: tab.id as number }, files: ['extractor.js'] });
  const response = (await chrome.tabs.sendMessage(tab.id as number, {
    action: 'cndpaper-extract-page',
  })) as ExtractResponse;
  if (!response.ok || !response.page) throw new Error(response.error || '网页解析失败');
  return response.page;
}

async function saveCurrentPage(): Promise<void> {
  if (!pageClip || !directoryHandle || !appSettings) return;
  const button = element<HTMLButtonElement>('save-button');
  const title = element<HTMLInputElement>('page-title').value.trim() || pageClip.title;
  button.disabled = true;
  button.textContent = '正在保存…';
  setStatus('');
  try {
    if (!(await ensureDirectoryPermission(directoryHandle))) {
      throw new Error('没有目录写入权限，请在设置中重新授权');
    }
    const savedAt = new Date();
    const result = await saveMarkdownFile(
      directoryHandle,
      title,
      buildMarkdown(pageClip, title, savedAt),
      appSettings.conflictPolicy,
      savedAt,
    );
    element<HTMLDivElement>('destination-path').textContent = [
      result.directoryName,
      result.dateDirectory,
      result.fileName,
    ].join(' / ');
    button.textContent = '已保存';
    setStatus(`保存成功：${result.dateDirectory}/${result.fileName}`, 'success');
  } catch (error) {
    button.disabled = false;
    button.textContent = '保存为 Markdown';
    setStatus(error instanceof Error ? error.message : '保存失败', 'error');
  }
}

async function initialize(): Promise<void> {
  element<HTMLButtonElement>('settings-button').addEventListener('click', () => void chrome.runtime.openOptionsPage());
  element<HTMLButtonElement>('setup-button').addEventListener('click', () => void chrome.runtime.openOptionsPage());
  element<HTMLInputElement>('page-title').addEventListener('input', updateDestinationPreview);
  element<HTMLButtonElement>('save-button').addEventListener('click', () => void saveCurrentPage());
  setStatus('正在提取当前网页…');
  element<HTMLButtonElement>('save-button').disabled = true;
  try {
    [directoryHandle, appSettings, pageClip] = await Promise.all([
      getDirectoryHandle(),
      loadSettings(),
      extractCurrentPage(),
    ]);
    renderPage(pageClip);
    const setup = element<HTMLDivElement>('setup-state');
    const button = element<HTMLButtonElement>('save-button');
    if (!directoryHandle) {
      setup.hidden = false;
      button.hidden = true;
      setStatus('首次使用需要先选择一个本地保存目录');
    } else {
      setup.hidden = true;
      button.hidden = false;
      button.disabled = false;
      setStatus('');
    }
  } catch (error) {
    setStatus(error instanceof Error ? error.message : '初始化失败', 'error');
  } finally {
    element<HTMLDivElement>('loading-state').hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => void initialize());
