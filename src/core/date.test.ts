import { describe, expect, it } from 'vitest';
import { formatLocalDate, formatLocalTimestamp } from './date';

describe('date formatting', () => {
  it('formats a local date folder', () => {
    expect(formatLocalDate(new Date(2026, 7, 3, 9, 7, 5))).toBe('2026-08-03');
  });
  it('creates an ISO-like local timestamp', () => {
    expect(formatLocalTimestamp(new Date(2026, 7, 3, 9, 7, 5))).toMatch(/^2026-08-03T09:07:05[+-]\d{2}:\d{2}$/);
  });
});
