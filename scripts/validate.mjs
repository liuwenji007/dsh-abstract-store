#!/usr/bin/env node
/**
 * Check the committed data before a build or a pull request.
 *
 * Two rules matter most:
 *   1. Every upstream entry in scope has exactly one editorial decision.
 *   2. Every included entry carries the fields its score needs, and the score
 *      is reproducible from the published rubric.
 */
import {
  THEMES, WEIGHTS, AXES, computeScore, mergeCatalog, readCuration, readSnapshot, ROOT,
} from './lib/data.mjs'

const VERDICT_LIMIT = { zh: 40, en: 110 }
const THEME_SET = new Set(THEMES)

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function lengthProblem(label, value, limit) {
  if (value.length > limit) return `${label}: ${value.length} chars exceeds ${limit}`
  return null
}

function main() {
  const errors = []
  const warnings = []
  const snapshot = readSnapshot(ROOT)
  const curation = readCuration(ROOT)

  // ---- snapshot facts ----
  const slugs = new Set()
  for (const entry of snapshot.entries ?? []) {
    const label = `snapshot ${entry?.slug ?? '(no slug)'}`
    if (!text(entry.slug)) errors.push(`${label}: missing slug`)
    if (slugs.has(entry.slug)) errors.push(`${label}: duplicate slug`)
    slugs.add(entry.slug)
    if (!text(entry.name)) errors.push(`${label}: missing name`)
    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+$/.test(text(entry.repo))) {
      errors.push(`${label}: repo must be https://github.com/<owner>/<repo>`)
    }
    if (!text(entry.description?.en)) errors.push(`${label}: missing en description`)
    if (!text(entry.description?.zh)) errors.push(`${label}: missing zh description`)
    if (entry.npm !== null && (!isPlainObject(entry.npm) || !text(entry.npm.name))) {
      errors.push(`${label}: npm must be null or { name, version }`)
    }
    if (entry.stars !== null && !(Number.isInteger(entry.stars) && entry.stars >= 0)) {
      errors.push(`${label}: stars must be null or a non-negative integer`)
    }
    if (entry.addedAt !== null && !/^\d{4}-\d{2}-\d{2}$/.test(text(entry.addedAt))) {
      errors.push(`${label}: addedAt must be null or YYYY-MM-DD`)
    }
  }
  if (!Array.isArray(snapshot.entries) || snapshot.entries.length === 0) {
    errors.push('snapshot: no entries')
  }
  if (!text(snapshot.upstream?.commitShort) && !text(snapshot.upstream?.commit)) {
    warnings.push('snapshot: no upstream commit recorded (regenerate with npm run sync)')
  }

  // ---- curation decisions ----
  const decisions = curation.entries ?? {}
  const decisionSlugs = Object.keys(decisions)
  if (decisionSlugs.length !== slugs.size) {
    errors.push(`curation: ${decisionSlugs.length} decisions for ${slugs.size} snapshot entries`)
  }
  for (const slug of slugs) {
    if (!(slug in decisions)) errors.push(`curation: missing decision for ${slug}`)
  }
  for (const slug of decisionSlugs) {
    if (!slugs.has(slug)) errors.push(`curation: unknown slug ${slug}`)
  }

  if (curation.rubric?.weights) {
    for (const axis of AXES) {
      if (curation.rubric.weights[axis] !== WEIGHTS[axis]) {
        warnings.push(`curation.rubric.weights.${axis} is ${curation.rubric.weights[axis]}, code uses ${WEIGHTS[axis]}`)
      }
    }
  }

  let included = 0
  let adultCount = 0
  for (const [slug, decision] of Object.entries(decisions)) {
    const label = `curation ${slug}`
    if (typeof decision.include !== 'boolean') {
      errors.push(`${label}: include must be a boolean`)
      continue
    }
    if (!decision.include) {
      const reason = decision.reason
      if (!isPlainObject(reason)) {
        errors.push(`${label}: excluded entry needs reason { en, zh }`)
        continue
      }
      for (const lang of ['zh', 'en']) {
        const value = text(reason[lang])
        if (!value) errors.push(`${label}: reason.${lang} is empty`)
        const problem = lengthProblem(`${label}: reason.${lang}`, value, VERDICT_LIMIT[lang])
        if (problem) errors.push(problem)
      }
      continue
    }

    included += 1
    if (decision.adult === true) adultCount += 1
    if (!THEME_SET.has(decision.theme)) errors.push(`${label}: theme must be one of ${THEMES.join('|')}`)
    for (const axis of AXES) {
      if (!Number.isInteger(decision[axis]) || decision[axis] < 0 || decision[axis] > 100) {
        errors.push(`${label}: ${axis} must be an integer 0-100`)
      }
    }
    if (AXES.every((axis) => Number.isInteger(decision[axis]))) {
      const expected = computeScore(decision)
      if (!Number.isInteger(decision.score) && decision.score !== undefined) {
        errors.push(`${label}: score is derived; remove the hand-written value`)
      }
      if (decision.score !== undefined && decision.score !== expected) {
        warnings.push(`${label}: stored score ${decision.score} differs from computed ${expected}`)
      }
    }
    const verdict = decision.verdict
    if (!isPlainObject(verdict)) {
      errors.push(`${label}: included entry needs verdict { zh, en }`)
      continue
    }
    for (const lang of ['zh', 'en']) {
      const value = text(verdict[lang])
      if (!value) errors.push(`${label}: verdict.${lang} is empty`)
      const problem = lengthProblem(`${label}: verdict.${lang}`, value, VERDICT_LIMIT[lang])
      if (problem) errors.push(problem)
    }
  }

  if (included === 0) errors.push('curation: no included entries')
  if (included > 0 && included < 40) warnings.push(`curation: only ${included} included entries (expected ~45-52)`)
  if (adultCount > 1) warnings.push(`curation: ${adultCount} adult entries; expected only THEWOLFWALKER__dsh-coyote`)

  // ---- merge smoke test ----
  const { errors: mergeErrors, catalog } = mergeCatalog(snapshot, curation)
  errors.push(...mergeErrors)

  if (errors.length > 0) {
    console.error(`validate: ${errors.length} error(s)`)
    for (const error of errors) console.error(`  ✗ ${error}`)
    for (const warning of warnings) console.warn(`  ! ${warning}`)
    process.exit(1)
  }

  const scores = catalog.entries.filter((entry) => entry.include).map((entry) => entry.score)
  const average = scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1)
  console.log('validate: ok')
  console.log(`  audited ${catalog.counts.audited} · included ${catalog.counts.included} · excluded ${catalog.counts.excluded}`)
  console.log(`  abstract index ${Math.min(...scores)}–${Math.max(...scores)} · avg ${average.toFixed(1)}`)
  for (const warning of warnings) console.warn(`  ! ${warning}`)
}

main()
