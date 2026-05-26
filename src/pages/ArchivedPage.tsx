import { BookmarkCard } from '../components/BookmarkCard'
import { SortMenu } from '../components/SortMenu'
import { useBookmarks } from '../context/BookmarksContext'

export function ArchivedPage() {
  const { filteredArchived } = useBookmarks()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-[#1a1a1a] dark:text-white">
          Favoris archivés
        </h1>
        <SortMenu />
      </div>

      {filteredArchived.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/15 bg-white/60 px-6 py-12 text-center text-[#666666] dark:border-white/20 dark:bg-neutral-900/60 dark:text-neutral-400">
          Aucun favori archivé pour l’instant.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredArchived.map((b) => (
            <BookmarkCard key={b.id} bookmark={b} />
          ))}
        </div>
      )}
    </div>
  )
}
