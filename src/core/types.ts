export type ConflictPolicy = 'uniquify' | 'overwrite';

export interface AppSettings {
  conflictPolicy: ConflictPolicy;
}

export interface PageClip {
  title: string;
  url: string;
  author: string;
  published: string;
  description: string;
  site: string;
  wordCount: number;
  markdown: string;
}

export interface SaveResult {
  directoryName: string;
  dateDirectory: string;
  fileName: string;
}
