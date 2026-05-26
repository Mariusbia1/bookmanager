import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'
import { MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useBookmarks } from '../context/BookmarksContext'
import { formatLong } from '../utils/dates'

export function DetailPage() {
  const { id } = useParams()
  const {
    getBookmarkById,
    visitBookmark,
    copyUrl,
    openEditBookmarkModal,
    archiveBookmark,
    unarchiveBookmark,
    togglePinned,
  } = useBookmarks()

  const bookmark = id ? getBookmarkById(id) : undefined

  if (!bookmark) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <Link
        to={bookmark.archived ? '/archived' : '/'}
        className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-[#1a3a2a] outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:text-emerald-300 dark:focus-visible:outline-emerald-300"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Retour à la liste
      </Link>

      <article className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          <img
            src={bookmark.favicon}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-[#f0f4f0] object-contain ring-1 ring-black/10 dark:bg-neutral-800 dark:ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">
                  {bookmark.title}
                </h1>
                <p className="mt-1 text-[#666666] dark:text-neutral-400">
                  {bookmark.domain}
                </p>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-block max-w-full truncate text-sm font-medium text-[#1a3a2a] underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:text-emerald-300 dark:focus-visible:outline-emerald-300"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                type="button"
                aria-label={bookmark.pinned ? 'Retirer l’épingle' : 'Épingler'}
                aria-pressed={bookmark.pinned}
                onClick={() => togglePinned(bookmark.id)}
                className="btn btn-ghost btn-square rounded-xl border border-black/10 dark:border-white/15"
              >
                {bookmark.pinned ? (
                  <MapPinSolid className="h-6 w-6 rotate-[-20deg] text-[#1a3a2a] dark:text-emerald-200" aria-hidden />
                ) : (
                  <MapPinIcon className="h-6 w-6 rotate-[-20deg]" aria-hidden />
                )}
              </button>
            </div>

            <p className="mt-4 text-base leading-relaxed text-[#666666] dark:text-neutral-300">
              {bookmark.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {bookmark.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full bg-[#f0f0f0] px-3 py-1 text-sm font-medium text-[#374151] dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <dl className="mt-6 grid gap-4 text-sm text-[#666666] sm:grid-cols-3 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <EyeIcon className="h-5 w-5 shrink-0" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#666666]/80 dark:text-neutral-500">
                    Vues
                  </dt>
                  <dd className="font-medium text-[#1a1a1a] dark:text-white">
                    {bookmark.views}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 shrink-0" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#666666]/80 dark:text-neutral-500">
                    Dernière visite
                  </dt>
                  <dd className="font-medium text-[#1a1a1a] dark:text-white">
                    {formatLong(bookmark.lastVisited)}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 shrink-0" aria-hidden />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#666666]/80 dark:text-neutral-500">
                    Ajouté le
                  </dt>
                  <dd className="font-medium text-[#1a1a1a] dark:text-white">
                    {formatLong(bookmark.addedAt)}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => visitBookmark(bookmark.id)}
                className="btn rounded-xl border-0 bg-[#1a3a2a] text-white hover:bg-[#142e22] dark:bg-emerald-800 dark:hover:bg-emerald-900"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" aria-hidden />
                Visiter le site
              </button>
              <button
                type="button"
                onClick={() =>
                  copyUrl(bookmark.id).catch(() => undefined)
                }
                className="btn rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-950"
              >
                <DocumentDuplicateIcon className="h-5 w-5" aria-hidden />
                Copier l’URL
              </button>
              <button
                type="button"
                onClick={() => openEditBookmarkModal(bookmark)}
                className="btn rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-950"
              >
                Modifier
              </button>
              {bookmark.archived ? (
                <button
                  type="button"
                  onClick={() => unarchiveBookmark(bookmark.id)}
                  className="btn rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-950"
                >
                  Restaurer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => archiveBookmark(bookmark.id)}
                  className="btn rounded-xl border border-black/10 bg-white dark:border-white/15 dark:bg-neutral-950"
                >
                  Archiver
                </button>
              )}
            </div>

            {bookmark.archived ? (
              <p className="mt-4 text-sm text-amber-800 dark:text-amber-200">
                Ce favori est archivé. Il n’apparaît plus sur l’accueil.
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  )
}
