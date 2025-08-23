import { createClient } from '@/lib/supabase/server'

export type ProfileRow = {
  id: string
  user_id: string
  credits: number
  created_at: string | null
  updated_at: string | null
}

export async function getProfile(): Promise<ProfileRow> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    const err: any = new Error('Unauthorized')
    err.status = 401
    throw err
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    const err: any = new Error(error?.message || 'Profile not found')
    err.status = 404
    throw err
  }

  return data as ProfileRow
}
