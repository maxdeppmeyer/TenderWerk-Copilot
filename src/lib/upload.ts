export const allowedExtensions = ['pdf', 'docx', 'xlsx', 'csv', 'txt', 'xml', 'zip'] as const
export const MAX_FILE_SIZE = 25 * 1024 * 1024
export const MAX_PROJECT_SIZE = 100 * 1024 * 1024

export const safeFileName = (name: string): string => {
  const parts = name.split('.')
  const extension = parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : ''
  const base = parts.join('.').normalize('NFKD').replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-').slice(0, 90) || 'datei'
  return `${base}${extension}`
}

export const validateUpload = (file: Pick<File, 'name' | 'size'>): string | null => {
  const ext = file.name.toLowerCase().split('.').pop() ?? ''
  if (!allowedExtensions.includes(ext as (typeof allowedExtensions)[number])) return 'Dateityp nicht unterstützt. Erlaubt sind PDF, DOCX, XLSX, CSV, TXT, XML und ZIP.'
  if (file.size > MAX_FILE_SIZE) return 'Datei überschreitet das Limit von 25 MB.'
  return null
}

export const containsUnsafeZipPath = (paths: string[]) => paths.some((path) => path.includes('..') || path.startsWith('/') || /^[a-zA-Z]:/.test(path))
