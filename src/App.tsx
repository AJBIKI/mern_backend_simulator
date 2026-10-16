import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { ConceptView } from '@/pages/ConceptView'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concept/:id" element={<ConceptView />} />
      </Routes>
    </AppShell>
  )
}
