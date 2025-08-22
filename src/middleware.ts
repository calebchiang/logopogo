import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  // Forward request headers so Supabase can read cookies
  const res = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // use getAll/setAll pattern (current @supabase/ssr)
        getAll() {
          return req.cookies.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  await supabase.auth.getSession()

  return res
}

export const config = {
  // Refresh on app routes + API; skip static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
