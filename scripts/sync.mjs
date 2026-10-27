#!/usr/bin/env node
/**
 * Regenerate `data/snapshot.json` from the upstream awesome list.
 *
 * The upstream repository is the single source of truth for facts (URL, name,
 * bilingual description, npm mapping, stars, added date). This index owns only
 * the editorial layer, so this script never writes into `curation.json`.
 *
 * Usage:
 *   npm run sync                          # reads ../liuwenji007-awesome-dsh-plugin
 *   npm run sync -- --upstream <dir>      # any checkout of the awesome list
 *   AWESOME_DSH_PLUGIN_DIR=<dir> npm run sync
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CATEGORY = 'fun'

function argValue(name) {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function upstreamDir() {
  const fromArg = argValue('--upstream')
  const fromEnv = process.env.AWESOME_DSH_PLUGIN_DIR
  return path.resolve(ROOT, fromArg || fromEnv || '../liuwenji007-awesome-dsh-plugin')
}

function git(upstream, args) {
  try {
    return execFileSync('git', ['-C', upstream, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function slugFor(file) {
  return path.basename(file, '.yml')
}

/**
 * Tolerant field reader for the rare upstream YAML file that does not parse
 * (one unquoted `": "` in a description is enough). Facts are still usable;
 * the entry is reported in `source.unparsed` so the upstream can fix it.
 */
function looseParse(text) {
  const doc = {}
  for (const line of text.split('\n')) {
    const top = /^([a-zA-Z][\w-]*):\s*(.*)$/.exec(line)
    if (top) {
      doc[top[1]] = top[2]
      continue
    }
    const nested = /^\s+(en|zh):\s*(.*)$/.exec(line)
    if (nested) {
      doc.description = doc.description || {}
      doc.description[nested[1]] = nested[2]
    }
  }
  return doc
}

function githubParts(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.hostname !== 'github.com') return null
  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length < 2) return null
  const owner = segments[0]
  const repoName = segments[1]
  const treeAt = segments.indexOf('tree')
  const repoPath = treeAt === -1 ? null : segments.slice(treeAt + 2).join('/')
  return { owner, repoName, repo: `https://github.com/${owner}/${repoName}`, repoPath: repoPath || null }
}

function normalizeDate(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim())
  return match ? match[1] : null
}

function normalizeNpm(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.npm !== 'string' || raw.npm.trim() === '') return null
  return {
    name: raw.npm.trim(),
    version: typeof raw.version === 'string' && raw.version.trim() !== '' ? raw.version.trim() : null,
  }
}

/**
 * js-yaml is a dev dependency of this repository, but a contributor running
 * `sync` from a bare checkout often has a copy inside the upstream checkout
 * instead. Try both before failing.
 */
function loadYaml(upstream) {
  const require = createRequire(import.meta.url)
  const candidates = [
    'js-yaml',
    path.join(upstream, 'node_modules', 'js-yaml'),
    path.join(process.cwd(), 'node_modules', 'js-yaml'),
  ]
  for (const candidate of candidates) {
    try {
      return require(candidate)
    } catch {
      /* next candidate */
    }
  }
  return null
}

async function main() {
  const upstream = upstreamDir()
  const yaml = loadYaml(upstream)
  if (!yaml) {
    console.error('sync: js-yaml is missing. Run `npm install` in this repository first.')
    process.exit(1)
  }
  const pluginsDir = path.join(upstream, 'data', 'plugins')
  if (!fs.existsSync(pluginsDir)) {
    console.error(`sync: ${pluginsDir} does not exist.\nPass --upstream <awesome-list checkout> or set AWESOME_DSH_PLUGIN_DIR.`)
    process.exit(1)
  }

  const npmMap = readJson(path.join(upstream, 'data', 'npm-map.json'), {})
  const stars = readJson(path.join(upstream, 'data', 'stars.json'), {})
  const addedDates = readJson(path.join(upstream, 'data', 'added-dates.json'), {})

  const entries = []
  const unparsed = []
  const files = fs.readdirSync(pluginsDir).filter((file) => file.endsWith('.yml')).sort()

  for (const file of files) {
    const text = fs.readFileSync(path.join(pluginsDir, file), 'utf8')
    let doc
    let fellBack = false
    try {
      doc = yaml.load(text)
    } catch (error) {
      doc = looseParse(text)
      fellBack = true
    }
    if (!doc || doc.category !== CATEGORY) continue

    const slug = slugFor(file)
    const parts = githubParts(String(doc.url || ''))
    if (!parts) {
      unparsed.push({ file, reason: 'not a github.com URL' })
      continue
    }
    if (fellBack) unparsed.push({ file, reason: 'yaml did not parse; loose field reader used' })

    const npm = normalizeNpm(npmMap[doc.url])
    const starRecord = stars[doc.url]
    const description = doc.description && typeof doc.description === 'object' ? doc.description : {}
    entries.push({
      slug,
      name: String(doc.name || `${parts.owner}/${parts.repoName}`),
      owner: parts.owner,
      repo: parts.repo,
      repoPath: parts.repoPath,
      url: String(doc.url),
      category: CATEGORY,
      description: {
        en: String(description.en || description.zh || '').trim(),
        zh: String(description.zh || description.en || '').trim(),
      },
      npm,
      stars: starRecord && typeof starRecord.stars === 'number' ? starRecord.stars : null,
      addedAt: normalizeDate(addedDates[doc.url]),
    })
  }

  const snapshot = {
    generatedAt: new Date().toISOString(),
    upstream: {
      name: 'awesome-dsh-plugin',
      repo: 'https://github.com/awesome-dsh-plugin/awesome-dsh-plugin',
      commit: git(upstream, ['rev-parse', 'HEAD']),
      commitShort: git(upstream, ['rev-parse', '--short', 'HEAD']),
      commitDate: git(upstream, ['log', '-1', '--format=%cI']),
      category: CATEGORY,
    },
    source: {
      pluginsDir: 'data/plugins/*.yml',
      scanned: files.length,
      category: CATEGORY,
      unparsed,
    },
    entries,
  }

  const target = path.join(ROOT, 'data', 'snapshot.json')
  fs.writeFileSync(target, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  const withNpm = entries.filter((entry) => entry.npm).length
  const withStars = entries.filter((entry) => entry.stars !== null).length
  console.log(`sync: wrote ${path.relative(ROOT, target)}`)
  console.log(`  upstream ${snapshot.upstream.commitShort ?? '(not a git checkout)'} · ${entries.length} ${CATEGORY} entries`)
  console.log(`  npm mapped ${withNpm}/${entries.length} · stars ${withStars}/${entries.length}`)
  if (unparsed.length > 0) console.log(`  warnings ${unparsed.length} (see source.unparsed)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
