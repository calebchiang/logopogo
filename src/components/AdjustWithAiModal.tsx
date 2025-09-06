'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Coins } from 'lucide-react'
import { useState } from 'react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (instruction: string) => void
}

export default function AdjustWithAiModal({ open, onOpenChange, onConfirm }: Props) {
  const [instruction, setInstruction] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>I’ll tweak this for you</DialogTitle>
          <DialogDescription>Tell me exactly what to change for your logo.</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder='e.g., "Change the icon color to navy"'
            className="w-full h-11 rounded-lg border border-zinc-800 bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-700"
          />
        </div>

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={() => onConfirm(instruction)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <Coins className="h-4 w-4 text-yellow-300" />
            Regenerate logo
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
