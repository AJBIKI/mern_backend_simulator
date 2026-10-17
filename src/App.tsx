import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { ConceptView } from '@/pages/ConceptView'
import { InterviewPage } from '@/pages/InterviewPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concept/:id" element={<ConceptView />} />
        <Route path="/interview" element={<InterviewPage />} />
      </Routes>
    </AppShell>
  )
}
