'use client'

import { useState } from 'react'
import Image from 'next/image'
import AuthModal from '@/components/AuthModal'
import { motion } from 'framer-motion'

export default function ProductMockups() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mx-auto max-w-5xl px-6 text-center mb-20">
      <AuthModal open={open} onOpenChange={setOpen} />
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
      Create impactful branding with <span className="italic">zero</span> design experience.      </h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 place-items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950"
        >
          <Image
            src="/product_mockup_1.png"
            alt="Product mockup dark cup"
            width={760}
            height={560}
            className="w-full h-auto object-contain"
            priority
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950"
        >
          <Image
            src="/product_mockup_2.png"
            alt="Product mockup light cup"
            width={760}
            height={560}
            className="w-full h-auto object-contain"
          />
        </motion.div>
      </div>
      <div className="mt-8">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center h-12 rounded-xl px-5 bg-emerald-600 text-white border border-zinc-800 hover:bg-emerald-700"
        >
          Start Designing Today
        </button>
      </div>
    </section>
  )
}
