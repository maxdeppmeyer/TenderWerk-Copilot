import PostalMime from 'postal-mime'

interface Env {
  SUPABASE_INGEST_ENDPOINT: string
  EMAIL_INGEST_SECRET: string
}

const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain', 'application/xml', 'text/xml', 'application/zip']
const maximumBytes = 25 * 1024 * 1024
const toBase64 = (buffer: ArrayBuffer) => {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + 0x8000, bytes.length)))
  return btoa(binary)
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const parsed = await PostalMime.parse(message.raw)
    const attachments = (parsed.attachments ?? []).filter((file) => allowed.includes(file.mimeType) && file.content.byteLength <= maximumBytes).map((file) => ({ filename: file.filename ?? 'anhang', mimeType: file.mimeType, base64: toBase64(file.content) }))
    const response = await fetch(env.SUPABASE_INGEST_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-email-ingest-secret': env.EMAIL_INGEST_SECRET },
      body: JSON.stringify({ recipient: message.to, sender: message.from, subject: parsed.subject ?? 'Ausschreibung aus E-Mail', messageId: parsed.messageId, attachments })
    })
    if (!response.ok) message.setReject(`TenderWerk-Import fehlgeschlagen (${response.status}).`)
  }
}
