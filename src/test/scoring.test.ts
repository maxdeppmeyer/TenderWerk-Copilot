import { describe, expect, it } from 'vitest'
import { createDemoTender, defaultProfile } from '../lib/sampleData'
import { evaluateTender } from '../lib/scoring'

describe('Go-/No-Go-Bewertung', () => {
  it('bewertet das Demolos nach Prüfung, solange Muss-Punkte offen sind', () => {
    const tender = createDemoTender(defaultProfile)
    expect(tender.evaluation.recommendation).toBe('go_after_review')
    expect(tender.evaluation.totalScore).toBeGreaterThanOrEqual(55)
  })

  it('setzt einen harten Stopp bei ausdrücklich ausgeschlossener gewählter Leistung', () => {
    const tender = createDemoTender(defaultProfile)
    const lots = tender.lots.map((lot) => ({ ...lot, selection: 'anbieten' as const }))
    const result = evaluateTender(tender, defaultProfile, lots)
    expect(result.recommendation).toBe('no_go_recommended')
    expect(result.hardStops.join(' ')).toContain('ausgeschlossen')
  })

  it('fordert manuelle Prüfung, wenn keine Angebotsfrist bestätigt ist', () => {
    const tender = createDemoTender(defaultProfile)
    const result = evaluateTender({ ...tender, deadlines: tender.deadlines.map((item) => ({ ...item, confirmed: false })) }, defaultProfile, tender.lots)
    expect(result.recommendation).toBe('manual_review')
  })

  it('setzt bei abgelaufener bestätigter Frist einen harten Stopp', () => {
    const tender = createDemoTender(defaultProfile)
    const deadlines = tender.deadlines.map((item) => item.type === 'Angebotsfrist' ? { ...item, value: '2020-01-01T10:00:00.000Z' } : item)
    const result = evaluateTender({ ...tender, deadlines }, defaultProfile, tender.lots, new Date('2026-01-01'))
    expect(result.recommendation).toBe('no_go_recommended')
    expect(result.hardStops.join(' ')).toContain('abgelaufen')
  })
})
