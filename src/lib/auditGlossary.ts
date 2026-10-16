import { allConcepts } from '../content/index'
import { glossary } from '../content/glossary'
import type { GlossaryTerm } from '../content/types'

declare const process: any

export interface AuditReport {
  missingTerms: { termId: string; usedIn: string[] }[]
  unlinkedGlossaryTerms: string[]
  deadNextLinks: { fromConcept: string; toConcept: string }[]
  crossReferenceSuggestions: { termId: string; termName: string; missingConcepts: string[] }[]
  totalConcepts: number
  totalGlossaryTerms: number
  totalBacklinks: number
}

export function runAudit(): AuditReport {
  const conceptMap = new Map(allConcepts.map(c => [c.id, c]))
  const glossaryMap = new Map(glossary.map(g => [g.id, g]))

  // 1. Terms referenced in concepts but missing from glossary
  const missingTermsMap = new Map<string, Set<string>>()
  for (const concept of allConcepts) {
    for (const term of concept.terms || []) {
      if (!glossaryMap.has(term)) {
        if (!missingTermsMap.has(term)) missingTermsMap.set(term, new Set())
        missingTermsMap.get(term)!.add(concept.id)
      }
    }
  }

  const missingTerms = Array.from(missingTermsMap.entries()).map(([termId, usedIn]) => ({
    termId,
    usedIn: Array.from(usedIn),
  }))

  // 2. Glossary terms with no backlinks
  const unlinkedGlossaryTerms: string[] = []
  let totalBacklinks = 0
  for (const item of glossary) {
    const count = (item.concepts || []).length
    totalBacklinks += count
    if (count === 0) {
      unlinkedGlossaryTerms.push(item.id)
    }
  }

  // 3. Dead next links
  const deadNextLinks: { fromConcept: string; toConcept: string }[] = []
  for (const concept of allConcepts) {
    for (const nextId of concept.next || []) {
      if (!conceptMap.has(nextId)) {
        deadNextLinks.push({ fromConcept: concept.id, toConcept: nextId })
      }
    }
  }

  // 4. Cross-reference detection across concept copy
  const crossReferenceSuggestions: { termId: string; termName: string; missingConcepts: string[] }[] = []

  // Precompile word-boundary regexes for glossary terms that have distinct meaning
  for (const term of glossary) {
    const currentConcepts = new Set(term.concepts || [])
    const missingForThisTerm: string[] = []

    // Search term keywords: term.id and term.term
    const rawKeywords = [term.term, term.id.replace(/-/g, ' ')]
    // Filter out common stopwords that would falsely match everywhere
    const safeKeywords = rawKeywords
      .map(k => k.trim())
      .filter(k => k.length >= 3 && !['all', 'for', 'the', 'and', 'not', 'can', 'has', 'row'].includes(k.toLowerCase()))

    if (safeKeywords.length === 0) continue

    const pattern = new RegExp(
      safeKeywords.map(k => `\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).join('|'),
      'i'
    )

    for (const concept of allConcepts) {
      if (currentConcepts.has(concept.id)) continue

      // Search concept title, oneLiner, pitfalls, interview, and declared terms
      const textToSearch = [
        concept.title,
        concept.oneLiner,
        concept.mentalModel,
        ...(concept.pitfalls || []),
        ...(concept.interview || []),
        concept.snippet?.code || '',
      ].join(' ')

      if (pattern.test(textToSearch)) {
        missingForThisTerm.push(concept.id)
      }
    }

    if (missingForThisTerm.length > 0) {
      crossReferenceSuggestions.push({
        termId: term.id,
        termName: term.term,
        missingConcepts: missingForThisTerm,
      })
    }
  }

  return {
    missingTerms,
    unlinkedGlossaryTerms,
    deadNextLinks,
    crossReferenceSuggestions,
    totalConcepts: allConcepts.length,
    totalGlossaryTerms: glossary.length,
    totalBacklinks,
  }
}

export function logAuditReport(report: AuditReport): boolean {
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log('            BACKEND REVISION — GLOSSARY INTEGRITY AUDIT        ')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(`Concepts Analyzed:     ${report.totalConcepts}`)
  console.log(`Glossary Terms:        ${report.totalGlossaryTerms}`)
  console.log(`Total Backlinks:       ${report.totalBacklinks}`)
  console.log('───────────────────────────────────────────────────────────────')

  let hasErrors = false

  // 1. Missing terms
  if (report.missingTerms.length > 0) {
    hasErrors = true
    console.error(`\n❌ [FAIL] Missing Glossary Terms (${report.missingTerms.length}):`)
    report.missingTerms.forEach(m => {
      console.error(`   - ${m.termId} (used in: ${m.usedIn.join(', ')})`)
    })
  } else {
    console.log('✅ [PASS] 0 missing glossary terms in concept declared terms')
  }

  // 2. Unlinked terms
  if (report.unlinkedGlossaryTerms.length > 0) {
    hasErrors = true
    console.error(`\n❌ [FAIL] Glossary Terms Without Backlinks (${report.unlinkedGlossaryTerms.length}):`)
    report.unlinkedGlossaryTerms.forEach(t => {
      console.error(`   - ${t}`)
    })
  } else {
    console.log('✅ [PASS] 0 glossary terms without backlinks')
  }

  // 3. Dead next links
  if (report.deadNextLinks.length > 0) {
    hasErrors = true
    console.error(`\n❌ [FAIL] Dead Next Links (${report.deadNextLinks.length}):`)
    report.deadNextLinks.forEach(d => {
      console.error(`   - Concept "${d.fromConcept}" links to missing concept "${d.toConcept}"`)
    })
  } else {
    console.log('✅ [PASS] 0 dead next links across all concepts')
  }

  console.log('───────────────────────────────────────────────────────────────')
  if (report.crossReferenceSuggestions.length > 0) {
    console.log(`ℹ️ [INFO] Cross-reference suggestions found for ${report.crossReferenceSuggestions.length} terms`)
  } else {
    console.log('✅ [PASS] All cross-references fully synced')
  }
  console.log('═══════════════════════════════════════════════════════════════\n')

  return !hasErrors
}

// Dev entrypoint execution
const isDirectExecution = process.argv[1] && (
  process.argv[1].endsWith('auditGlossary.ts') ||
  process.argv[1].endsWith('auditGlossary.js')
)

if (isDirectExecution) {
  const report = runAudit()
  const ok = logAuditReport(report)
  if (!ok) {
    process.exit(1)
  }
}
