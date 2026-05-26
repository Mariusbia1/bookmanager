import {
  CalendarDaysIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import type { Bookmark } from '../types/bookmark'
import { formatShort } from '../utils/dates'
import { useBookmarks } from '../context/BookmarksContext'

type BookmarkCardProps = {
  bookmark: Bookmark
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const {
    archiveBookmark,
    unarchiveBookmark,
    visitBookmark,
    copyUrl,
    togglePinned,
    openEditBookmarkModal,
  } = useBookmarks()

  return (
    <article className="flex flex-col rounded-xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-neutral-900">
      <div className="flex gap-3">
        <img
          src={bookmark.favicon}
          alt=""
          width={40}
          height={40}
          className="mt-0.5 h-10 w-10 shrink-0 rounded-lg bg-[#f0f4f0] object-contain ring-1 ring-black/10 dark:bg-neutral-800 dark:ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate font-semibold text-[#1a1a1a] dark:text-white">
                <Link
                  to={`/bookmark/${bookmark.id}`}
                  className="rounded-sm outline-offset-2 hover:text-[#1a3a2a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:hover:text-emerald-200 dark:focus-visible:outline-emerald-300"
                >
                  {bookmark.title}
                </Link>
              </h2>
              <p className="truncate text-sm text-[#666666] dark:text-neutral-400">
                {bookmark.domain}
              </p>
            </div>
            <div className="dropdown dropdown-end">
              <button
                type="button"
                tabIndex={0}
                className="btn btn-ghost btn-square btn-sm rounded-lg border border-black/10 text-[#1a1a1a] hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
                aria-label={`Actions pour ${bookmark.title}`}
              >
                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu z-20 w-48 rounded-xl border border-black/10 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-neutral-900"
              >
                <li>
                  <button
                    type="button"
                    onClick={() => openEditBookmarkModal(bookmark)}
                  >
                    Modifier
                  </button>
                </li>
                <li>
                  {bookmark.archived ? (
                    <button
                      type="button"
                      onClick={() => unarchiveBookmark(bookmark.id)}
                    >
                      Restaurer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => archiveBookmark(bookmark.id)}
                    >
                      Archiver
                    </button>
                  )}
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      copyUrl(bookmark.id).catch(() => undefined)
                    }
                  >
                    Copier l’URL
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => visitBookmark(bookmark.id)}>
                    Visiter
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#666666] dark:text-neutral-300">
            {bookmark.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-xs font-medium text-[#374151] dark:bg-neutral-800 dark:text-neutral-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <hr className="my-4 border-black/10 dark:border-white/10" />

      <footer className="flex items-center gap-4 text-xs text-[#666666] dark:text-neutral-400">
        <span className="inline-flex items-center gap-1 tabular-nums" title="Vues">
          <EyeIcon className="h-4 w-4" aria-hidden />
          {bookmark.views}
        </span>
        <span
          className="inline-flex items-center gap-1 tabular-nums"
          title="Dernière visite"
        >
          <ClockIcon className="h-4 w-4" aria-hidden />
          {formatShort(bookmark.lastVisited)}
        </span>
        <span
          className="hidden items-center gap-1 tabular-nums sm:inline-flex"
          title="Ajouté le"
        >
          <CalendarDaysIcon className="h-4 w-4" aria-hidden />
          {formatShort(bookmark.addedAt)}
        </span>
        <button
          type="button"
          aria-label={bookmark.pinned ? 'Retirer l’épingle' : 'Épingler'}
          aria-pressed={bookmark.pinned}
          onClick={() => togglePinned(bookmark.id)}
          className="ml-auto rounded-lg border border-transparent p-1 text-[#1a3a2a] transition-colors hover:bg-black/5 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:text-emerald-200 dark:hover:bg-white/10 dark:hover:text-emerald-100 dark:focus-visible:outline-emerald-300"
        >
          {bookmark.pinned ? (
            <MapPinSolid className="h-5 w-5 rotate-[-20deg]" aria-hidden />
          ) : (
            <MapPinIcon className="h-5 w-5 rotate-[-20deg]" aria-hidden />
          )}
        </button>
      </footer>
    </article>
  )
}
