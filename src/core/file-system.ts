import { formatLocalDate } from './date';
import { setDirectoryHandle } from './database';
import { markdownFileName, nextAvailableFileName } from './file-names';
import type { ConflictPolicy, SaveResult } from './types';

const READ_WRITE_PERMISSION: FileSystemHandlePermissionDescriptor = { mode: 'readwrite' };

export async function chooseDirectory(
  previousHandle?: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('当前浏览器不支持选择本地目录，请使用最新版 Chrome 或 Edge');
  }
  const handle = await window.showDirectoryPicker({
    id: 'cndpaper-clippings',
    mode: 'readwrite',
    startIn: previousHandle ?? 'documents',
  });
  await setDirectoryHandle(handle);
  return handle;
}

export async function directoryPermissionState(handle: FileSystemDirectoryHandle): Promise<PermissionState> {
  return handle.queryPermission(READ_WRITE_PERMISSION);
}

export async function ensureDirectoryPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  return (await handle.requestPermission(READ_WRITE_PERMISSION)) === 'granted';
}

async function fileExists(directory: FileSystemDirectoryHandle, fileName: string): Promise<boolean> {
  try {
    await directory.getFileHandle(fileName);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') return false;
    throw error;
  }
}

export async function saveMarkdownFile(
  rootDirectory: FileSystemDirectoryHandle,
  title: string,
  content: string,
  conflictPolicy: ConflictPolicy,
  savedAt = new Date(),
): Promise<SaveResult> {
  const dateDirectoryName = formatLocalDate(savedAt);
  const dateDirectory = await rootDirectory.getDirectoryHandle(dateDirectoryName, { create: true });
  const requestedName = markdownFileName(title);
  const finalName = await nextAvailableFileName(
    requestedName,
    (candidate) => fileExists(dateDirectory, candidate),
    conflictPolicy === 'overwrite',
  );
  const fileHandle = await dateDirectory.getFileHandle(finalName, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(content);
  } finally {
    await writable.close();
  }
  return { directoryName: rootDirectory.name, dateDirectory: dateDirectoryName, fileName: finalName };
}
