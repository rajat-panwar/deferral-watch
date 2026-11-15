import type { BucketId, Defect, Risk } from './types'

export const HOUR = 3_600_000
export const DAY = 24 * HOUR

export function msRemaining(d: Pick<Defect, 'expiresAt'>, now: number): number {
  return new Date(d.expiresAt).getTime() - now
}

/** Risk thresholds: expired < 0, critical < 48h, warning < 7d. */
export function riskLevel(ms: number): Risk {
  if (ms < 0) return 'expired'
  if (ms < 48 * HOUR) return 'critical'
  if (ms < 7 * DAY) return 'warning'
  return 'ok'
}

export const BUCKETS: { id: BucketId; label: string }[] = [
  { id: 'expired', label: 'Expired' },
  { id: 'lt24h', label: '< 24h' },
  { id: 'd1to3', label: '1–3 d' },
  { id: 'd3to7', label: '3–7 d' },
  { id: 'd7to14', label: '7–14 d' },
  { id: 'gt14d', label: '14 d +' },
]

export function bucketOf(ms: number): BucketId {
  if (ms < 0) return 'expired'
  if (ms < DAY) return 'lt24h'
  if (ms < 3 * DAY) return 'd1to3'
  if (ms < 7 * DAY) return 'd3to7'
  if (ms < 14 * DAY) return 'd7to14'
  return 'gt14d'
}

export function formatRemaining(ms: number): string {
  const abs = Math.abs(ms)
  const days = Math.floor(abs / DAY)
  const hours = Math.floor((abs % DAY) / HOUR)
  const mins = Math.floor((abs % HOUR) / 60_000)
  const text = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  return ms < 0 ? `Expired ${text} ago` : `${text} left`
}
