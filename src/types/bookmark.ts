export type Bookmark = {
  id: string
  title: string
  url: string
  domain: string
  description: string
  tags: string[]
  favicon: string
  views: number
  lastVisited: string | null
  addedAt: string
  pinned: boolean
  archived: boolean
}

export type SortOption =
  | 'added-desc'
  | 'visited-desc'
  | 'views-desc'

export type UserProfile = {
  name: string
  avatar: string
}
