'use client'

import { useState, useRef, useEffect } from 'react'
import AuthModal from '@/components/AuthModal'
import CreditsModal from './CreditsModal'
import LogoGenTipsModal from './LogoGenTipsModal'
import StripedProgressBar from './StripedProgressBar'
import { createClient } from '@/lib/supabase/client'
import { Download, Edit, AlertTriangle, Coins, HelpCircle, RotateCcw, Sparkles, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdjustWithAiModal from './AdjustWithAiModal'

type LogoRow = {
  id: string
  image_path: string
  url: string
  brand_name?: string
  symbol_description?: string
  business_description?: string | null
  created_at?: string
}

type GenResponse = {
  model: string
  prompt: string
  logos: LogoRow[]
  remainingCredits?: number
}

type Props = {
  step: 0 | 1 | 2
  onStepChange: (s: 0 | 1 | 2) => void
}

export default function GenerateLogo({ step, onStepChange }: Props) {
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [symbol, setSymbol] = useState('')
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logos, setLogos] = useState<LogoRow[]>([])

  const [showAuth, setShowAuth] = useState(false)
  const [pendingAfterAuth, setPendingAfterAuth] = useState(false)
  const retryOnceRef = useRef(false)

  const [creditsAlert, setCreditsAlert] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)

  const supabase = createClient()
  const autoSubmittedRef = useRef(false)
  const pendingEditRef = useRef<{ instruction: string; parentLogoId: string } | null>(null)

  const ensureSessionReady = async (maxMs = 4000) => {
    const start = Date.now()
    while (Date.now() - start < maxMs) {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) return true
      await new Promise((r) => setTimeout(r, 200))
    }
    return false
  }

  const next = () => onStepChange(Math.min(step + 1, 1) as Props['step'])

  const clearSaved = () => {
    try {
      sessionStorage.removeItem('lp.generate.inputs')
      sessionStorage.removeItem('lp.generate.resume')
    } catch {}
  }

  const back = () => {
    clearSaved()
    onStepChange(Math.max(step - 1, 0) as Props['step'])
  }

  const handleSubmit = async () => {
    setError(null)
    setCreditsAlert(false)
    setLogos([])
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          description: description.trim(),
          symbol: symbol.trim(),
        }),
      })

      if (res.status === 401) {
        try {
          sessionStorage.setItem('lp.generate.inputs', JSON.stringify({ brand: brand.trim(), description: description.trim(), symbol: symbol.trim(), step }))
          sessionStorage.setItem('lp.generate.resume', '1')
        } catch {}
        setShowAuth(true)
        setPendingAfterAuth(true)
        setLoading(false)
        return
      }

      if (res.status === 402) {
        setCreditsAlert(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let message = 'Generation failed'
        try {
          const j = text ? JSON.parse(text) : null
          if (j?.error) message = j.error
        } catch {}
        throw new Error(message)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Unexpected response format')
      }

      const json: GenResponse = await res.json()
      setLogos(json.logos || [])
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAiAdjust = async (instruction: string) => {
    const firstLogo = logos[0]
    if (!firstLogo?.id || !instruction.trim()) return
    setError(null)
    setCreditsAlert(false)
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentLogoId: firstLogo.id,
          editInstruction: instruction.trim(),
        }),
      })

      if (res.status === 401) {
        pendingEditRef.current = { instruction: instruction.trim(), parentLogoId: firstLogo.id }
        setShowAuth(true)
        setPendingAfterAuth(true)
        setLoading(false)
        return
      }

      if (res.status === 402) {
        setCreditsAlert(true)
        setLoading(false)
        return
      }

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let message = 'Generation failed'
        try {
          const j = text ? JSON.parse(text) : null
          if (j?.error) message = j.error
        } catch {}
        throw new Error(message)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Unexpected response format')
      }

      const json: GenResponse = await res.json()
      setLogos(json.logos || [])
      setShowAdjust(false)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthOpenChange = async (open: boolean) => {
    setShowAuth(open)
    if (!open && pendingAfterAuth && !retryOnceRef.current) {
      retryOnceRef.current = true
      const ready = await ensureSessionReady()
      if (!ready) {
        setPendingAfterAuth(false)
        retryOnceRef.current = false
        setError('Login detected slowly—please press Generate again.')
        return
      }
      try {
        const pendingEdit = pendingEditRef.current
        if (pendingEdit) {
          await handleAiAdjust(pendingEdit.instruction)
          pendingEditRef.current = null
        } else {
          await handleSubmit()
        }
      } finally {
        setPendingAfterAuth(false)
        retryOnceRef.current = false
      }
    }
  }

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('lp.generate.inputs')
      if (saved) {
        const data = JSON.parse(saved) as { brand?: string; description?: string; symbol?: string; step?: Props['step'] }
        if (typeof data.brand === 'string') setBrand(data.brand)
        if (typeof data.description === 'string') setDescription(data.description)
        if (typeof data.symbol === 'string') setSymbol(data.symbol)
        if (typeof data.step !== 'undefined') onStepChange(data.step as Props['step'])
      }
    } catch {}
  }, [onStepChange])

  useEffect(() => {
    const resume = (() => {
      try {
        return sessionStorage.getItem('lp.generate.resume') === '1'
      } catch {
        return false
      }
    })()
    if (!resume || autoSubmittedRef.current) return
    let cancelled = false
    ;(async () => {
      const ready = await ensureSessionReady(4000)
      if (cancelled) return
      try {
        sessionStorage.removeItem('lp.generate.resume')
      } catch {}
      if (!ready) return
      if (!brand.trim() || !symbol.trim()) return
      if (autoSubmittedRef.current) return
      autoSubmittedRef.current = true
      await handleSubmit()
    })()
    return () => {
      cancelled = true
    }
  }, [brand, symbol])

  const firstLogo = logos[0]

  const resetAll = () => {
    clearSaved()
    setBrand('')
    setDescription('')
    setSymbol('')
    setLogos([])
    setError(null)
    setCreditsAlert(false)
    setShowAuth(false)
    setShowCredits(false)
    setShowTips(false)
    setLoading(false)
    setPendingAfterAuth(false)
    retryOnceRef.current = false
    autoSubmittedRef.current = false
    onStepChange(0)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <AuthModal open={showAuth} onOpenChange={handleAuthOpenChange} />
      <CreditsModal open={showCredits} onOpenChange={setShowCredits} />
      <LogoGenTipsModal open={showTips} onOpenChange={setShowTips} />
      <AdjustWithAiModal
        open={showAdjust}
        onOpenChange={setShowAdjust}
        onConfirm={(instruction) => {
          setShowAdjust(false)          
          handleAiAdjust(instruction)   
        }}
      />

      {step === 0 && (
        <section className="text-center mb-2">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-[11px] md:text-xs text-zinc-400">
              <Users className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              <span>
                Join <span className="text-white font-medium">500+</span> creators
              </span>
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Generate <span className="rainbow-purple">High Quality</span> Logos in Seconds
          </h1>
          <p className="mt-3 text-zinc-400 text-lg">
            Use LogoPogo&apos;s AI powered platform to design a logo for your apps and websites
          </p>
        </section>
      )}


      <div className="p-2 md:p-8 bg-[var(--background)]">
        {creditsAlert && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <p className="text-sm font-medium">Not enough credits to generate a logo.</p>
              </div>
              <button
                onClick={() => setShowCredits(true)}
                className="inline-flex items-center rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/25"
              >
                Get credits
              </button>
            </div>
          </div>
        )}

        {step === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (brand.trim()) next()
            }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:justify-center"
          >
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              aria-label="Brand name"
              className="w-full sm:w-[420px] flex-none h-12 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              placeholder="Enter your brand name"
              required
            />
            <button
              type="submit"
              disabled={!brand.trim()}
              className="h-12 rounded-xl px-5 bg-indigo-600 text-white border border-zinc-800 hover:bg-zinc-800"
            >
              ✨ Make logo
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-300 text-left">Symbol Description (the more descriptive, the better quality logo)</label>
              <button
                type="button"
                onClick={() => setShowTips(true)}
                aria-label="Tips"
                className="inline-flex items-center rounded-full p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border border-zinc-800 p-3 rounded bg-transparent"
              placeholder="e.g. brown monkey typing on a gray laptop"
              rows={3}
              required
            />
            <label className="block text-sm font-medium text-zinc-300 text-left">
              Brief Description <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-zinc-800 p-3 rounded bg-transparent"
              placeholder="What does your business do?"
            />
            {loading && (
              <div className="mt-2">
                <StripedProgressBar />
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <button onClick={back} className="py-2 px-4 rounded border border-zinc-800 hover:bg-zinc-900">
                Back
              </button>
              {!firstLogo && (
                <button
                  onClick={() => !loading && symbol.trim() && handleSubmit()}
                  disabled={!symbol.trim() || loading}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded border border-zinc-800 disabled:opacity-60"
                >
                  <Coins className="text-yellow-300 h-4 w-4" />
                  {loading ? 'Working…' : 'Generate Logo'}
                </button>
              )}
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      {firstLogo && (
        <section className="mt-12">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => setShowAdjust(true)}
                className="inline-flex items-center gap-2 rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-medium text-black hover:bg-yellow-300"
              >
                <Sparkles className="h-4 w-4" />
                Adjust with AI
              </button>
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
              >
                <RotateCcw className="h-4 w-4" />
                Generate another logo
              </button>
            </div>
            <div className="relative border border-zinc-800 rounded-lg p-4">
              <div className="aspect-square w-full">
                <img src={firstLogo.url} alt="logo-1" className="w-full h-full object-contain bg-white" />
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-zinc-600">
                <a
                  href={firstLogo.url}
                  download="logopogo_1.png"
                  rel="noreferrer"
                  target="_blank"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="Download PNG"
                >
                  <Download className="w-4 h-4 text-zinc-400 cursor-pointer" />
                  <span className="text-sm">Download</span>
                </a>
                <button
                  onClick={() => router.push(`/editor/${firstLogo.id}`)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-zinc-400 cursor-pointer" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
