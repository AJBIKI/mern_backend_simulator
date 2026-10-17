import { useState, useEffect, useCallback } from 'react'

const SIMPLE_STORAGE_KEY = 'backend-revision-simple-mode'

export function useSimpleMode() {
  const [isSimple, setIsSimple] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIMPLE_STORAGE_KEY)
      return saved ? JSON.parse(saved) === true : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIMPLE_STORAGE_KEY, JSON.stringify(isSimple))
      window.dispatchEvent(new Event('simple-mode-updated'))
    } catch {
      // ignore
    }
  }, [isSimple])

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(SIMPLE_STORAGE_KEY)
        if (saved !== null) {
          setIsSimple(JSON.parse(saved) === true)
        }
      } catch {
        // ignore
      }
    }
    window.addEventListener('simple-mode-updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('simple-mode-updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  const toggleSimpleMode = useCallback(() => {
    setIsSimple(prev => !prev)
  }, [])

  return { isSimple, setIsSimple, toggleSimpleMode }
}
