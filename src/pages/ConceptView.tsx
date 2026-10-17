import { useParams, Navigate } from 'react-router-dom'
import { conceptMap } from '@/content'
import { ConceptPage } from '@/components/concept/ConceptPage'
import { SEO } from '@/components/common/SEO'

export function ConceptView() {
  const { id } = useParams<{ id: string }>()
  const concept = id ? conceptMap[id] : null

  if (!concept) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <SEO
        title={`${concept.title} (Level ${concept.level}) — Backend Revision`}
        description={concept.oneLiner}
      />
      <ConceptPage concept={concept} />
    </>
  )
}
