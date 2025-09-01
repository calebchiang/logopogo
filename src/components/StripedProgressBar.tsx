'use client'

import { useEffect, useMemo, useState } from 'react'

type Props = {
  className?: string
  done?: boolean
}

export default function StripedProgressBar({ className = '', done = false }: Props) {
  const stages = useMemo(
    () => [
      { label: 'Generating logo…', target: 30, delay: 8000 },
      { label: 'Enhancing design…', target: 70, delay: 8500 },
      { label: 'Finalizing…', target: 95, delay: 5000 },
      { label: 'Complete', target: 100, delay: 0 },
    ],
    []
  )

  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let mounted = true
    let t: ReturnType<typeof setTimeout> | null = null

    const run = async () => {
      for (let i = 0; i < 3 && mounted; i++) {
        setStageIdx(i)
        requestAnimationFrame(() => setProgress(stages[i].target))
        await new Promise<void>((res) => {
          t = setTimeout(() => res(), stages[i].delay)
        })
        if (!mounted) return
      }
      setStageIdx(2)
      requestAnimationFrame(() => setProgress(stages[2].target))
      const waitForDone = () =>
        new Promise<void>((res) => {
          const tick = () => {
            if (!mounted) return res()
            if (done) return res()
            t = setTimeout(tick, 300)
          }
          tick()
        })
      await waitForDone()
      if (!mounted) return
      setStageIdx(3)
      requestAnimationFrame(() => setProgress(100))
    }

    run()

    return () => {
      mounted = false
      if (t) clearTimeout(t)
    }
  }, [done, stages])

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-300">{stages[stageIdx]?.label}</span>
        <span className="text-[10px] text-zinc-500 tracking-wide">{Math.round(progress)}%</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
        <div
          className="h-full rounded-full rainbow-sheen"
          style={{ width: `${progress}%` }}
        />
      </div>

      <style jsx>{`
        .rainbow-sheen {
          background: linear-gradient(
            90deg,
            #8b5cf6,
            #6366f1,
            #06b6d4,
            #10b981,
            #f59e0b,
            #ef4444,
            #ec4899,
            #8b5cf6
          );
          background-size: 200% 100%;
          animation: slide 1.8s linear infinite;
          filter: saturate(120%);
          transition: width 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes slide {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </div>
  )
}
