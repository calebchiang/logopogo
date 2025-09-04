'use client'

import { useState } from 'react'
import GenerateLogo from '@/components/GenerateLogo'
import SampleLogos from '@/components/SampleLogos'
import DemoVideo from '@/components/DemoVideo'

export default function Home() {
  const [step, setStep] = useState<0 | 1 | 2>(0)

  return (
    <main>
      <GenerateLogo step={step} onStepChange={setStep} />
      {step === 0 && (
        <>
          <SampleLogos />
          <DemoVideo />
        </>
      )}
    </main>
  )
}
