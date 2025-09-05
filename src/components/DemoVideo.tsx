'use client'

import { motion } from 'framer-motion'

export default function DemoVideo() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-12 text-center">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
        See Logo<span className="text-green-500">Pogo</span> in Action
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950"
      >
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube-nocookie.com/embed/AP00poJ6wiE?rel=0&modestbranding=1&playsinline=1"
            title="LogoPogo Demo"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </motion.div>
    </section>
  )
}
