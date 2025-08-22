'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function SampleLogos() {
  return (
    <section className="mx-auto max-w-5xl py-2 text-center mb-8">
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
        Design clean and modern logos for your brand today
      </h2>

      <div className="mt-8 inline-grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, i) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
              delay: i * 0.08, 
            }}
            className="rounded-xl"
          >
            <Image
              src={`/logos/logo_${n}.png`}
              alt={`sample-logo-${n}`}
              width={120}
              height={120}
              className="rounded-lg object-contain"
              priority={n === 1}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
