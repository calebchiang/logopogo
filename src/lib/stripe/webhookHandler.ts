import { serviceSupabase } from '@/lib/supabase/service'

export async function addCredits10({ userId }: { userId: string }) {
  const { data: profile, error: selErr } = await serviceSupabase
    .from('profiles')
    .select('credits')
    .eq('user_id', userId)
    .single()

  if (selErr) throw new Error(`profiles select failed: ${selErr.message}`)

  const current = Number(profile?.credits ?? 0)
  const next = current + 10

  const { error: updErr } = await serviceSupabase
    .from('profiles')
    .update({ credits: next, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (updErr) throw new Error(`profiles update failed: ${updErr.message}`)

  return { user_id: userId, added: 10, credits: next }
}
