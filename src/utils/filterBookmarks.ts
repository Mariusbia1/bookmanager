import type { Bookmark } from '../types/bookmark'

export function matchesTagFilters(
  bookmark: Bookmark,
  selectedTags: string[],
): boolean {
  if (!selectedTags.length) return true
  return selectedTags.some((tag) => bookmark.tags.includes(tag))
}
