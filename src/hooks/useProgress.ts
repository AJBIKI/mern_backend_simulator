import { useState, useEffect, useCallback } from 'react'
import { allConcepts } from '@/content'

const STORAGE_KEY = 'backend-revision-progress'

export type ConceptStatus = 'not_started' | 'in_progress' | 'done'
export type ProgressFilter = 'all' | 'not_started' | 'in_progress' | 'done'
export type InterviewStatus = 'got' | 'missed'

export interface QuizResult {
  attempts: number
  correct: boolean
}

interface ProgressState {
  completed: string[] // concept ids
  inProgress: string[] // concept ids
  quizResults: Record<string, QuizResult> // quizId -> { attempts, correct }
  interviewResults: Record<string, InterviewStatus> // `${conceptId}::${questionIndex}` -> 'got' | 'missed'
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        completed: Array.isArray(parsed.completed) ? parsed.completed : [],
        inProgress: Array.isArray(parsed.inProgress) ? parsed.inProgress : [],
        quizResults: (parsed.quizResults && typeof parsed.quizResults === 'object') ? parsed.quizResults : {},
        interviewResults: (parsed.interviewResults && typeof parsed.interviewResults === 'object') ? parsed.interviewResults : {},
      }
    }
  } catch {
    // ignore
  }
  return { completed: [], inProgress: [], quizResults: {}, interviewResults: {} }
}

function save(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(load)

  // persist on every change
  useEffect(() => {
    save(state)
  }, [state])

  const markStarted = useCallback((id: string) => {
    setState(prev => {
      if (prev.completed.includes(id) || prev.inProgress.includes(id)) {
        return prev
      }
      return {
        ...prev,
        inProgress: [...prev.inProgress, id],
      }
    })
  }, [])

  const markComplete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      completed: prev.completed.includes(id) ? prev.completed : [...prev.completed, id],
      inProgress: prev.inProgress.filter(c => c !== id),
    }))
  }, [])

  const markIncomplete = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      completed: prev.completed.filter(c => c !== id),
      inProgress: prev.inProgress.includes(id) ? prev.inProgress : [...prev.inProgress, id],
    }))
  }, [])

  const isComplete = useCallback(
    (id: string) => state.completed.includes(id),
    [state.completed]
  )

  const isInProgress = useCallback(
    (id: string) => !state.completed.includes(id) && state.inProgress.includes(id),
    [state.completed, state.inProgress]
  )

  const getStatus = useCallback(
    (id: string): ConceptStatus => {
      if (state.completed.includes(id)) return 'done'
      if (state.inProgress.includes(id)) return 'in_progress'
      return 'not_started'
    },
    [state.completed, state.inProgress]
  )

  // Quiz results
  const recordQuizResult = useCallback((quizId: string, isCorrect: boolean) => {
    setState(prev => {
      const existing = prev.quizResults[quizId] || { attempts: 0, correct: false }
      return {
        ...prev,
        quizResults: {
          ...prev.quizResults,
          [quizId]: {
            attempts: existing.attempts + 1,
            correct: isCorrect || existing.correct,
          },
        },
      }
    })
  }, [])

  const getQuizResult = useCallback(
    (quizId: string): QuizResult | undefined => state.quizResults[quizId],
    [state.quizResults]
  )

  // Interview results
  const recordInterviewResult = useCallback((key: string, status: InterviewStatus) => {
    setState(prev => ({
      ...prev,
      interviewResults: {
        ...prev.interviewResults,
        [key]: status,
      },
    }))
  }, [])

  const getInterviewResult = useCallback(
    (key: string): InterviewStatus | undefined => state.interviewResults[key],
    [state.interviewResults]
  )

  // Percentage and counts per level
  const levelStats = useCallback((level: 1 | 2 | 3) => {
    const conceptsInLevel = allConcepts.filter(c => c.level === level)
    const total = conceptsInLevel.length
    if (total === 0) return { done: 0, inProgress: 0, notStarted: 0, total: 0, percentage: 0 }
    const done = conceptsInLevel.filter(c => state.completed.includes(c.id)).length
    const inProgress = conceptsInLevel.filter(c => !state.completed.includes(c.id) && state.inProgress.includes(c.id)).length
    const notStarted = total - done - inProgress
    const percentage = Math.round((done / total) * 100)
    return { done, inProgress, notStarted, total, percentage }
  }, [state.completed, state.inProgress])

  const levelProgress = useCallback((level: 1 | 2 | 3): number => {
    return levelStats(level).percentage
  }, [levelStats])

  // Overall percentage
  const totalProgress = useCallback((): number => {
    if (allConcepts.length === 0) return 0
    return Math.round((state.completed.length / allConcepts.length) * 100)
  }, [state.completed])

  return {
    completed: state.completed,
    inProgress: state.inProgress,
    quizResults: state.quizResults,
    interviewResults: state.interviewResults,
    markStarted,
    markComplete,
    markIncomplete,
    isComplete,
    isInProgress,
    getStatus,
    recordQuizResult,
    getQuizResult,
    recordInterviewResult,
    getInterviewResult,
    levelStats,
    levelProgress,
    totalProgress,
  }
}
