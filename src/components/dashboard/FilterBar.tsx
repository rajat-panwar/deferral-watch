import type { Filters } from '../../domain/types'

interface Props {
  filters: Filters
  update: (p: Partial<Filters>) => void
  reset: () => void
  hasActive: boolean
  resultCount: number
}

export function FilterBar({ filters, update, reset, hasActive, resultCount }: Props) {
  return (
    <form className="filters" role="search" aria-label="Filter deferrals" onSubmit={(e) => e.preventDefault()}>
      <label className="field field--grow">
        <span>Search</span>
        <input
          type="search"
          value={filters.q}
          placeholder="Tail, ATA, system, description…"
          onChange={(e) => update({ q: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Status</span>
        <select value={filters.status} onChange={(e) => update({ status: e.target.value as Filters['status'] })}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="scheduled">Scheduled</option>
          <option value="extension-requested">Extension requested</option>
        </select>
      </label>
      <label className="field">
        <span>MEL category</span>
        <select value={filters.category} onChange={(e) => update({ category: e.target.value as Filters['category'] })}>
          <option value="all">All</option>
          {['A', 'B', 'C', 'D'].map((c) => <option key={c} value={c}>Cat {c}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Risk</span>
        <select value={filters.risk} onChange={(e) => update({ risk: e.target.value as Filters['risk'] })}>
          <option value="all">All</option>
          <option value="expired">Expired</option>
          <option value="critical">Critical (&lt;48h)</option>
          <option value="warning">Warning (&lt;7d)</option>
          <option value="ok">OK</option>
        </select>
      </label>
      <label className="field">
        <span>Sort by</span>
        <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}>
          <option value="remaining">Time remaining</option>
          <option value="tail">Tail number</option>
          <option value="category">MEL category</option>
          <option value="ata">ATA chapter</option>
        </select>
      </label>
      <label className="check">
        <input type="checkbox" checked={filters.group} onChange={(e) => update({ group: e.target.checked })} />
        Group by aircraft
      </label>
      <div className="filters__meta">
        <span aria-live="polite" role="status">{resultCount} {resultCount === 1 ? 'result' : 'results'}</span>
        {(hasActive) && (
          <button type="button" className="btn btn--link" onClick={reset}>Clear filters</button>
        )}
      </div>
    </form>
  )
}
