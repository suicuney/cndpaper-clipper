import { normalizeConflictPolicy } from './file-names';
import type { AppSettings } from './types';

const DEFAULT_SETTINGS: AppSettings = { conflictPolicy: 'uniquify' };

export async function loadSettings(): Promise<AppSettings> {
  const stored = await chrome.storage.local.get('conflictPolicy');
  return { conflictPolicy: normalizeConflictPolicy(stored.conflictPolicy) };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  await chrome.storage.local.set({
    conflictPolicy: normalizeConflictPolicy(settings.conflictPolicy ?? DEFAULT_SETTINGS.conflictPolicy),
  });
}
