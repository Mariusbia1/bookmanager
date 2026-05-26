import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'
import { useBookmarks } from '../context/BookmarksContext'

export function AppLayout() {
  const { toastMessage, loading } = useBookmarks()

  return (
    <div className="min-h-screen bg-bm-page text-[#1a1a1a] transition-colors dark:bg-neutral-950 dark:text-white">
      <Sidebar />
      <div className="lg:pl-[260px]">
        <AppHeader />
        <div className="relative mx-auto max-w-[1400px] px-3 py-5 md:px-6 lg:py-8">
          {loading ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-24"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="loading loading-spinner loading-lg text-[#1a3a2a] dark:text-emerald-400" />
              <p className="text-sm text-[#666666] dark:text-neutral-400">
                Chargement de vos favoris…
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      {toastMessage ? (
        <div className="toast toast-end z-[60]" role="status">
          <div className="alert border border-black/10 bg-[#1a3a2a] text-white shadow-xl dark:border-white/15 dark:bg-emerald-900">
            <span>{toastMessage}</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
