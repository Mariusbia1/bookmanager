import { useBookmarks } from '../context/BookmarksContext'
import { BookmarkFormModal } from './BookmarkFormModal'

export function GlobalBookmarkModal() {
  const {
    bookmarkModalOpen,
    bookmarkDraft,
    closeBookmarkModal,
  } = useBookmarks()

  return (
    <BookmarkFormModal
      open={bookmarkModalOpen}
      onClose={closeBookmarkModal}
      bookmark={bookmarkDraft}
    />
  )
}
