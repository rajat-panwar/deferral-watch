/** MEL category: how long an item may stay deferred (A = per-item limit). */
export type Category = 'A' | 'B' | 'C' | 'D'
export type DefectStatus = 'open' | 'assigned' | 'scheduled' | 'extension-requested'
export type Risk = 'expired' | 'critical' | 'warning' | 'ok'

export interface HistoryEntry {
  at: string
  by: string
  text: string
}

export interface Defect {
  id: string
  tail: string
  aircraftType: string
  ataChapter: string
  system: string
  description: string
  melRef: string
  category: Category
  deferredAt: string
  expiresAt: string
  station: string
  status: DefectStatus
  assignee?: string
  scheduledFor?: string
  history: HistoryEntry[]
}

export type DefectAction =
  | { type: 'assign'; assignee: string }
  | { type: 'schedule'; scheduledFor: string; station: string }
  | { type: 'request-extension'; reason: string }

export type SortKey = 'remaining' | 'tail' | 'category' | 'ata'
export type BucketId = 'expired' | 'lt24h' | 'd1to3' | 'd3to7' | 'd7to14' | 'gt14d'

export interface Filters {
  q: string
  status: DefectStatus | 'all'
  category: Category | 'all'
  risk: Risk | 'all'
  bucket: BucketId | 'all'
  sort: SortKey
  dir: 'asc' | 'desc'
  group: boolean
}
