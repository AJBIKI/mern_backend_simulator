import { useState, useEffect, useCallback } from 'react'

export type ViewMode = 'reading' | 'interview'

const MODE_STORAGE_KEY = 'backend-revision-view-mode'
const MODE_CHANGE_EVENT = 'backend-revision-mode-change'

function getSavedMode(): ViewMode {
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY)
    if (saved === 'interview' || saved === 'reading') {
      return saved
    }
  } catch {
    // ignore
  }
  return 'reading'
}

export function useViewMode() {
  const [mode, setModeState] = useState<ViewMode>(getSavedMode)

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<ViewMode>
      if (customEvent.detail) {
        setModeState(customEvent.detail)
      } else {
        setModeState(getSavedMode())
      }
    }

    window.addEventListener(MODE_CHANGE_EVENT, handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener(MODE_CHANGE_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const setMode = useCallback((newMode: ViewMode) => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, newMode)
    } catch {
      // ignore
    }
    setModeState(newMode)
    window.dispatchEvent(new CustomEvent<ViewMode>(MODE_CHANGE_EVENT, { detail: newMode }))
  }, [])

  const toggleMode = useCallback(() => {
    setMode(mode === 'reading' ? 'interview' : 'reading')
  }, [mode, setMode])

  return {
    mode,
    setMode,
    toggleMode,
    isInterviewMode: mode === 'interview',
    isReadingMode: mode === 'reading',
  }
}
