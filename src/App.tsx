import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { ConceptView } from '@/pages/ConceptView'
import { InterviewPage } from '@/pages/InterviewPage'
import { FlashcardsPage } from '@/pages/FlashcardsPage'
import { GraphPage } from '@/pages/GraphPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concept/:id" element={<ConceptView />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/graph" element={<GraphPage />} />
      </Routes>
    </AppShell>
  )
}
