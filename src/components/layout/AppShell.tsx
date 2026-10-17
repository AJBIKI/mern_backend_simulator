import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { CommandPalette } from './CommandPalette'
import { ShortcutsModal } from '@/components/common/ShortcutsModal'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false))
  const [searchOpen, setSearchOpen] = useState(false)

  const chordRef = useRef<string | null>(null)
  const chordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true)
    }
  }, [location.pathname])

  // Global shortcuts: Cmd+K / Ctrl+K and 'G' then 'H'/'I'/'F'/'G' chords
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
        return
      }

      // Handle chord sequence after 'g'
      if (chordRef.current === 'g') {
        chordRef.current = null
        if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)

        const key = e.key.toLowerCase()
        if (key === 'h') {
          e.preventDefault()
          navigate('/')
          return
        } else if (key === 'i') {
          e.preventDefault()
          navigate('/interview')
          return
        } else if (key === 'f') {
          e.preventDefault()
          navigate('/flashcards')
          return
        } else if (key === 'g') {
          e.preventDefault()
          navigate('/graph')
          return
        }
      }

      // First key 'g'
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        chordRef.current = 'g'
        if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)
        chordTimeoutRef.current = setTimeout(() => {
          chordRef.current = null
        }, 1000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (chordTimeoutRef.current) clearTimeout(chordTimeoutRef.current)
    }
  }, [navigate])

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={() => setSidebarCollapsed(v => !v)}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <ShortcutsModal />
    </div>
  )
}
