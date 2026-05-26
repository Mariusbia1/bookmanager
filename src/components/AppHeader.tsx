import {
  Bars3Icon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from '@heroicons/react/24/outline'
import { useBookmarks } from '../context/BookmarksContext'

export function AppHeader() {
  const {
    searchQuery,
    setSearchQuery,
    setSidebarOpen,
    userProfile,
    theme,
    toggleTheme,
    openAddBookmarkModal,
  } = useBookmarks()

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-bm-page/90 px-3 py-3 backdrop-blur dark:border-white/10 dark:bg-neutral-950/85">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 md:gap-4 lg:gap-6">
        <button
          type="button"
          className="btn btn-square btn-ghost border border-black/10 text-[#1a1a1a] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] lg:hidden dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          aria-label="Ouvrir le menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" aria-hidden />
        </button>

        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#666666]" aria-hidden />
          <label htmlFor="search-bookmarks" className="sr-only">
            Recherche par titre
          </label>
          <input
            id="search-bookmarks"
            type="search"
            placeholder="Rechercher par titre…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input h-11 w-full rounded-xl border border-black/10 bg-white pl-10 pr-3 text-[#1a1a1a] shadow-sm outline-none placeholder:text-neutral-400 focus:border-[#1a3a2a]/40 focus:ring-2 focus:ring-[#1a3a2a]/20 dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:focus:border-emerald-500/40 dark:focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? 'Passer au thème clair'
                : 'Passer au thème sombre'
            }
            className="btn btn-ghost btn-square rounded-xl border border-black/10 text-[#1a1a1a] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:border-white/15 dark:text-white dark:hover:bg-white/10"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6" aria-hidden />
            ) : (
              <MoonIcon className="h-6 w-6" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={openAddBookmarkModal}
            className="btn hidden h-11 min-h-0 rounded-xl border-0 bg-[#1a3a2a] px-4 font-medium text-white hover:bg-[#142e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3a2a] sm:inline-flex dark:bg-emerald-800 dark:hover:bg-emerald-900 dark:focus-visible:outline-emerald-400"
          >
            <PlusIcon className="h-5 w-5" aria-hidden />
            Ajouter un favori
          </button>

          <button
            type="button"
            className="btn btn-square rounded-xl bg-[#1a3a2a] text-white hover:bg-[#142e22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3a2a] sm:hidden dark:bg-emerald-800 dark:focus-visible:outline-emerald-400"
            aria-label="Ajouter un favori"
            onClick={openAddBookmarkModal}
          >
            <PlusIcon className="h-6 w-6" aria-hidden />
          </button>

          <div className="avatar">
            <div className="w-11 rounded-full ring-2 ring-black/10 ring-offset-2 ring-offset-bm-page dark:ring-white/15 dark:ring-offset-neutral-950">
              <img
                src={userProfile?.avatar ?? 'https://i.pravatar.cc/150'}
                alt={userProfile ? `Avatar de ${userProfile.name}` : 'Avatar utilisateur'}
                width={44}
                height={44}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
