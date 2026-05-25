import { describe, expect, it } from 'vitest'
import { deadlineUrgency, hasDeadlineConflict } from '../lib/deadlines'
import type { Deadline } from '../types/domain'

const deadline = (value?: string, conflict = false): Deadline => ({ id: 'd', type: 'Angebotsfrist', value, originalText: '', critical: true, conflict, evidence: [], confirmed: true })

describe('Fristen', () => {
  it('erkennt abgelaufene und kritische Fristen', () => {
    expect(deadlineUrgency(deadline('2026-01-01T00:00:00Z'), new Date('2026-02-01'))).toBe('abgelaufen')
    expect(deadlineUrgency(deadline('2026-02-02T00:00:00Z'), new Date('2026-02-01'))).toBe('kritisch')
  })
  it('kennzeichnet unbekannte Werte und Konflikte', () => {
    expect(deadlineUrgency(deadline())).toBe('unbekannt')
    expect(hasDeadlineConflict([deadline(undefined, true)])).toBe(true)
  })
})
