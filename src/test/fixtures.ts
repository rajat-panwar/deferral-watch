import { HOUR } from '../domain/deadline'
import type { Defect } from '../domain/types'

export const NOW = Date.UTC(2026, 0, 15, 12)

export function defect(over: Partial<Defect> & { hours: number }): Defect {
  const { hours, ...rest } = over
  return {
    id: 'DEF-1', tail: 'N100AA', aircraftType: 'A320', ataChapter: '21', system: 'Air conditioning',
    description: 'Pack valve slow', melRef: '21-51-01', category: 'B',
    deferredAt: new Date(NOW - 10 * HOUR).toISOString(), expiresAt: new Date(NOW + hours * HOUR).toISOString(),
    station: 'JFK', status: 'open', history: [], ...rest,
  }
}
