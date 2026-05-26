import { ArrowsUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import type { SortOption } from '../types/bookmark'
import { useBookmarks } from '../context/BookmarksContext'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'added-desc', label: 'Récemment ajoutés' },
  { value: 'visited-desc', label: 'Récemment visités' },
  { value: 'views-desc', label: 'Les plus visités' },
]

export function SortMenu() {
  const { sortBy, setSortBy } = useBookmarks()
  const current = OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Trier'

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn h-10 min-h-0 gap-2 rounded-xl border border-black/10 bg-white px-3 text-sm font-medium text-[#1a1a1a] shadow-sm hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1a3a2a] dark:border-white/15 dark:bg-neutral-900 dark:text-white dark:hover:bg-white/5 dark:focus-visible:outline-emerald-300"
        aria-haspopup="listbox"
      >
        <ArrowsUpDownIcon className="h-4 w-4" aria-hidden />
        Trier
        <span className="hidden text-xs font-normal text-[#666666] sm:inline dark:text-neutral-400">
          · {current}
        </span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-50 mt-2 w-56 rounded-box border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-neutral-900"
        role="listbox"
        aria-label="Options de tri"
      >
        {OPTIONS.map(({ value, label }) => (
          <li key={value}>
            <button
              type="button"
              role="option"
              aria-selected={sortBy === value}
              className="flex gap-2 rounded-lg py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => setSortBy(value)}
            >
              {sortBy === value ? (
                <CheckIcon className="h-4 w-4 text-[#1a3a2a] dark:text-emerald-300" aria-hidden />
              ) : (
                <span className="inline-block w-4 shrink-0" aria-hidden />
              )}
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
