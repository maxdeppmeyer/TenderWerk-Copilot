import { corsHeaders, respond } from '../_shared/cors.ts'
import { authenticatedUser } from '../_shared/auth.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { client } = await authenticatedUser(request)
    const { tenderId } = await request.json()
    const [{ data: tender }, { data: deadlines }, { data: requirements }, { data: risks }, { data: lineItems }, { data: checklist }] = await Promise.all([
      client.from('tenders').select('*').eq('id', tenderId).single(), client.from('deadlines').select('*').eq('tender_id', tenderId), client.from('requirements').select('*').eq('tender_id', tenderId), client.from('risks').select('*').eq('tender_id', tenderId), client.from('line_items').select('*').eq('tender_id', tenderId), client.from('checklist_items').select('*').eq('tender_id', tenderId)
    ])
    if (!tender) return respond({ error: 'TENDER_NOT_FOUND' }, 404)
    return respond({ generatedAt: new Date().toISOString(), notice: 'Interner Arbeitsbericht. Originalunterlagen und Einreichungsformalitäten manuell prüfen.', tender, deadlines, requirements, risks, lineItems, checklist })
  } catch (error) { return respond({ error: error instanceof Error ? error.message : 'EXPORT_FAILED' }, 400) }
})
