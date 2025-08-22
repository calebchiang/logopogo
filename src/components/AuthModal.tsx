'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AuthModal({ open, onOpenChange }: Props) {
  const supabase = createClient()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const google = async () => {
    setErr(null)
    setOk(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined }
    })
    if (error) setErr(error.message)
    setLoading(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setOk(null)
    setLoading(true)
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setErr(error.message)
      } else {
        setOk('Verification email sent. Verify your email, then log in to generate your logos.')
        setMode('login')
        setPassword('')
      }
      setLoading(false)
      return
    }
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) setErr(res.error.message)
    else onOpenChange(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-50 text-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-xl">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-zinc-300">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={google} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.2-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.7 6.1 29.6 4 24 4 16 4 9.1 8.6 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5c-2.1 1.5-4.8 2.4-7.3 2.4-5.2 0-9.6-3.6-11.1-8.5l-6.6 5.1C9.1 39.4 16 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.3 5.5-6.3 6.8l6.2 5C38 36.9 44 31 44 24c0-1.3-.1-2.2-.4-3.5z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm text-zinc-600">
            {mode === 'signup' ? (
              <>Already have an account? <button className="underline" onClick={() => { setErr(null); setOk(null); setMode('login') }}>Log in</button></>
            ) : (
              <>New here? <button className="underline" onClick={() => { setErr(null); setOk(null); setMode('signup') }}>Create an account</button></>
            )}
          </div>

          {ok && <div className="text-sm bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md px-3 py-2">{ok}</div>}
          {err && <div className="text-sm bg-red-100 text-red-700 border border-red-300 rounded-md px-3 py-2">{err}</div>}

          <form onSubmit={submit} className="space-y-3 text-zinc-700">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white text-zinc-900" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white text-zinc-900" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === 'signup' ? 'Sign up' : 'Log in'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
