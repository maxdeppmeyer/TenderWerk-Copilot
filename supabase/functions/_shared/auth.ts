import { createClient } from 'jsr:@supabase/supabase-js@2'

export const userClient = (request: Request) => {
  const authorization = request.headers.get('Authorization')
  if (!authorization) throw new Error('AUTH_REQUIRED')
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } })
}

export const serviceClient = () => createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

export const authenticatedUser = async (request: Request) => {
  const client = userClient(request)
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('AUTH_REQUIRED')
  return { client, user: data.user }
}
