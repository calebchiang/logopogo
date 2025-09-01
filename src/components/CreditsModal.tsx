'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Coins,
  CheckCircle2,
  Download,
  Sparkles,
  Layers,
  Edit3,
  ShieldCheck,
  Loader2,
} from 'lucide-react'

type CreditsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout?: () => void
}

export default function CreditsModal({ open, onOpenChange, onCheckout }: CreditsModalProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack: 'credits_10' }),
      })
      if (!res.ok) throw new Error('Failed to start checkout')
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('Checkout URL missing')
      }
    } catch (e) {
      console.error(e)
      onCheckout?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 text-xs text-zinc-300">
              <Coins className="h-3.5 w-3.5 text-yellow-400" />
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Pay by usage
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Simple pricing. No monthly subscriptions.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold leading-none">$9.99</div>
              </div>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>20 logo generation credits</span>
            </li>
            <li className="flex items-start gap-3">
              <Download className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
              <span>Unlimited high-quality downloads</span>
            </li>
            <li className="flex items-start gap-3">
              <Layers className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
              <span>Transparent PNG backgrounds</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-300" />
              <span>Clean, minimal, icon-only logo styles</span>
            </li>
            <li className="flex items-start gap-3">
              <Edit3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <span>Customize and edit logos</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
              <span>All your logos saved in one place</span>
            </li>
          </ul>
        </div>

        <DialogFooter className="bg-zinc-950/60 px-6 py-4 border-t border-zinc-800">
          <div className="flex w-full items-center justify-end">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting…
                </span>
              ) : (
                'Get credits'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
