import {
  ArchiveBoxIcon,
  BookmarkIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid } from '@heroicons/react/24/solid'
import { ArchiveBoxIcon as ArchiveSolid } from '@heroicons/react/24/solid'
import { NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useBookmarks } from '../context/BookmarksContext'

export function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    tagStats,
    selectedTags,
    toggleTag,
    resetTagFilters,
  } = useBookmarks()

  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  return (
    <>
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-black/10 bg-white transition-transform duration-200 dark:border-white/10 dark:bg-neutral-900',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="Navigation et filtres"
      >
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4 dark:border-white/10">
          <BookmarkIcon className="h-9 w-9 text-[#1a3a2a] dark:text-emerald-200" aria-hidden />
          <div>
            <p className="text-base font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
              Bookmark Manager
            </p>
          </div>
        </div>

        <nav className="space-y-1 px-3 py-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a] outline-offset-2 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:text-neutral-100 dark:focus-visible:outline-emerald-300',
                isActive ? 'bg-black/[0.06] dark:bg-white/10' : '',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <HomeIconSolid className="h-5 w-5" aria-hidden />
                ) : (
                  <HomeIcon className="h-5 w-5" aria-hidden />
                )}
                Accueil
              </>
            )}
          </NavLink>

          <NavLink
            to="/archived"
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a] outline-offset-2 transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:text-neutral-100 dark:focus-visible:outline-emerald-300',
                isActive ? 'bg-black/[0.06] dark:bg-white/10' : '',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <ArchiveSolid className="h-5 w-5" aria-hidden />
                ) : (
                  <ArchiveBoxIcon className="h-5 w-5" aria-hidden />
                )}
                Archivés
              </>
            )}
          </NavLink>
        </nav>

        <div className="flex min-h-0 flex-1 flex-col border-t border-black/5 px-3 pb-6 pt-2 dark:border-white/10">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#666666] dark:text-neutral-400">
              Tags
            </p>
            <button
              type="button"
              onClick={resetTagFilters}
              className="text-xs font-medium text-[#1a3a2a] underline underline-offset-2 hover:opacity-90 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a3a2a] dark:text-emerald-200 dark:focus-visible:outline-emerald-300"
            >
              Réinitialiser
            </button>
          </div>
          <ul className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-1">
            {tagStats.map(({ tag, count }) => (
              <li key={tag}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary rounded border-[#1a3a2a]"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                  />
                  <span className="flex-1 truncate text-[#1a1a1a] dark:text-neutral-100">{tag}</span>
                  <span className="text-xs tabular-nums text-[#666666] dark:text-neutral-400">
                    {count}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
    </>
  )
}
