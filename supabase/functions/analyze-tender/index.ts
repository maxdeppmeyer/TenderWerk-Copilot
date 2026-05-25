import { corsHeaders, respond } from '../_shared/cors.ts'
import { authenticatedUser, serviceClient } from '../_shared/auth.ts'
import { runStructuredAnalysis } from '../_shared/provider.ts'
import { ANALYSIS_PROMPT_VERSION } from '../_shared/prompt.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  let jobId: string | undefined
  const admin = serviceClient()
  try {
    const { client, user } = await authenticatedUser(request)
    const body = await request.json()
    jobId = body.jobId
    if (!jobId) return respond({ error: 'JOB_ID_REQUIRED' }, 400)
    const { data: job, error: jobError } = await client.from('analysis_jobs').select('*').eq('id', jobId).single()
    if (jobError || !job) throw new Error('JOB_NOT_FOUND')
    await admin.from('analysis_jobs').update({ status: 'analyzing', started_at: new Date().toISOString() }).eq('id', job.id)
    const { data: chunks } = await client.from('document_chunks').select('content, locator, tender_files(original_name)').eq('tender_id', job.tender_id).limit(250)
    if (!chunks?.length) throw new Error('NO_EXTRACTED_TEXT_AVAILABLE')
    const context = chunks.map((chunk: { content: string; locator: string; tender_files?: { original_name?: string } | null }) => `[DATEI: ${chunk.tender_files?.original_name ?? 'Dokument'} | FUNDSTELLE: ${chunk.locator}]\n${chunk.content}`).join('\n\n').slice(0, 250000)
    const { result, model, usage } = await runStructuredAnalysis(context)
    const { data: run, error: runError } = await admin.from('analysis_runs').insert({ organization_id: job.organization_id, tender_id: job.tender_id, job_id: job.id, version: job.analysis_version, model_provider: 'openai-compatible', model_name: model, prompt_version: ANALYSIS_PROMPT_VERSION, result, security_flags: result.securityFlags }).select().single()
    if (runError || !run) throw new Error('ANALYSIS_STORE_FAILED')
    const writeRows = async (table: string, rows: Record<string, unknown>[]) => {
      if (!rows.length) return
      const { error } = await admin.from(table).insert(rows)
      if (error) throw new Error(`ANALYSIS_RESULT_STORE_FAILED_${table.toUpperCase()}`)
    }
    await Promise.all([
      writeRows('deadlines', result.deadlines.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, analysis_run_id: run.id, type: item.type, value: item.isoDateTime, original_text: item.originalText, critical: item.critical, conflict: item.conflict, evidence: item.evidence, origin: 'ai', ai_confidence: item.evidence[0]?.confidence ?? 'niedrig' }))),
      writeRows('lots', result.lots.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, analysis_run_id: run.id, label: item.label, title: item.title, description: item.description, required_services: item.requiredServices, evidence: item.evidence }))),
      writeRows('requirements', result.requirements.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, analysis_run_id: run.id, name: item.name, category: item.category, mandatory: item.mandatory, due_moment: item.dueMoment, evidence: item.evidence, origin: 'ai' }))),
      writeRows('risks', result.risks.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, analysis_run_id: run.id, category: item.category, severity: item.severity, description: item.description, recommended_action: item.action, evidence: item.evidence }))),
      writeRows('line_items', result.lineItems.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, analysis_run_id: run.id, item_number: item.number, short_text: item.shortText, long_text: item.longText, quantity: item.quantity, unit: item.unit, evidence: item.evidence }))),
      writeRows('checklist_items', result.checklistSuggestions.map((item) => ({ organization_id: job.organization_id, tender_id: job.tender_id, section: 'Automatisch vorgeschlagen', title: item.title, priority: item.priority, source_reference: item.source, origin: 'ai', updated_by: user.id })))
    ])
    const quality = result.deadlines.some((item) => item.conflict) ? 'widerspruechlich' : result.summary.warnings.length ? 'teilweise_belegt' : 'gut_belegt'
    await admin.from('tenders').update({ title: result.summary.title ?? undefined, contracting_authority: result.summary.contractingAuthority, location: result.summary.location, summary: result.summary.description, category: result.classification.category, processing_mode: result.classification.processingMode, data_quality: quality, current_analysis_version: job.analysis_version, status: 'pruefung_noetig' }).eq('id', job.tender_id)
    await admin.from('analysis_jobs').update({ status: 'completed', finished_at: new Date().toISOString(), usage_metadata: usage }).eq('id', job.id)
    await admin.from('usage_events').insert({ organization_id: job.organization_id, tender_id: job.tender_id, job_id: job.id, event_type: 'analysis_completed', success: true, provider: 'openai-compatible', model, metadata: usage })
    return respond({ jobId: job.id, status: 'completed', analysisVersion: job.analysis_version })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ANALYSIS_FAILED'
    if (jobId) await admin.from('analysis_jobs').update({ status: 'failed', error_code: code, error_message: 'Analyse konnte nicht abgeschlossen werden.', finished_at: new Date().toISOString() }).eq('id', jobId)
    return respond({ error: code }, code.includes('AUTH') ? 401 : 400)
  }
})
