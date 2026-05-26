/* eslint-disable react-refresh/only-export-components -- Provider + hook doivent partager ce module */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { seedBookmarks } from '../data/bookmarks.js'
import type { Bookmark, SortOption, UserProfile } from '../types/bookmark'
import { faviconForDomain, hostnameFromUrl } from '../utils/domain'
import { matchesTagFilters } from '../utils/filterBookmarks'

const STORAGE_KEY = 'bookmark-manager-v1'

type PersistedPayload = {
  bookmarks: Bookmark[]
  theme: 'light' | 'dark'
}

type JsonUser = {
  id: number
  name: string
  username: string
  email: string
  website: string
}

function loadPersisted(): PersistedPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedPayload
  } catch {
    return null
  }
}

function savePersisted(payload: PersistedPayload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function bookmarkFromSeed(
  seed: Omit<Bookmark, 'id'>,
  userId: number,
  index: number,
): Bookmark {
  return {
    ...seed,
    id: `bm-${userId ?? index + 1}`,
  }
}

function sortList(list: Bookmark[], sortBy: SortOption): Bookmark[] {
  const next = [...list]
  switch (sortBy) {
    case 'added-desc':
      return next.sort(
        (a, b) =>
          new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      )
    case 'visited-desc':
      return next.sort((a, b) => {
        const ta = a.lastVisited ? new Date(a.lastVisited).getTime() : 0
        const tb = b.lastVisited ? new Date(b.lastVisited).getTime() : 0
        return tb - ta
      })
    case 'views-desc':
      return next.sort((a, b) => b.views - a.views)
    default:
      return next
  }
}

type BookmarksContextValue = {
  bookmarks: Bookmark[]
  loading: boolean
  initialized: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedTags: string[]
  toggleTag: (tag: string) => void
  resetTagFilters: () => void
  sortBy: SortOption
  setSortBy: (s: SortOption) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  userProfile: UserProfile | null
  toastMessage: string | null
  setToastMessage: (m: string | null) => void
  bookmarkModalOpen: boolean
  bookmarkDraft: Bookmark | null
  openAddBookmarkModal: () => void
  openEditBookmarkModal: (b: Bookmark) => void
  closeBookmarkModal: () => void
  filteredHome: Bookmark[]
  filteredArchived: Bookmark[]
  tagStats: { tag: string; count: number }[]
  getBookmarkById: (id: string) => Bookmark | undefined
  addBookmark: (input: Omit<Bookmark, 'id' | 'views' | 'archived'> & Partial<Pick<Bookmark, 'views' | 'archived'>>) => void
  updateBookmark: (id: string, patch: Partial<Bookmark>) => void
  archiveBookmark: (id: string) => void
  unarchiveBookmark: (id: string) => void
  togglePinned: (id: string) => void
  visitBookmark: (id: string) => void
  copyUrl: (id: string) => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('added-desc')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false)
  const [bookmarkDraft, setBookmarkDraft] = useState<Bookmark | null>(null)

  const bookmarksRef = useRef(bookmarks)

  useEffect(() => {
    bookmarksRef.current = bookmarks
  })

  /** Premier chargement : localStorage OU graines + API jsonplaceholder */
  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const persisted = loadPersisted()

      try {
        const [usersRes, meRes] = await Promise.all([
          fetch(
            'https://jsonplaceholder.typicode.com/users?_limit=10',
          ) as Promise<Response>,
          fetch('https://jsonplaceholder.typicode.com/users/1') as Promise<Response>,
        ])

        const users = (await usersRes.json()) as JsonUser[]
        const me = (await meRes.json()) as JsonUser

        if (cancelled) return

        if (persisted?.bookmarks?.length) {
          setBookmarks(persisted.bookmarks)
        } else {
          const seedsTyped = seedBookmarks as Omit<Bookmark, 'id'>[]
          const merged = seedsTyped.map((seed, index) =>
            bookmarkFromSeed(seed, users[index]?.id ?? index + 1, index),
          )
          setBookmarks(merged)
        }

        if (persisted?.theme === 'dark' || persisted?.theme === 'light') {
          setTheme(persisted.theme)
        }

        setUserProfile({
          name: me.name,
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(me.email)}`,
        })
      } catch {
        if (cancelled) return

        if (persisted?.bookmarks?.length) {
          setBookmarks(persisted.bookmarks)
        } else {
          const seedsTyped = seedBookmarks as Omit<Bookmark, 'id'>[]
          setBookmarks(
            seedsTyped.map((seed, index) =>
              bookmarkFromSeed(seed, index + 1, index),
            ),
          )
        }

        if (persisted?.theme === 'dark' || persisted?.theme === 'light') {
          setTheme(persisted.theme)
        }

        setUserProfile({
          name: 'Invité',
          avatar: 'https://i.pravatar.cc/150?u=fallback',
        })
      } finally {
        if (!cancelled) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  /** Applique le thème au document pour Tailwind (`dark`) et DaisyUI (`data-theme`) */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
  }, [theme])

  /** Persiste favoris + thème une fois initialisé */
  useEffect(() => {
    if (!initialized || loading) return
    savePersisted({ bookmarks, theme })
  }, [bookmarks, theme, initialized, loading])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }, [])

  const resetTagFilters = useCallback(() => {
    setSelectedTags([])
  }, [])

  const openAddBookmarkModal = useCallback(() => {
    setBookmarkDraft(null)
    setBookmarkModalOpen(true)
  }, [])

  const openEditBookmarkModal = useCallback((b: Bookmark) => {
    setBookmarkDraft(b)
    setBookmarkModalOpen(true)
  }, [])

  const closeBookmarkModal = useCallback(() => {
    setBookmarkModalOpen(false)
    setBookmarkDraft(null)
  }, [])

  const getBookmarkById = useCallback(
    (id: string) => bookmarks.find((b) => b.id === id),
    [bookmarks],
  )

  const addBookmark = useCallback(
    (input: Omit<Bookmark, 'id' | 'views' | 'archived'> &
      Partial<Pick<Bookmark, 'views' | 'archived'>>) => {
      const domain = input.domain || hostnameFromUrl(input.url)
      const id = `bm-${Date.now()}`
      const bookmark: Bookmark = {
        ...input,
        id,
        domain,
        favicon: input.favicon || faviconForDomain(domain),
        views: input.views ?? 0,
        archived: input.archived ?? false,
      }
      setBookmarks((prev) => [bookmark, ...prev])
    },
    [],
  )

  const updateBookmark = useCallback((id: string, patch: Partial<Bookmark>) => {
    setBookmarks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b
        let next = { ...b, ...patch }
        if (patch.url) {
          const domain = hostnameFromUrl(patch.url)
          next = { ...next, domain, favicon: faviconForDomain(domain) }
        }
        return next
      }),
    )
  }, [])

  const archiveBookmark = useCallback((id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, archived: true } : b)),
    )
  }, [])

  const unarchiveBookmark = useCallback((id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, archived: false } : b)),
    )
  }, [])

  const togglePinned = useCallback((id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, pinned: !b.pinned } : b)),
    )
  }, [])

  const visitBookmark = useCallback((id: string) => {
    let urlToOpen: string | null = null

    setBookmarks((prev) => {
      const target = prev.find((b) => b.id === id)
      if (!target) return prev
      urlToOpen = target.url
      return prev.map((bk) =>
        bk.id === id
          ? {
              ...bk,
              views: bk.views + 1,
              lastVisited: new Date().toISOString(),
            }
          : bk,
      )
    })

    if (urlToOpen) {
      queueMicrotask(() => {
        window.open(urlToOpen!, '_blank', 'noopener,noreferrer')
      })
    }
  }, [])

  const copyUrl = useCallback(async (id: string) => {
    const b = bookmarksRef.current.find((bb) => bb.id === id)
    if (!b) return

    try {
      await navigator.clipboard.writeText(b.url)
      setToastMessage('URL copiée dans le presse-papiers')
      window.setTimeout(() => setToastMessage(null), 2500)
    } catch {
      setToastMessage('Impossible de copier l’URL')
      window.setTimeout(() => setToastMessage(null), 2500)
    }
  }, [])

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>()
    for (const b of bookmarks) {
      for (const tag of b.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag, 'fr'))
  }, [bookmarks])

  const filteredHome = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = bookmarks.filter((b) => !b.archived)
    if (q) list = list.filter((b) => b.title.toLowerCase().includes(q))
    list = list.filter((b) => matchesTagFilters(b, selectedTags))
    return sortList(list, sortBy)
  }, [bookmarks, searchQuery, selectedTags, sortBy])

  const filteredArchived = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = bookmarks.filter((b) => b.archived)
    if (q) list = list.filter((b) => b.title.toLowerCase().includes(q))
    list = list.filter((b) => matchesTagFilters(b, selectedTags))
    return sortList(list, sortBy)
  }, [bookmarks, searchQuery, selectedTags, sortBy])

  const value: BookmarksContextValue = useMemo(
    () => ({
      bookmarks,
      loading,
      initialized,
      searchQuery,
      setSearchQuery,
      selectedTags,
      toggleTag,
      resetTagFilters,
      sortBy,
      setSortBy,
      theme,
      toggleTheme,
      sidebarOpen,
      setSidebarOpen,
      userProfile,
      toastMessage,
      setToastMessage,
      bookmarkModalOpen,
      bookmarkDraft,
      openAddBookmarkModal,
      openEditBookmarkModal,
      closeBookmarkModal,
      filteredHome,
      filteredArchived,
      tagStats,
      getBookmarkById,
      addBookmark,
      updateBookmark,
      archiveBookmark,
      unarchiveBookmark,
      togglePinned,
      visitBookmark,
      copyUrl,
    }),
    [
      bookmarks,
      loading,
      initialized,
      searchQuery,
      selectedTags,
      toggleTag,
      resetTagFilters,
      sortBy,
      theme,
      toggleTheme,
      sidebarOpen,
      userProfile,
      toastMessage,
      bookmarkModalOpen,
      bookmarkDraft,
      openAddBookmarkModal,
      openEditBookmarkModal,
      closeBookmarkModal,
      filteredHome,
      filteredArchived,
      tagStats,
      getBookmarkById,
      addBookmark,
      updateBookmark,
      archiveBookmark,
      unarchiveBookmark,
      togglePinned,
      visitBookmark,
      copyUrl,
    ],
  )

  return (
    <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks doit être utilisé dans BookmarksProvider')
  return ctx
}
