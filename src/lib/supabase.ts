import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false' || !url || !key || url.includes('<') || key.includes('<')
export const supabase = !demoMode && url && key ? createClient(url, key) : null
