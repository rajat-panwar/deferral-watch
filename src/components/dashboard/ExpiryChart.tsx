import { useMemo } from 'react'
import { bucketCounts } from '../../domain/selectors'
import type { BucketId, Defect } from '../../domain/types'

interface Props {
  defects: Defect[]
  now: number
  selected: BucketId | 'all'
  onSelect: (b: BucketId | 'all') => void
}

/**
 * Expiry-horizon chart. Each bar is a real <button> (keyboard + screen reader friendly)
 * that toggles the bucket filter; the same data is exposed as text via aria-labels.
 */
export function ExpiryChart({ defects, now, selected, onSelect }: Props) {
  const data = useMemo(() => bucketCounts(defects, now), [defects, now])
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <section className="card" aria-labelledby="chart-h">
      <h2 id="chart-h" className="card__title">Time to expiry</h2>
      <ul className="chart">
        {data.map((b) => (
          <li key={b.id}>
            <button
              className={`chart__bar chart__bar--${b.risk}`}
              aria-pressed={selected === b.id}
              aria-label={`${b.label}: ${b.count} defect${b.count === 1 ? '' : 's'}. ${selected === b.id ? 'Clear filter' : 'Filter table'}`}
              onClick={() => onSelect(selected === b.id ? 'all' : b.id)}
            >
              <span className="chart__count">{b.count}</span>
              <span className="chart__fill" style={{ height: `${(b.count / max) * 100}%` }} aria-hidden="true" />
              <span className="chart__label">{b.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
