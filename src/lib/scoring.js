import data from '../data/roles.json'

export const { roles: RAW_ROLES, globalAdvice: GLOBAL_ADVICE, projectName: PROJECT_NAME } = data

export const STORAGE_KEY = 'ngo_scores_v1'

export function emptyScore() {
  return { name: '', evaluator: '', gen: 0, adeq: 0, reg: 0, notes: '' }
}

function clampNumber(value, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(Math.max(n, 0), max)
}

export function flattenRoles(roles = RAW_ROLES) {
  const flat = []
  roles.forEach((role) => {
    for (let i = 0; i < role.count; i += 1) {
      let displayName
      let duration
      let sidebarMeta
      if (role.id === 'K-2') {
        // K-2 special case, preserved from the original tool:
        // the first slot is the 18-month Lead, the second is 6-month only.
        if (i === 0) {
          displayName = `Lead ${role.title}`
          duration = 'Phase I & II (18 Months)'
          sidebarMeta = '(Phase I & II) 18 Mo'
        } else {
          displayName = `${role.title}`
          duration = 'Phase I Only (6 Months)'
          sidebarMeta = '(Phase I) 6 Mo'
        }
      } else {
        displayName = role.count > 1 ? `${role.title} #${i + 1}` : role.title
        duration = role.baseDuration
        sidebarMeta = role.sidebarMeta
      }
      flat.push({
        ...role,
        uniqueKey: `${role.id}-${i}`,
        displayName,
        duration,
        sidebarMeta,
        indexInRole: i,
      })
    }
  })
  return flat
}

export function normalizeScore(raw, role) {
  const base = emptyScore()
  if (!raw || typeof raw !== 'object') return base
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    evaluator: typeof raw.evaluator === 'string' ? raw.evaluator : '',
    gen: clampNumber(raw.gen, role.breakdown.gen),
    adeq: clampNumber(raw.adeq, role.breakdown.adeq),
    reg: clampNumber(raw.reg, role.breakdown.reg),
    notes: typeof raw.notes === 'string' ? raw.notes : '',
  }
}

/** Parse one stored JSON string. Corrupt or wrong-shaped input yields {}. */
export function parseSavedScores(rawText, flattened) {
  if (!rawText) return {}
  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return {}
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  const byKey = new Map(flattened.map((item) => [item.uniqueKey, item]))
  const scores = {}
  for (const [key, value] of Object.entries(parsed)) {
    const role = byKey.get(key)
    if (role) scores[key] = normalizeScore(value, role)
  }
  return scores
}

export function loadScores(storage, flattened) {
  return parseSavedScores(storage.getItem(STORAGE_KEY), flattened)
}

export function saveScores(storage, scores) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // Storage full or unavailable (private mode): scores stay in memory
    // for the session rather than crashing the app.
  }
}

export function getScoreData(scores, key, role) {
  return scores[key] ? normalizeScore(scores[key], role) : emptyScore()
}

export function round1(value) {
  return Math.round(value * 10) / 10
}

export function calculateTotal(score) {
  return round1(Number(score.gen) + Number(score.adeq) + Number(score.reg))
}

export function formatTotal(value) {
  return round1(Number(value) || 0).toFixed(1)
}

export function calculateGrandTotal(scores, flattened) {
  let total = 0
  flattened.forEach((item) => {
    total += calculateTotal(getScoreData(scores, item.uniqueKey, item))
  })
  return round1(total)
}

export function grandMaxPoints(flattened) {
  return flattened.reduce((sum, item) => sum + item.maxPoints, 0)
}

/** Validate imported JSON text and return normalized scores, or throw. */
export function parseImportedScores(rawText, flattened) {
  let parsed
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error('Import file is not valid JSON.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Import file must contain a JSON object keyed by slot (for example "K-1-0").')
  }
  const scores = parseSavedScores(rawText, flattened)
  if (Object.keys(scores).length === 0) {
    throw new Error('Import file contains no scores for known evaluation slots.')
  }
  return scores
}

function csvCell(value) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function buildCsvExport(scores, flattened, dateText) {
  const header = [
    'Role ID',
    'Slot',
    'Duration',
    'Candidate Name',
    'Evaluator',
    'General Qualifications',
    'Adequacy for Assignment',
    'Regional Experience',
    'Total',
    'Max Points',
    'Notes',
  ]
  const lines = [header.map(csvCell).join(',')]
  flattened.forEach((item) => {
    const score = getScoreData(scores, item.uniqueKey, item)
    lines.push(
      [
        item.id,
        item.displayName,
        item.duration,
        score.name,
        score.evaluator,
        score.gen,
        score.adeq,
        score.reg,
        calculateTotal(score).toFixed(1),
        item.maxPoints,
        score.notes,
      ]
        .map(csvCell)
        .join(','),
    )
  })
  lines.push('')
  lines.push(
    [
      '',
      'Grand Total',
      '',
      '',
      '',
      '',
      '',
      '',
      calculateGrandTotal(scores, flattened).toFixed(1),
      grandMaxPoints(flattened),
      `Exported ${dateText}`,
    ]
      .map(csvCell)
      .join(','),
  )
  return `${lines.join('\r\n')}\r\n`
}

export function downloadTextFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
