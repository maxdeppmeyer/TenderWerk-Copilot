import type { CompanyProfile } from '../types/domain'
import { safeFileName, validateUpload } from './upload'
import { supabase } from './supabase'

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase ist nicht konfiguriert. Starten Sie im Demomodus oder setzen Sie die öffentlichen Variablen.')
  return supabase
}

export const authBackend = {
  async signIn(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
    if (error) throw error
    return data.user
  },
  async signUp(email: string, password: string) {
    const { data, error } = await requireSupabase().auth.signUp({ email, password })
    if (error) throw error
    return data.user
  },
  async signOut() {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
  },
  async resetPassword(email: string, redirectTo: string) {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  }
}

export const workspaceBackend = {
  async onboard(profile: CompanyProfile) {
    const { data, error } = await requireSupabase().rpc('complete_onboarding', { input_profile: profile })
    if (error) throw error
    return data
  },
  async createTender(title: string, source: string) {
    const { data, error } = await requireSupabase().rpc('create_tender_project', { input_title: title, input_source: source })
    if (error) throw error
    return data as string
  },
  async uploadFiles(organizationId: string, tenderId: string, files: File[]) {
    const client = requireSupabase()
    for (const file of files) {
      const validation = validateUpload(file)
      if (validation) throw new Error(validation)
      const name = safeFileName(file.name)
      const objectPath = `${organizationId}/${tenderId}/${crypto.randomUUID()}-${name}`
      const { error: storageError } = await client.storage.from('tender-originals').upload(objectPath, file, { upsert: false, contentType: file.type })
      if (storageError) throw storageError
      const { error: rowError } = await client.from('tender_files').insert({ organization_id: organizationId, tender_id: tenderId, original_name: file.name, storage_path: objectPath, mime_type: file.type, size_bytes: file.size, parser_status: 'uploaded', origin: 'original' })
      if (rowError) throw rowError
    }
  },
  async startAnalysis(tenderId: string) {
    const { data, error } = await requireSupabase().functions.invoke('create-analysis-job', { body: { tenderId } })
    if (error) throw error
    return data
  }
}
