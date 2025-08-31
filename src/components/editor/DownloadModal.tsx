"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type DownloadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (opts: { transparent: boolean }) => void;
};

export default function DownloadModal({ open, onOpenChange, onDownload }: DownloadModalProps) {
  const [transparent, setTransparent] = useState(false);

  useEffect(() => {
    if (!open) setTransparent(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-zinc-200 border border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-lg">Download</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-zinc-800/60">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border border-white/80 bg-transparent accent-white"
              checked={transparent}
              onChange={(e) => setTransparent(e.target.checked)}
            />
            <span className="text-sm text-zinc-100">Transparent background</span>
          </label>
        </div>

        <DialogFooter className="mt-4">
          <button
            type="button"
            onClick={() => {
              onDownload({ transparent });
              onOpenChange(false);
            }}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
