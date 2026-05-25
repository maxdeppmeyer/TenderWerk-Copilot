import { describe, expect, it } from 'vitest'
import { structuredAnalysisSchema } from '../lib/analysisSchema'

const valid = { summary: { title: null, description: 'Test', contractingAuthority: null, location: null, warnings: [] }, classification: { category: 'Reinigung', processingMode: 'cleaning_calculation', confidence: 'hoch', evidence: [] }, deadlines: [], lots: [], requirements: [], risks: [], lineItems: [], unknowns: [], checklistSuggestions: [], securityFlags: [] }

describe('KI-Schema', () => {
  it('akzeptiert ein valides strukturiertes Ergebnis', () => expect(structuredAnalysisSchema.safeParse(valid).success).toBe(true))
  it('weist freie, unvalidierte Texte zurück', () => expect(structuredAnalysisSchema.safeParse('alles passt').success).toBe(false))
  it('weist unbekannte Risikoschwere zurück', () => expect(structuredAnalysisSchema.safeParse({ ...valid, risks: [{ category: 'Formal', severity: 'extrem', description: 'x', action: 'y', evidence: [] }] }).success).toBe(false))
})
