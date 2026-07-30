import { Story } from '../types';

export const STORY_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Parses relative time strings like '10m ago', '45m ago', '2h ago', '3h ago'
 * or standard ISO date strings into a JavaScript Date object timestamp in MS.
 */
export function getStoryCreatedAtMs(createdAt: string): number {
  if (!createdAt) return Date.now();

  // If it's already an ISO timestamp or parseable date string
  const parsedDate = Date.parse(createdAt);
  if (!isNaN(parsedDate) && parsedDate > 1000000000) {
    return parsedDate;
  }

  // Parse relative time strings e.g. "10m ago", "2h ago", "25h ago", "Just now"
  const lower = createdAt.toLowerCase().trim();
  if (lower === 'just now' || lower === 'now') {
    return Date.now();
  }

  const match = lower.match(/^(\d+)\s*([smhd])\s*(ago)?$/);
  if (match) {
    const val = parseInt(match[1], 10);
    const unit = match[2];
    let offsetMs = 0;
    if (unit === 's') offsetMs = val * 1000;
    if (unit === 'm') offsetMs = val * 60 * 1000;
    if (unit === 'h') offsetMs = val * 60 * 60 * 1000;
    if (unit === 'd') offsetMs = val * 24 * 60 * 60 * 1000;
    return Date.now() - offsetMs;
  }

  return Date.now();
}

/**
 * Checks if a story is older than 24 hours.
 */
export function isStoryExpired(story: Story): boolean {
  const createdMs = getStoryCreatedAtMs(story.createdAt);
  const now = Date.now();
  return (now - createdMs) >= STORY_EXPIRATION_MS;
}

/**
 * Returns formatted time remaining before 24h expiration (e.g. "23h 50m left")
 */
export function getStoryTimeRemaining(story: Story): string {
  const createdMs = getStoryCreatedAtMs(story.createdAt);
  const expiresAtMs = createdMs + STORY_EXPIRATION_MS;
  const remainingMs = expiresAtMs - Date.now();

  if (remainingMs <= 0) return 'Expired';

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }
  return `${minutes}m left`;
}

/**
 * Filters out expired stories from an array.
 */
export function filterActiveStories(stories: Story[]): Story[] {
  return stories.filter(story => !isStoryExpired(story));
}
