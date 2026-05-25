import { corsHeaders, respond } from '../_shared/cors.ts'
import { authenticatedUser, serviceClient } from '../_shared/auth.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { client, user } = await authenticatedUser(request)
    const { data: admin } = await client.rpc('is_platform_admin')
    if (!admin) return respond({ error: 'PLATFORM_ADMIN_REQUIRED' }, 403)
    const { organizationId, status, analysisQuota, note } = await request.json()
    const service = serviceClient()
    const { error } = await service.from('licenses').update({ status, analysis_quota: analysisQuota, note, updated_by: user.id, updated_at: new Date().toISOString() }).eq('organization_id', organizationId)
    if (error) throw new Error('LICENSE_UPDATE_FAILED')
    await service.from('audit_logs').insert({ organization_id: organizationId, actor_user_id: user.id, event_type: 'license_updated', description: `Lizenzstatus auf ${status} geändert.`, metadata: { analysisQuota } })
    return respond({ success: true })
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'ADMIN_LICENSE_FAILED' }, 400)
  }
})
