import { corsHeaders, respond } from '../_shared/cors.ts'
import { authenticatedUser } from '../_shared/auth.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { client } = await authenticatedUser(request)
    const { tenderId, idempotencyKey } = await request.json()
    if (!tenderId) return respond({ error: 'TENDER_ID_REQUIRED' }, 400)
    const key = idempotencyKey ?? `${tenderId}-${new Date().toISOString().slice(0, 16)}`
    const { data, error } = await client.rpc('reserve_analysis_job', { input_tender_id: tenderId, input_idempotency_key: key })
    if (error) throw new Error(error.message)
    return respond({ jobId: data, status: 'queued', message: 'Analyse wurde zur Verarbeitung eingeplant.' }, 201)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ANALYSIS_JOB_FAILED'
    const status = code.includes('AUTH') ? 401 : code.includes('QUOTA') ? 402 : 400
    return respond({ error: code }, status)
  }
})
