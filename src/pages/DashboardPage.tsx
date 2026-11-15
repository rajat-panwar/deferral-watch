import { useMemo } from 'react'
import { DefectTable } from '../components/dashboard/DefectTable'
import { ExpiryChart } from '../components/dashboard/ExpiryChart'
import { FilterBar } from '../components/dashboard/FilterBar'
import { SummaryTiles } from '../components/dashboard/SummaryTiles'
import { EmptyState, ErrorState, Skeleton } from '../components/ui/States'
import { filterDefects, sortDefects, summarize } from '../domain/selectors'
import type { Filters } from '../domain/types'
import { useDefectFilters } from '../hooks/useDefectFilters'
import { useDefects } from '../hooks/useDefects'
import { useNow } from '../hooks/useNow'

export function DashboardPage() {
  const now = useNow()
  const { data, isPending, isError, error, refetch } = useDefects()
  const { filters, update, reset, hasActiveFilters } = useDefectFilters()

  const summary = useMemo(() => summarize(data ?? [], now), [data, now])
  // Chart ignores the bucket filter itself so selecting a bar doesn't zero the other bars.
  const forChart = useMemo(
    () => filterDefects(data ?? [], { ...filters, bucket: 'all' }, now),
    [data, filters, now],
  )
  const visible = useMemo(
    () => sortDefects(filterDefects(data ?? [], filters, now), filters),
    [data, filters, now],
  )

  const onSort = (key: Filters['sort']) =>
    update(filters.sort === key ? { dir: filters.dir === 'asc' ? 'desc' : 'asc' } : { sort: key, dir: 'asc' })

  if (isPending) return <Skeleton label="Loading deferred defects" />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />
  if (data.length === 0)
    return <EmptyState title="No deferred defects">The fleet has no open MEL deferrals. Nothing to action.</EmptyState>

  return (
    <>
      <SummaryTiles summary={summary} />
      <ExpiryChart defects={forChart} now={now} selected={filters.bucket} onSelect={(bucket) => update({ bucket })} />
      <FilterBar filters={filters} update={update} reset={reset} hasActive={hasActiveFilters} resultCount={visible.length} />
      {visible.length === 0 ? (
        <EmptyState
          title="No defects match your filters"
          action={<button className="btn" onClick={reset}>Clear filters</button>}
        >
          Try a different search term or remove a filter.
        </EmptyState>
      ) : (
        <DefectTable defects={visible} now={now} sort={filters.sort} dir={filters.dir} grouped={filters.group} onSort={onSort} />
      )}
    </>
  )
}
