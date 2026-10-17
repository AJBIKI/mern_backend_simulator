import type { Concept } from '@/content/types'
import { glossaryMap } from '@/content/glossary'

/**
 * Generates a structured 3-line interview answer from a concept's pitfalls and terms.
 * Line 1: Core mechanism / fundamental rule (using terms & one-liner)
 * Line 2: Critical trap or common misconception (from pitfalls)
 * Line 3: Production architectural best practice
 */
export function getInterviewAnswer(concept: Concept, questionIndex: number): [string, string, string] {
  const termsList = (concept.terms || []).slice(0, 3).map(t => glossaryMap[t]?.term || t)
  const pitfall = concept.pitfalls?.[questionIndex % (concept.pitfalls?.length || 1)] ||
    concept.pitfalls?.[0] ||
    'Failing to handle asynchronous boundary conditions properly.'

  // Line 1: Core principle
  const line1 = `Core Principle: ${concept.oneLiner} Key concepts: ${termsList.join(', ')}.`

  // Line 2: The trap / edge case
  const line2 = `Watch Out: ${pitfall}`

  // Line 3: Production standard / rule of thumb
  const termDef = glossaryMap[concept.terms?.[0]]?.definition
  const line3 = termDef
    ? `Production Rule: ${termDef}`
    : `Production Rule: Design for failure isolation and verify behavior under peak concurrency.`

  return [line1, line2, line3]
}
