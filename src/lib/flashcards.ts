import { allConcepts, conceptMap } from '@/content'
import { glossaryMap } from '@/content/glossary'
import { getInterviewAnswer } from '@/lib/interviewAnswers'

export type FlashcardSource = 'term' | 'pitfall' | 'interview'
export type SM2Rating = 'again' | 'hard' | 'good' | 'easy'

export interface CardProgress {
  cardId: string          // "term:jwt" or "pitfall:middleware-pipeline:0"
  conceptId: string
  conceptTitle: string
  level: 1 | 2 | 3
  source: FlashcardSource
  front: string
  back: string
  ease: number            // start 2.5
  interval: number        // days; start 0
  dueAt: number           // timestamp
  lapses: number          // start 0
}

export interface StoredProgress {
  ease: number
  interval: number
  dueAt: number
  lapses: number
}

const STORAGE_KEY = 'backend-revision-flashcard-progress'
const ONE_MIN_MS = 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Generates all base flashcards derived from concepts:
 * 1. Concept terms (unique per termId)
 * 2. Concept pitfalls
 * 3. Concept interview questions with 3-line structured answers
 */
export function generateBaseFlashcards(): CardProgress[] {
  const cards: CardProgress[] = []
  const seenCardIds = new Set<string>()

  for (const concept of allConcepts) {
    // 1. Terms
    if (Array.isArray(concept.terms)) {
      for (const termId of concept.terms) {
        const cardId = `term:${termId}`
        if (!seenCardIds.has(cardId)) {
          seenCardIds.add(cardId)
          const termObj = glossaryMap[termId]
          const termName = termObj?.term || termId
          const definition = termObj?.definition || 'Key concept in backend development.'
          const appearsInIds = termObj?.concepts && termObj.concepts.length > 0 ? termObj.concepts : [concept.id]
          const appearsInTitles = appearsInIds.map(cid => conceptMap[cid]?.title || cid).join(', ')

          cards.push({
            cardId,
            conceptId: concept.id,
            conceptTitle: concept.title,
            level: concept.level,
            source: 'term',
            front: `What is ${termName}?`,
            back: `${definition}\n\nAppears in: ${appearsInTitles}`,
            ease: 2.5,
            interval: 0,
            dueAt: 0,
            lapses: 0,
          })
        }
      }
    }

    // 2. Pitfalls
    if (Array.isArray(concept.pitfalls)) {
      concept.pitfalls.forEach((pitfall, index) => {
        const cardId = `pitfall:${concept.id}:${index}`
        if (!seenCardIds.has(cardId)) {
          seenCardIds.add(cardId)
          cards.push({
            cardId,
            conceptId: concept.id,
            conceptTitle: concept.title,
            level: concept.level,
            source: 'pitfall',
            front: `Pitfall in ${concept.title}?`,
            back: pitfall,
            ease: 2.5,
            interval: 0,
            dueAt: 0,
            lapses: 0,
          })
        }
      })
    }

    // 3. Interview Questions
    if (Array.isArray(concept.interview)) {
      concept.interview.forEach((question, index) => {
        const cardId = `interview:${concept.id}:${index}`
        if (!seenCardIds.has(cardId)) {
          seenCardIds.add(cardId)
          const answerLines = getInterviewAnswer(concept, index)
          cards.push({
            cardId,
            conceptId: concept.id,
            conceptTitle: concept.title,
            level: concept.level,
            source: 'interview',
            front: `${concept.title}: ${question}`,
            back: answerLines.join('\n'),
            ease: 2.5,
            interval: 0,
            dueAt: 0,
            lapses: 0,
          })
        }
      })
    }
  }

  return cards
}

/**
 * Loads stored user progress from localStorage.
 */
export function loadStoredProgress(): Record<string, StoredProgress> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to load flashcard progress:', err)
  }
  return {}
}

/**
 * Saves stored progress to localStorage and notifies listeners.
 */
export function saveStoredProgress(progress: Record<string, StoredProgress>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    window.dispatchEvent(new Event('flashcards-updated'))
  } catch (err) {
    console.error('Failed to save flashcard progress:', err)
  }
}

/**
 * Retrieves all flashcards merged with user's saved progress.
 */
export function getAllFlashcardsWithProgress(): CardProgress[] {
  const baseCards = generateBaseFlashcards()
  const stored = loadStoredProgress()

  return baseCards.map(card => {
    const item = stored[card.cardId]
    if (item) {
      return {
        ...card,
        ease: item.ease ?? card.ease,
        interval: item.interval ?? card.interval,
        dueAt: item.dueAt ?? card.dueAt,
        lapses: item.lapses ?? card.lapses,
      }
    }
    return card
  })
}

/**
 * SM-2 Simplified Algorithm:
 * - Again:  ease -= 0.2 (min 1.3), interval = 0, due = now + 1min, lapses++
 * - Hard:   ease -= 0.15, interval = max(1, interval * 1.2)
 * - Good:   interval = interval ? interval * ease : 1
 * - Easy:   ease += 0.15, interval = interval ? interval * ease * 1.3 : 3
 * All due = now + interval days (except Again: now + 1min).
 */
export function applySM2(card: CardProgress, rating: SM2Rating, now = Date.now()): CardProgress {
  let ease = card.ease
  let interval = card.interval
  let dueAt = card.dueAt
  let lapses = card.lapses

  switch (rating) {
    case 'again': {
      ease = Math.max(1.3, Number((ease - 0.2).toFixed(2)))
      interval = 0
      dueAt = now + ONE_MIN_MS
      lapses += 1
      break
    }
    case 'hard': {
      ease = Math.max(1.3, Number((ease - 0.15).toFixed(2)))
      interval = Math.max(1, interval > 0 ? Number((interval * 1.2).toFixed(1)) : 1)
      dueAt = now + interval * ONE_DAY_MS
      break
    }
    case 'good': {
      interval = interval > 0 ? Number((interval * ease).toFixed(1)) : 1
      dueAt = now + interval * ONE_DAY_MS
      break
    }
    case 'easy': {
      ease = Number((ease + 0.15).toFixed(2))
      interval = interval > 0 ? Number((interval * ease * 1.3).toFixed(1)) : 3
      dueAt = now + interval * ONE_DAY_MS
      break
    }
  }

  return {
    ...card,
    ease,
    interval,
    dueAt,
    lapses,
  }
}

/**
 * Returns cards that are due now or today.
 */
export function getDueFlashcards(cards: CardProgress[], now = Date.now()): CardProgress[] {
  return cards.filter(card => card.dueAt <= now)
}

/**
 * Returns count of cards due today across all flashcards.
 */
export function getDueCardsCount(now = Date.now()): number {
  const cards = getAllFlashcardsWithProgress()
  return getDueFlashcards(cards, now).length
}

/**
 * Returns the top weakest cards (highest lapses, lowest ease, lowest interval).
 */
export function getWeakestCards(cards: CardProgress[], count = 10): CardProgress[] {
  const sorted = [...cards].sort((a, b) => {
    // Highest lapses first
    if (b.lapses !== a.lapses) return b.lapses - a.lapses
    // Lowest ease first
    if (a.ease !== b.ease) return a.ease - b.ease
    // Lowest interval first
    return a.interval - b.interval
  })

  return sorted.slice(0, count)
}
