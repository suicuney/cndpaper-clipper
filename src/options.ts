import { getDirectoryHandle } from './core/database';
import { chooseDirectory, directoryPermissionState, ensureDirectoryPermission } from './core/file-system';
import { loadSettings, saveSettings } from './core/settings';
import type { ConflictPolicy } from './core/types';

let currentDirectoryHandle: FileSystemDirectoryHandle | undefined;

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`缺少界面元素：${id}`);
  return found as T;
}

function setDirectoryStatus(name: string, status: string, kind: 'neutral' | 'success' | 'error'): void {
  element<HTMLDivElement>('directory-name').textContent = name;
  const badge = element<HTMLSpanElement>('directory-status');
  badge.textContent = status;
  badge.dataset.kind = kind;
}

async function refreshDirectory(): Promise<void> {
  currentDirectoryHandle = await getDirectoryHandle();
  if (!currentDirectoryHandle) {
    setDirectoryStatus('尚未选择目录', '未设置', 'neutral');
    return;
  }
  const permission = await directoryPermissionState(currentDirectoryHandle);
  setDirectoryStatus(
    currentDirectoryHandle.name,
    permission === 'granted' ? '已授权' : '需要重新授权',
    permission === 'granted' ? 'success' : 'error',
  );
}

async function selectDirectory(): Promise<void> {
  const button = element<HTMLButtonElement>('choose-directory');
  button.disabled = true;
  try {
    currentDirectoryHandle = await chooseDirectory(currentDirectoryHandle);
    setDirectoryStatus(currentDirectoryHandle.name, '已授权', 'success');
    element<HTMLDivElement>('save-feedback').textContent = '目录设置已保存';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    element<HTMLDivElement>('save-feedback').textContent =
      error instanceof Error ? error.message : '目录选择失败';
  } finally {
    button.disabled = false;
  }
}

async function authorizeCurrentDirectory(): Promise<void> {
  if (!currentDirectoryHandle) return selectDirectory();
  if (await ensureDirectoryPermission(currentDirectoryHandle)) {
    setDirectoryStatus(currentDirectoryHandle.name, '已授权', 'success');
    element<HTMLDivElement>('save-feedback').textContent = '目录授权已恢复';
  } else {
    setDirectoryStatus(currentDirectoryHandle.name, '授权失败', 'error');
  }
}

async function initialize(): Promise<void> {
  element<HTMLSelectElement>('conflict-policy').value = (await loadSettings()).conflictPolicy;
  await refreshDirectory();
  element<HTMLButtonElement>('choose-directory').addEventListener('click', () => void selectDirectory());
  element<HTMLButtonElement>('authorize-directory').addEventListener('click', () => void authorizeCurrentDirectory());
  element<HTMLSelectElement>('conflict-policy').addEventListener('change', async (event) => {
    await saveSettings({ conflictPolicy: (event.target as HTMLSelectElement).value as ConflictPolicy });
    element<HTMLDivElement>('save-feedback').textContent = '重名处理方式已保存';
  });
}

document.addEventListener('DOMContentLoaded', () => void initialize());
