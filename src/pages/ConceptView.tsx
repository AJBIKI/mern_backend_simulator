import { useParams, Navigate } from 'react-router-dom'
import { conceptMap } from '@/content'
import { ConceptPage } from '@/components/concept/ConceptPage'

export function ConceptView() {
  const { id } = useParams<{ id: string }>()
  const concept = id ? conceptMap[id] : null

  if (!concept) {
    return <Navigate to="/" replace />
  }

  return <ConceptPage concept={concept} />
}
