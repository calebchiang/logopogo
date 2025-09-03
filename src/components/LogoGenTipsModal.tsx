'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Zap } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoGenTipsModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Zap className="h-6 w-6 text-yellow-400" />
              Tips to generate the highest quality logo
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-sm text-zinc-300">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Be specific with your description</span> 
                </li>
                <li>
                  <span className="font-medium">State a style:</span> “Flat icon, outline, modern minimalist.”
                </li>
                <li>If you want certain elements to use exact colors, say so (e.g., black and white panda). 
                  If you don’t, the AI will choose for you. 
                </li>
                <li>
                  <span className="font-medium">Keep it simple:</span> 1–2 strong visual elements work best.
                </li>
              </ul>
            </div>

            <div className="md:border-l md:border-zinc-800 md:pl-6 text-sm text-zinc-300 space-y-3">
              <p className="font-medium text-zinc-200">Example prompts:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  “Minimal, geometric fox head, flat icon style in orange and gray.”
                </li>
                <li>
                  “Brown monkey typing on a gray laptop”
                </li>
                <li>
                  “Cartoon rocket lifting off with a gray dust cloud underneath it and an orange flame coming from the bottom”
                </li>
                <li>
                  “Single gray mountain with visible white snow at the peak”
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
