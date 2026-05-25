export const formatDate = (value?: string): string => {
  if (!value) return 'Nicht bekannt'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Ungültiges Datum'
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export const formatDateTime = (value?: string): string => {
  if (!value) return 'Nicht bekannt'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Ungültiges Datum'
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date) + ' Uhr'
}

export const currency = (value: number): string => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)

export const bytes = (size: number): string => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
