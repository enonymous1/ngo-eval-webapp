import { describe, expect, it } from 'vitest'
import {
  RAW_ROLES,
  buildCsvExport,
  calculateGrandTotal,
  calculateTotal,
  flattenRoles,
  getScoreData,
  grandMaxPoints,
  loadScores,
  normalizeScore,
  parseImportedScores,
  parseSavedScores,
} from './scoring'

describe('role data', () => {
  it('has seven roles whose breakdowns sum to their max points', () => {
    expect(RAW_ROLES).toHaveLength(7)
    for (const role of RAW_ROLES) {
      const sum = role.breakdown.gen + role.breakdown.adeq + role.breakdown.reg
      expect(sum).toBeCloseTo(role.maxPoints, 9)
      expect(role.guide.keywords.length).toBeGreaterThan(0)
      expect(role.torData.length).toBeGreaterThan(0)
    }
  })

  it('flattens to ten slots totalling 60 points', () => {
    const flat = flattenRoles()
    expect(flat).toHaveLength(10)
    expect(grandMaxPoints(flat)).toBe(60)
    expect(flat.map((item) => item.uniqueKey)).toEqual([
      'K-1-0',
      'K-2-0',
      'K-2-1',
      'K-3-0',
      'K-3-1',
      'K-3-2',
      'K-4-0',
      'K-5-0',
      'K-6-0',
      'K-7-0',
    ])
  })

  it('keeps the K-2 lead/second-slot special case and numbers K-3 slots', () => {
    const flat = flattenRoles()
    expect(flat[1].displayName).toBe('Lead Program Process Optimization Expert')
    expect(flat[1].duration).toBe('Phase I & II (18 Months)')
    expect(flat[2].displayName).toBe('Program Process Optimization Expert')
    expect(flat[2].duration).toBe('Phase I Only (6 Months)')
    expect(flat[3].displayName).toBe('Business Analyst #1')
    expect(flat[5].displayName).toBe('Business Analyst #3')
  })
})

describe('scoring', () => {
  it('totals and grand-totals to one decimal without float drift', () => {
    expect(calculateTotal({ gen: 0.1, adeq: 0.2, reg: 0 })).toBe(0.3)
    const flat = flattenRoles()
    const scores = {
      'K-1-0': { name: 'A', evaluator: 'E', gen: 2, adeq: 7, reg: 1, notes: '' },
      'K-2-0': { name: 'B', evaluator: 'E', gen: 1.2, adeq: 4.2, reg: 0.6, notes: '' },
    }
    expect(calculateGrandTotal(scores, flat)).toBe(16)
  })

  it('clamps scores to each criterion max and coerces bad values to zero', () => {
    const role = flattenRoles()[0] // K-1: gen max 2, adeq max 7, reg max 1
    expect(normalizeScore({ gen: 99, adeq: -1, reg: 'oops', name: 42 }, role)).toEqual({
      name: '',
      evaluator: '',
      gen: 2,
      adeq: 0,
      reg: 0,
      notes: '',
    })
    expect(normalizeScore({ gen: '1.5' }, role).gen).toBe(1.5)
  })

  it('returns an empty score for unknown slots', () => {
    const role = flattenRoles()[0]
    expect(getScoreData({}, 'K-1-0', role)).toEqual({
      name: '',
      evaluator: '',
      gen: 0,
      adeq: 0,
      reg: 0,
      notes: '',
    })
  })
})

describe('storage', () => {
  function memoryStorage(entries = {}) {
    const store = new Map(Object.entries(entries))
    return {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    }
  }

  it('returns {} for corrupt, empty, or wrong-shaped saved data', () => {
    const flat = flattenRoles()
    expect(parseSavedScores('not json{', flat)).toEqual({})
    expect(parseSavedScores('', flat)).toEqual({})
    expect(parseSavedScores('[1,2]', flat)).toEqual({})
    expect(parseSavedScores('null', flat)).toEqual({})
  })

  it('drops unknown slot keys and normalizes kept scores', () => {
    const flat = flattenRoles()
    const parsed = parseSavedScores(
      JSON.stringify({ 'K-1-0': { gen: 99, name: 'A' }, 'K-9-0': { gen: 1 } }),
      flat,
    )
    expect(Object.keys(parsed)).toEqual(['K-1-0'])
    expect(parsed['K-1-0'].gen).toBe(2)
  })

  it('loads scores from the versioned key', () => {
    const flat = flattenRoles()
    const storage = memoryStorage({
      ngo_scores_v1: JSON.stringify({ 'K-1-0': { gen: 1, adeq: 2, reg: 0.5 } }),
    })
    expect(loadScores(storage, flat)['K-1-0'].gen).toBe(1)
  })

  it('ignores scores stored under unrelated keys', () => {
    const flat = flattenRoles()
    const storage = memoryStorage({
      other_app_scores: JSON.stringify({ 'K-1-0': { gen: 2 } }),
    })
    expect(loadScores(storage, flat)).toEqual({})
  })
})

describe('import and CSV export', () => {
  it('rejects invalid, wrong-shaped, and empty imports', () => {
    const flat = flattenRoles()
    expect(() => parseImportedScores('nope', flat)).toThrow('not valid JSON')
    expect(() => parseImportedScores('[]', flat)).toThrow('JSON object')
    expect(() => parseImportedScores('{"K-9-0":{"gen":1}}', flat)).toThrow('no scores')
  })

  it('accepts a valid import and normalizes it', () => {
    const flat = flattenRoles()
    const imported = parseImportedScores('{"K-1-0":{"gen":99,"name":"A"}}', flat)
    expect(imported['K-1-0'].gen).toBe(2)
    expect(imported['K-1-0'].name).toBe('A')
  })

  it('escapes commas, quotes, and newlines in CSV output', () => {
    const flat = flattenRoles()
    const csv = buildCsvExport(
      {
        'K-1-0': {
          name: 'Doe, Jane "J"',
          evaluator: 'E',
          gen: 2,
          adeq: 7,
          reg: 1,
          notes: 'line one\nline two',
        },
      },
      flat,
      '2026-05-28',
    )
    expect(csv).toContain('"Doe, Jane ""J"""')
    expect(csv).toContain('"line one\nline two"')
    expect(csv).toContain('Grand Total')
    expect(csv.split('\r\n')).toHaveLength(14) // header + 10 slots + blank + grand total + trailing empty
  })
})
