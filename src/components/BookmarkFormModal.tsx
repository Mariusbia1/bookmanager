import { XMarkIcon } from '@heroicons/react/24/outline'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import type { Bookmark } from '../types/bookmark'
import { faviconForDomain, hostnameFromUrl } from '../utils/domain'
import { useBookmarks } from '../context/BookmarksContext'

type BookmarkFormModalProps = {
  open: boolean
  onClose: () => void
  bookmark: Bookmark | null
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

type InnerProps = {
  bookmark: Bookmark | null
  onClose: () => void
}

function BookmarkFormInner({ bookmark, onClose }: InnerProps) {
  const { addBookmark, updateBookmark } = useBookmarks()

  const [title, setTitle] = useState(bookmark?.title ?? '')
  const [url, setUrl] = useState(bookmark?.url ?? '')
  const [description, setDescription] = useState(bookmark?.description ?? '')
  const [tags, setTags] = useState(
    bookmark ? bookmark.tags.join(', ') : '',
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const finalUrl = normalizeUrl(url)
    if (!title.trim() || !finalUrl) return

    const domain = hostnameFromUrl(finalUrl)
    const tagList = parseTags(tags)

    if (bookmark) {
      updateBookmark(bookmark.id, {
        title: title.trim(),
        url: finalUrl,
        domain,
        description: description.trim(),
        tags: tagList,
        favicon: faviconForDomain(domain),
      })
    } else {
      addBookmark({
        title: title.trim(),
        url: finalUrl,
        domain,
        description: description.trim(),
        tags: tagList,
        favicon: faviconForDomain(domain),
        lastVisited: null,
        addedAt: new Date().toISOString(),
        pinned: false,
      })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
      <div className="form-control">
        <label className="label pt-0" htmlFor="bookmark-f-title">
          <span className="label-text font-medium">Titre</span>
        </label>
        <input
          id="bookmark-f-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full rounded-xl border-black/15 bg-white focus:border-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
          placeholder="Ex. MDN Web Docs"
        />
      </div>

      <div className="form-control">
        <label className="label pt-0" htmlFor="bookmark-f-url">
          <span className="label-text font-medium">URL</span>
        </label>
        <input
          id="bookmark-f-url"
          name="url"
          type="text"
          inputMode="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered w-full rounded-xl border-black/15 bg-white focus:border-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
          placeholder="https://exemple.com"
        />
      </div>

      <div className="form-control">
        <label className="label pt-0" htmlFor="bookmark-f-desc">
          <span className="label-text font-medium">Description</span>
        </label>
        <textarea
          id="bookmark-f-desc"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full rounded-xl border-black/15 bg-white focus:border-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
          placeholder="Pourquoi ce lien est utile ?"
        />
      </div>

      <div className="form-control">
        <label className="label pt-0" htmlFor="bookmark-f-tags">
          <span className="label-text font-medium">Tags</span>
        </label>
        <input
          id="bookmark-f-tags"
          name="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input input-bordered w-full rounded-xl border-black/15 bg-white focus:border-[#1a3a2a] focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]/20 dark:border-white/15 dark:bg-neutral-950 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
          placeholder="Séparés par des virgules (ex. CSS, Learning)"
        />
      </div>

      <div className="modal-action mt-2 flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          className="btn rounded-xl border border-black/10 bg-transparent dark:border-white/15"
          onClick={onClose}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn rounded-xl border-0 bg-[#1a3a2a] text-white hover:bg-[#142e22] dark:bg-emerald-800 dark:hover:bg-emerald-900"
        >
          {bookmark ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export function BookmarkFormModal({
  open,
  onClose,
  bookmark,
}: BookmarkFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = 'bookmark-modal-title'
  const innerKey =
    bookmark != null ? `edit-${bookmark.id}` : open ? 'add-open' : 'add'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(ev) => {
        ev.preventDefault()
        onClose()
      }}
    >
      <div className="modal-box max-w-lg rounded-2xl border border-black/10 bg-white p-0 text-[#1a1a1a] shadow-2xl dark:border-white/10 dark:bg-neutral-900 dark:text-white">
        <div className="flex items-start justify-between gap-3 border-b border-black/10 px-6 py-4 dark:border-white/10">
          <h2 id={titleId} className="text-lg font-semibold">
            {bookmark ? 'Modifier le favori' : 'Nouveau favori'}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square rounded-lg"
            aria-label="Fermer"
            onClick={onClose}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {open ? (
          <BookmarkFormInner
            key={innerKey}
            bookmark={bookmark}
            onClose={onClose}
          />
        ) : null}
      </div>
      <form method="dialog" className="modal-backdrop bg-black/40">
        <button type="submit" className="sr-only">
          Fermer
        </button>
      </form>
    </dialog>
  )
}
