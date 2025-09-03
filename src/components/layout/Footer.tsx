'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaTiktok, FaYoutube, FaInstagram } from 'react-icons/fa'

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
        <div className="flex flex-col items-center md:items-end gap-3">
          <p className="text-sm text-zinc-400">Follow us for design ideas</p>
          <div className="flex gap-5 text-zinc-400">
            <Link href="https://www.tiktok.com/@logopogo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <FaTiktok size={22} />
            </Link>
            <Link href="https://www.instagram.com/logopogo.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <FaInstagram size={22} />
            </Link>
            <Link href="https://www.youtube.com/@logopogoAI" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <FaYoutube size={22} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
