'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => Promise<void>
  confirmHref?: string | null
}

export default function SaveModal({ open, onOpenChange, onSave, confirmHref }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSave = async () => {
    setErr(null)
    setLoading(true)
    try {
      await onSave()
      if (confirmHref) router.push(confirmHref)
      onOpenChange(false)
    } catch (e: any) {
      setErr(e?.message || 'Failed to save changes')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (confirmHref) router.push(confirmHref)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-zinc-200 border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg">Unsaved changes</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            You have unsaved edits. Would you like to save before leaving this page?
          </p>
          {err && (
            <div className="text-sm bg-red-900/30 text-red-300 border border-red-800 rounded-md px-3 py-2">
              {err}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel Edits
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading ? 'Saving…' : 'Save & Leave'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
