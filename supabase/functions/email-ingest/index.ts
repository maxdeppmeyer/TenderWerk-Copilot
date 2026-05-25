import { corsHeaders, respond } from '../_shared/cors.ts'
import { serviceClient } from '../_shared/auth.ts'

const hash = async (value: string) => {
  const bytes = new TextEncoder().encode(value)
  const result = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(result)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    if (request.headers.get('x-email-ingest-secret') !== Deno.env.get('EMAIL_INGEST_SECRET')) return respond({ error: 'EMAIL_IMPORT_UNAUTHORIZED' }, 401)
    const payload = await request.json()
    const recipient = String(payload.recipient ?? '')
    const token = recipient.match(/eingang\+([^@]+)@/i)?.[1]
    if (!token) return respond({ error: 'EMAIL_ROUTING_TOKEN_MISSING' }, 400)
    const client = serviceClient()
    const tokenHash = await hash(token)
    const { data: route } = await client.from('organization_import_tokens').select('organization_id').eq('token_hash', tokenHash).eq('active', true).maybeSingle()
    if (!route) {
      await client.from('email_imports').insert({ recipient, sender: payload.sender, subject: payload.subject, message_id: payload.messageId, import_token_hash: tokenHash, status: 'quarantined', error_code: 'TOKEN_UNKNOWN' })
      return respond({ status: 'quarantined' }, 202)
    }
    const { data: organization } = await client.from('organizations').select('owner_user_id').eq('id', route.organization_id).single()
    if (!organization?.owner_user_id) throw new Error('EMAIL_ORGANIZATION_OWNER_MISSING')
    const { data: project, error } = await client.from('tenders').insert({ organization_id: route.organization_id, title: payload.subject || 'Ausschreibung aus E-Mail', source: 'E-Mail-Import', created_by: organization.owner_user_id, status: 'eingegangen' }).select().single()
    if (error || !project) throw new Error('EMAIL_PROJECT_CREATE_FAILED')
    for (const attachment of payload.attachments ?? []) {
      const path = `${route.organization_id}/${project.id}/${crypto.randomUUID()}-${String(attachment.filename).replace(/[^a-zA-Z0-9._-]/g, '-')}`
      const binary = Uint8Array.from(atob(attachment.base64), (c) => c.charCodeAt(0))
      const upload = await client.storage.from('tender-originals').upload(path, binary, { contentType: attachment.mimeType, upsert: false })
      if (!upload.error) await client.from('tender_files').insert({ organization_id: route.organization_id, tender_id: project.id, original_name: attachment.filename, storage_path: path, mime_type: attachment.mimeType, size_bytes: binary.byteLength, origin: 'email', parser_status: 'uploaded' })
    }
    await client.from('email_imports').insert({ organization_id: route.organization_id, tender_id: project.id, recipient, sender: payload.sender, subject: payload.subject, message_id: payload.messageId, import_token_hash: tokenHash, status: 'imported' })
    await client.from('organization_import_tokens').update({ last_used_at: new Date().toISOString() }).eq('token_hash', tokenHash)
    return respond({ status: 'imported', tenderId: project.id }, 201)
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'EMAIL_IMPORT_FAILED' }, 400)
  }
})
