import { useState, useEffect, useCallback } from 'react'
import { allConcepts } from '@/content'

const STORAGE_KEY = 'backend-revision-progress'

interface ProgressState {
  completed: string[] // concept ids
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ProgressState
  } catch {
    // ignore
  }
  return { completed: [] }
}

function save(state: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(load)

  // persist on every change
  useEffect(() => {
    save(state)
  }, [state])

  const markComplete = useCallback((id: string) => {
    setState(prev =>
      prev.completed.includes(id)
        ? prev
        : { completed: [...prev.completed, id] }
    )
  }, [])

  const markIncomplete = useCallback((id: string) => {
    setState(prev => ({
      completed: prev.completed.filter(c => c !== id),
    }))
  }, [])

  const isComplete = useCallback(
    (id: string) => state.completed.includes(id),
    [state]
  )

  // Percentage per level
  const levelProgress = (level: 1 | 2 | 3): number => {
    const conceptsInLevel = allConcepts.filter(c => c.level === level)
    if (conceptsInLevel.length === 0) return 0
    const done = conceptsInLevel.filter(c => state.completed.includes(c.id)).length
    return Math.round((done / conceptsInLevel.length) * 100)
  }

  // Overall percentage
  const totalProgress = (): number => {
    if (allConcepts.length === 0) return 0
    return Math.round((state.completed.length / allConcepts.length) * 100)
  }

  return {
    completed: state.completed,
    markComplete,
    markIncomplete,
    isComplete,
    levelProgress,
    totalProgress,
  }
}
