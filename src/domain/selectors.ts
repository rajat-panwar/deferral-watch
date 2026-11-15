import { bucketOf, BUCKETS, msRemaining, riskLevel } from './deadline'
import type { BucketId, Defect, Filters, Risk } from './types'

export const DEFAULT_FILTERS: Filters = {
  q: '',
  status: 'all',
  category: 'all',
  risk: 'all',
  bucket: 'all',
  sort: 'remaining',
  dir: 'asc',
  group: false,
}

export function filterDefects(defects: Defect[], f: Filters, now: number): Defect[] {
  const q = f.q.trim().toLowerCase()
  return defects.filter((d) => {
    if (f.status !== 'all' && d.status !== f.status) return false
    if (f.category !== 'all' && d.category !== f.category) return false
    const ms = msRemaining(d, now)
    if (f.risk !== 'all' && riskLevel(ms) !== f.risk) return false
    if (f.bucket !== 'all' && bucketOf(ms) !== f.bucket) return false
    if (q) {
      const hay = `${d.tail} ${d.ataChapter} ${d.system} ${d.description} ${d.melRef}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function sortDefects(defects: Defect[], f: Pick<Filters, 'sort' | 'dir'>): Defect[] {
  const sign = f.dir === 'asc' ? 1 : -1
  const cmp = (a: Defect, b: Defect): number => {
    switch (f.sort) {
      case 'tail':
        return a.tail.localeCompare(b.tail)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'ata':
        return a.ataChapter.localeCompare(b.ataChapter, undefined, { numeric: true })
      default:
        return a.expiresAt.localeCompare(b.expiresAt)
    }
  }
  // Slice: never mutate cached query data.
  return defects.slice().sort((a, b) => sign * cmp(a, b) || a.expiresAt.localeCompare(b.expiresAt))
}

export interface AircraftGroup {
  tail: string
  aircraftType: string
  defects: Defect[]
}

/** Groups keep the incoming order; groups are ordered by their most urgent defect. */
export function groupByAircraft(defects: Defect[]): AircraftGroup[] {
  const map = new Map<string, AircraftGroup>()
  for (const d of defects) {
    const g = map.get(d.tail) ?? { tail: d.tail, aircraftType: d.aircraftType, defects: [] }
    g.defects.push(d)
    map.set(d.tail, g)
  }
  return [...map.values()]
}

export interface Summary {
  open: number
  expired: number
  critical: number
  aircraftAtRisk: number
}

/** "At risk" = aircraft with at least one defect that is expired or expires within 48h. */
export function summarize(defects: Defect[], now: number): Summary {
  const atRisk = new Set<string>()
  let expired = 0
  let critical = 0
  for (const d of defects) {
    const risk = riskLevel(msRemaining(d, now))
    if (risk === 'expired') expired++
    if (risk === 'critical') critical++
    if (risk === 'expired' || risk === 'critical') atRisk.add(d.tail)
  }
  return { open: defects.length, expired, critical, aircraftAtRisk: atRisk.size }
}

export function bucketCounts(defects: Defect[], now: number): { id: BucketId; label: string; count: number; risk: Risk }[] {
  const counts = new Map<BucketId, number>()
  for (const d of defects) {
    const id = bucketOf(msRemaining(d, now))
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  const riskFor: Record<BucketId, Risk> = {
    expired: 'expired', lt24h: 'critical', d1to3: 'critical', d3to7: 'warning', d7to14: 'ok', gt14d: 'ok',
  }
  return BUCKETS.map((b) => ({ ...b, count: counts.get(b.id) ?? 0, risk: riskFor[b.id] }))
}
