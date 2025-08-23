'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Coins, CircleUser } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import AuthModal from '@/components/AuthModal'

export default function Navbar() {
  const supabase = createClient()
  const [isAuthed, setIsAuthed] = useState(false)
  const [credits, setCredits] = useState<number>(0)
  const [authOpen, setAuthOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      const authed = !!data.user
      setIsAuthed(authed)
      setEmail(data.user?.email ?? null)
      if (authed) {
        try {
          const res = await fetch('/api/profiles/get', { method: 'GET', credentials: 'include' })
          if (res.ok) {
            const json = await res.json()
            if (mounted && json?.profile?.credits != null) setCredits(json.profile.credits)
          }
        } catch {}
      }
    }
    check()

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authed = !!session?.user
      setIsAuthed(authed)
      setEmail(session?.user?.email ?? null)
      if (authed) {
        try {
          const res = await fetch('/api/profiles/get', { method: 'GET', credentials: 'include' })
          if (res.ok) {
            const json = await res.json()
            if (json?.profile?.credits != null) setCredits(json.profile.credits)
          }
        } catch {}
      } else {
        setCredits(0)
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const logout = async () => {
    await supabase.auth.signOut()
    setIsAuthed(false)
    setCredits(0)
    setEmail(null)
  }

  return (
    <>
      <nav className="w-full bg-[var(--background)] text-[var(--foreground)]">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center">
          <a href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logopogo_logo_transparent.png"
              alt="LogoPogo"
              width={55}
              height={55}
              priority
              className="rounded-lg"
            />
            <span className="font-bold text-2xl leading-none">LogoPogo</span>
          </a>

          {isAuthed ? (
            <div className="ml-auto flex items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-md border border-yellow-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-800">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span>{credits}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="User menu"
                    className="inline-flex items-center justify-center"
                  >
                    <CircleUser className="h-8 w-8" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px] space-y-2">
                  {email && (
                    <div className="px-2 pt-2 text-sm text-zinc-400">
                      Email: <span className="text-zinc-400">{email}</span>
                    </div>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="ml-auto">
              <Button
                variant="outline"
                onClick={() => setAuthOpen(true)}
                className="flex items-center gap-2"
              >
                <CircleUser className="h-5 w-5" />
                Sign In
              </Button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
