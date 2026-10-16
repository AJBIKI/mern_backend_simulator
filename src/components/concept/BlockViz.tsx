import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getVizComponent } from '@/lib/registerViz'
import type { VizStep } from '@/content/types'

interface BlockVizProps {
  component: string
  steps: VizStep[]
}

export function BlockViz({ component, steps }: BlockVizProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const Viz = getVizComponent(component)

  const handleStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)))
  }

  const handlePlay = () => {
    // Delegated to the viz component itself
  }

  const handleReset = () => {
    setCurrentStep(0)
  }

  if (!Viz) {
    return (
      <div className="p-4 rounded-xl bg-rose-400/10 border border-rose-400/30 text-rose-400 text-sm font-mono">
        Viz "{component}" not found in registry.
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Viz
        steps={steps}
        currentStep={currentStep}
        onStep={handleStep}
        onPlay={handlePlay}
        onReset={handleReset}
      />
    </motion.div>
  )
}
