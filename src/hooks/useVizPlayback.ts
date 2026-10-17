import { useState, useEffect, useRef, useCallback } from 'react'

interface UseVizPlaybackProps {
  currentStep: number
  totalSteps: number
  onStep: (step: number) => void
  onReset?: () => void
  intervalMs?: number
}

export function useVizPlayback({
  currentStep,
  totalSteps,
  onStep,
  onReset,
  intervalMs = 1800,
}: UseVizPlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentStepRef = useRef(currentStep)

  // Keep currentStepRef in sync with latest currentStep
  useEffect(() => {
    currentStepRef.current = currentStep
  }, [currentStep])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Auto-advance step on interval when playing
  useEffect(() => {
    if (!isPlaying) {
      clearTimer()
      return
    }

    timerRef.current = setInterval(() => {
      const nextStep = currentStepRef.current + 1
      if (nextStep >= totalSteps) {
        clearTimer()
        setIsPlaying(false)
      } else {
        onStep(nextStep)
      }
    }, intervalMs)

    return () => {
      clearTimer()
    }
  }, [isPlaying, totalSteps, onStep, intervalMs, clearTimer])

  // Play / Pause toggle
  const handlePlay = useCallback(() => {
    setIsPlaying(prev => {
      if (prev) {
        return false
      }
      // If reached the end of steps, loop back and play from beginning
      if (currentStepRef.current >= totalSteps - 1) {
        onStep(0)
      }
      return true
    })
  }, [totalSteps, onStep])

  // Reset
  const handleReset = useCallback(() => {
    setIsPlaying(false)
    clearTimer()
    if (onReset) {
      onReset()
    } else {
      onStep(0)
    }
  }, [onReset, onStep, clearTimer])

  return {
    isPlaying,
    handlePlay,
    handleReset,
  }
}
