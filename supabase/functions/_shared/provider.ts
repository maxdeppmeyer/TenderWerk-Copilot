import { analysisSchema, type AnalysisOutput } from './analysis-schema.ts'
import { analysisSystemPrompt } from './prompt.ts'

export const runStructuredAnalysis = async (context: string): Promise<{ result: AnalysisOutput; model: string; usage: unknown }> => {
  const key = Deno.env.get('OPENAI_API_KEY')
  if (!key) throw new Error('ANALYSIS_PROVIDER_NOT_CONFIGURED')
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4.1-mini'
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, instructions: analysisSystemPrompt, input: `Dokumentkontext mit Quellenmarkern:\n${context}`, text: { format: { type: 'json_object' } }, max_output_tokens: 12000 })
  })
  if (!response.ok) throw new Error(`ANALYSIS_PROVIDER_ERROR_${response.status}`)
  const payload = await response.json()
  const outputText = payload.output_text ?? payload.output?.flatMap((entry: { content?: Array<{ text?: string }> }) => entry.content ?? []).map((item: { text?: string }) => item.text ?? '').join('')
  if (!outputText) throw new Error('ANALYSIS_EMPTY_RESPONSE')
  let parsed: unknown
  try { parsed = JSON.parse(outputText) } catch { throw new Error('ANALYSIS_INVALID_JSON') }
  const valid = analysisSchema.safeParse(parsed)
  if (!valid.success) throw new Error('ANALYSIS_SCHEMA_INVALID')
  return { result: valid.data, model, usage: payload.usage ?? {} }
}
