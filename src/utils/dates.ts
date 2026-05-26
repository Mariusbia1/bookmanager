const shortOpts: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
}

/** Affiche une date courte type « 23 sept. » ou « Jamais ». */
export function formatShort(iso: string | null): string {
  if (!iso) return 'Jamais'
  return new Date(iso).toLocaleDateString('fr-FR', shortOpts)
}

export function formatLong(iso: string | null): string {
  if (!iso) return 'Jamais'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
