import { level1Concepts } from './level1'
import { level2Concepts } from './level2'
import { level3Concepts } from './level3'
import type { Concept } from './types'

export const allConcepts: Concept[] = [
  ...level1Concepts,
  ...level2Concepts,
  ...level3Concepts,
]

export const conceptMap = Object.fromEntries(allConcepts.map(c => [c.id, c]))

export { level1Concepts, level2Concepts, level3Concepts }
export type { Concept }
