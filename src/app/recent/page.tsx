'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Edit, MoreVertical, RefreshCw, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type LogoRow = {
  id: string
  image_path: string
  url: string
  brand_name?: string
  symbol_description?: string
  palette?: string[] | null
  business_description?: string | null
  created_at?: string
}

export default function RecentPage() {
  const router = useRouter()
  const [logos, setLogos] = useState<LogoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/logos/get', { cache: 'no-store' })
      if (res.status === 401) {
        setError('Please sign in to view your logos.')
        setLogos([])
        return
      }
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as { logos: LogoRow[] }
      setLogos(json.logos || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load logos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const removeLogo = async (id: string) => {
    if (!confirm('Remove this logo? This will delete it from your library.')) return
    setDeletingId(id)
    const prev = logos
    setLogos(prev.filter(l => l.id !== id))
    try {
      const res = await fetch('/api/logos/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || 'Failed to delete')
      }
    } catch (e: any) {
      // rollback
      setLogos(prev)
      alert(e?.message || 'Failed to delete logo')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recently Generated</h1>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-zinc-800 rounded-lg p-4 animate-pulse">
              <div className="aspect-square w-full rounded-md bg-zinc-900/40" />
              <div className="mt-3 h-4 w-24 rounded bg-zinc-900/40" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-red-300 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && logos.length === 0 && (
        <div className="text-zinc-500">
          No logos yet. Generate one from the home page to see it here.
        </div>
      )}

      {!loading && !error && logos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((l, i) => (
            <div key={l.id} className="border border-zinc-800 rounded-lg p-4">
              <div className="aspect-square w-full">
                <img
                  src={l.url}
                  alt={l.brand_name || `logo-${i + 1}`}
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-200">{l.brand_name || 'Logo'}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {l.created_at ? new Date(l.created_at).toLocaleString() : ''}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-zinc-600">
                  <a
                    href={l.url}
                    download={`logopogo_${i + 1}.png`}
                    rel="noreferrer"
                    target="_blank"
                    className="hover:text-white transition-colors"
                    title="Download PNG"
                    aria-label="Download PNG"
                  >
                    <Download className="h-4 w-4 cursor-pointer" />
                  </a>

                  <button
                    onClick={() => router.push(`/editor/${l.id}`)}
                    className="hover:text-white transition-colors"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4 cursor-pointer" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="hover:text-white transition-colors"
                        title="More"
                        aria-label="More options"
                        disabled={deletingId === l.id}
                      >
                        <MoreVertical className="h-4 w-4 cursor-pointer" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[180px]">
                      <DropdownMenuItem
                        onClick={() => removeLogo(l.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove logo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
