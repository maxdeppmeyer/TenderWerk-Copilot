import { z } from 'zod'

const evidenceSchema = z.object({
  fileName: z.string().min(1), locator: z.string().min(1), excerpt: z.string().max(800), confidence: z.enum(['hoch', 'mittel', 'niedrig'])
})

export const structuredAnalysisSchema = z.object({
  summary: z.object({ title: z.string().nullable(), description: z.string(), contractingAuthority: z.string().nullable(), location: z.string().nullable(), warnings: z.array(z.string()) }),
  classification: z.object({ category: z.string(), processingMode: z.string(), confidence: z.enum(['hoch', 'mittel', 'niedrig']), evidence: z.array(evidenceSchema) }),
  deadlines: z.array(z.object({ type: z.string(), originalText: z.string(), isoDateTime: z.string().nullable(), critical: z.boolean(), conflict: z.boolean(), evidence: z.array(evidenceSchema) })),
  lots: z.array(z.object({ label: z.string(), title: z.string(), description: z.string(), requiredServices: z.array(z.string()), evidence: z.array(evidenceSchema) })),
  requirements: z.array(z.object({ name: z.string(), category: z.string(), mandatory: z.boolean(), dueMoment: z.string(), evidence: z.array(evidenceSchema) })),
  risks: z.array(z.object({ category: z.string(), severity: z.enum(['kritisch', 'hoch', 'mittel', 'niedrig', 'hinweis']), description: z.string(), action: z.string(), evidence: z.array(evidenceSchema) })),
  lineItems: z.array(z.object({ lotLabel: z.string().nullable(), number: z.string(), shortText: z.string(), longText: z.string(), quantity: z.number().nullable(), unit: z.string().nullable(), evidence: z.array(evidenceSchema) })),
  unknowns: z.array(z.string()), checklistSuggestions: z.array(z.object({ title: z.string(), priority: z.enum(['kritisch', 'hoch', 'mittel', 'niedrig', 'hinweis']), source: z.string().nullable() })), securityFlags: z.array(z.string())
})

export type StructuredAnalysis = z.infer<typeof structuredAnalysisSchema>
