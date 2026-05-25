import { describe, expect, it } from 'vitest'
import { containsUnsafeZipPath, MAX_FILE_SIZE, safeFileName, validateUpload } from '../lib/upload'

describe('Uploadvalidierung', () => {
  it('bereinigt Dateinamen und hält Endungen', () => expect(safeFileName('../../Frist Übersicht<script>.pdf')).toBe('Frist-Ubersichtscript.pdf'))
  it('weist unerlaubte Typen und zu große Dateien zurück', () => {
    expect(validateUpload({ name: 'payload.exe', size: 2 })).toContain('nicht unterstützt')
    expect(validateUpload({ name: 'ok.pdf', size: MAX_FILE_SIZE + 1 })).toContain('25 MB')
  })
  it('erkennt unsichere ZIP-Pfade', () => {
    expect(containsUnsafeZipPath(['../../secret.env'])).toBe(true)
    expect(containsUnsafeZipPath(['safe/datei.pdf'])).toBe(false)
  })
})
