'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {  
  return (
    <footer className="w-full border-t border-zinc-700 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-start gap-3 text-zinc-200">
          <Image
            src="/logopogo_logo.png"
            alt="LogoPogo Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <p className="font-semibold text-lg">LogoPogo</p>
            <p className="text-sm text-zinc-500 max-w-xs">
              Instantly generate clean, modern, and professional logos for your brand.
            </p>
            <p className="text-xs mt-2 text-zinc-400">© 2025 LogoPogo.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
