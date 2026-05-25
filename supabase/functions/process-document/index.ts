import { corsHeaders, respond } from '../_shared/cors.ts'
import { authenticatedUser, serviceClient } from '../_shared/auth.ts'

const textExtensions = ['txt','csv','xml']
const maxCharacters = 1_200_000

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { client } = await authenticatedUser(request)
    const admin = serviceClient()
    const { fileId } = await request.json()
    const { data: file, error } = await client.from('tender_files').select('*').eq('id', fileId).single()
    if (error || !file) throw new Error('FILE_NOT_FOUND')
    const ext = String(file.original_name).split('.').pop()?.toLowerCase() ?? ''
    if (!textExtensions.includes(ext)) {
      const status = ext === 'pdf' ? 'requires_ocr' : 'unsupported'
      await admin.from('tender_files').update({ parser_status: status, parser_warning: 'Im sicheren MVP wird dieser Dokumenttyp gespeichert, benötigt jedoch eine validierte Parser-/OCR-Erweiterung.' }).eq('id', fileId)
      return respond({ fileId, status, warning: 'Manuelle Prüfung oder validierte Parser-Erweiterung erforderlich.' })
    }
    const { data: blob, error: downloadError } = await admin.storage.from(file.bucket_name).download(file.storage_path)
    if (downloadError || !blob) throw new Error('FILE_DOWNLOAD_FAILED')
    const content = (await blob.text()).slice(0, maxCharacters)
    const chunks = content.match(/[\s\S]{1,6000}/g) ?? []
    await admin.from('document_chunks').delete().eq('file_id', fileId)
    if (chunks.length) await admin.from('document_chunks').insert(chunks.map((chunk, index) => ({ organization_id: file.organization_id, tender_id: file.tender_id, file_id: file.id, chunk_index: index, locator: `${file.original_name} · Abschnitt ${index + 1}`, content: chunk, char_count: chunk.length })))
    await admin.from('tender_files').update({ parser_status: 'extracted' }).eq('id', fileId)
    return respond({ fileId, status: 'extracted', chunks: chunks.length })
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : 'PROCESS_DOCUMENT_FAILED' }, 400)
  }
})
