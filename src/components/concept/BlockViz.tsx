import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { getVizComponent } from '@/lib/registerViz'
import type { VizStep } from '@/content/types'

interface BlockVizProps {
  component: string
  steps: VizStep[]
}

export function BlockVizSkeleton() {
  return (
    <div className="w-full h-44 rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-32 bg-slate-800 rounded" />
        <div className="h-3.5 w-16 bg-slate-800 rounded" />
      </div>
      <div className="flex items-center justify-around gap-4 my-auto">
        <div className="h-12 w-24 bg-slate-800/80 rounded-lg" />
        <div className="h-0.5 w-12 bg-slate-800 rounded" />
        <div className="h-12 w-24 bg-slate-800/80 rounded-lg" />
        <div className="h-0.5 w-12 bg-slate-800 rounded" />
        <div className="h-12 w-24 bg-slate-800/80 rounded-lg" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-16 bg-slate-800 rounded-lg" />
        <div className="h-6 w-16 bg-slate-800 rounded-lg" />
        <div className="h-2 w-24 bg-slate-800 rounded-full ml-auto" />
      </div>
    </div>
  )
}

export function BlockViz({ component, steps }: BlockVizProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const Viz = getVizComponent(component)

  useEffect(() => {
    setCurrentStep(0)
    setIsReady(true)
  }, [component])

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

  if (!isReady) {
    return <BlockVizSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
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
