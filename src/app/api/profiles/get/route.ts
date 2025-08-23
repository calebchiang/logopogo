import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/profiles/getProfile'

export async function GET() {
  try {
    const profile = await getProfile()
    return NextResponse.json({ profile })
  } catch (err: any) {
    const message = err?.message ?? 'Bad Request'
    const status = err?.status ?? (message === 'Unauthorized' ? 401 : 400)
    return NextResponse.json({ error: message }, { status })
  }
}
