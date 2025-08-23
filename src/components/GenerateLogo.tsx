// components/GenerateLogo.tsx
'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AuthModal from '@/components/AuthModal'
import { palettes } from '@/lib/palettes'
import { createClient } from '@/lib/supabase/client'

type GenResponse = {
  images: string[]
  model: string
  prompt: string
}

type Props = {
  step: 0 | 1 | 2
  onStepChange: (s: 0 | 1 | 2) => void
}

export default function GenerateLogo({ step, onStepChange }: Props) {
  const [brand, setBrand] = useState('')
  const [description, setDescription] = useState('')
  const [palette, setPalette] = useState('')
  const [symbol, setSymbol] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])

  const [showAuth, setShowAuth] = useState(false)
  const [pendingAfterAuth, setPendingAfterAuth] = useState(false)
  const retryOnceRef = useRef(false)

  const supabase = createClient()

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

  const next = () => onStepChange(Math.min(step + 1, 2) as Props['step'])
  const back = () => onStepChange(Math.max(step - 1, 0) as Props['step'])

  const handleSubmit = async () => {
    setError(null)
    setImages([])
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          description: description.trim(),
          symbol: symbol.trim(),
          palette: palette.trim(),
        }),
      })

      if (res.status === 401) {
        setShowAuth(true)
        setPendingAfterAuth(true)
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
      setImages(json.images)
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
        await handleSubmit()
      } finally {
        setPendingAfterAuth(false)
        retryOnceRef.current = false
      }
    }
  }

  const selectedPaletteId = (() => {
    const found = palettes.find((p) => p.colors.join(', ') === palette)
    return found?.id
  })()

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <AuthModal open={showAuth} onOpenChange={handleAuthOpenChange} />

      {step === 0 && (
        <section className="text-center mb-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Generate <span className="rainbow-purple">High Quality</span> Logos in Seconds
          </h1>
          <p className="mt-3 text-zinc-400 text-lg">
            Use LogoPogo&apos;s AI powered platform to design a logo for your apps and websites
          </p>
        </section>
      )}

      <div className="p-2 md:p-8 bg-[var(--background)]">
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
              <label className="block text-sm font-medium text-zinc-300 text-left">Colour Palette</label>
              <span className="text-xs text-zinc-500">Step 2 of 3</span>
            </div>
            <p className="text-sm text-zinc-500">Select one palette. You can customize later.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {palettes.map((p) => {
                const isSelected = palette === p.colors.join(', ')
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPalette(p.colors.join(', '))}
                    className={`w-full rounded-2xl transition focus:outline-none ${
                      isSelected ? 'ring-2 ring-indigo-500' : ''
                    }`}
                  >
                    <Card
                      className={`h-30 w-full rounded-2xl border-zinc-800 shadow-sm overflow-hidden p-0 ${
                        isSelected ? 'border-indigo-500' : ''
                      }`}
                    >
                      <CardContent className="p-0 h-full">
                        <div className="grid grid-cols-4 h-full w-full">
                          {p.colors.map((c, i) => (
                            <div key={i} className="h-full w-full" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-2">
              <button onClick={back} className="py-2 px-4 rounded border border-zinc-800 hover:bg-zinc-900">
                Back
              </button>
              <button
                onClick={() => palette.trim() && next()}
                disabled={!palette.trim()}
                className="bg-black text-white py-2 px-5 rounded border border-zinc-800 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-zinc-300 text-left">Symbol Description</label>
            <textarea
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full border border-zinc-800 p-3 rounded bg-transparent"
              placeholder="e.g. brain icon with a lightning bolt through the center"
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
            <div className="flex items-center justify-between mt-2">
              <button onClick={back} className="py-2 px-4 rounded border border-zinc-800 hover:bg-zinc-900">
                Back
              </button>
              <button
                onClick={() => !loading && symbol.trim() && handleSubmit()}
                disabled={!symbol.trim() || loading}
                className="bg-black text-white py-2 px-4 rounded border border-zinc-800 disabled:opacity-60"
              >
                {loading ? 'Generating…' : 'Generate Logo'}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {images.map((img, i) => {
              const src = /^https?:\/\//i.test(img) ? img : `data:image/png;base64,${img}`
              return (
                <div key={i} className="border border-zinc-800 rounded-lg p-4">
                  <div className="aspect-square w-full">
                    <img src={src} alt={`logo-${i + 1}`} className="w-full h-full object-contain" />
                  </div>
                  <a
                    href={src}
                    download={`logopogo_${i + 1}.png`}
                    className="text-xs underline mt-3 inline-block"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Download PNG
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
