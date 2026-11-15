import { Link } from 'react-router-dom'
import { msRemaining, riskLevel } from '../../domain/deadline'
import { groupByAircraft } from '../../domain/selectors'
import type { Defect, Filters } from '../../domain/types'
import { RiskBadge } from '../ui/RiskBadge'

const STATUS_LABEL: Record<Defect['status'], string> = {
  open: 'Open', assigned: 'Assigned', scheduled: 'Scheduled', 'extension-requested': 'Extension requested',
}

interface Props {
  defects: Defect[]
  now: number
  sort: Filters['sort']
  dir: Filters['dir']
  grouped: boolean
  onSort: (key: Filters['sort']) => void
}

function Row({ d, now }: { d: Defect; now: number }) {
  const ms = msRemaining(d, now)
  return (
    <tr>
      <td data-label="Risk"><RiskBadge risk={riskLevel(ms)} ms={ms} /></td>
      <th scope="row" data-label="Aircraft">
        <Link to={`/defects/${d.id}`}>{d.tail}</Link>
        <span className="muted"> {d.aircraftType}</span>
      </th>
      <td data-label="ATA">{d.ataChapter} · {d.system}</td>
      <td data-label="Defect" className="cell-desc">{d.description}</td>
      <td data-label="Cat">{d.category}</td>
      <td data-label="Status">{STATUS_LABEL[d.status]}</td>
    </tr>
  )
}

export function DefectTable({ defects, now, sort, dir, grouped, onSort }: Props) {
  const ariaSort = (k: Filters['sort']) => (sort === k ? (dir === 'asc' ? 'ascending' : 'descending') : undefined)
  const sortBtn = (k: Filters['sort'], label: string) => (
    <button className="th-btn" onClick={() => onSort(k)}>
      {label}
      <span aria-hidden="true">{sort === k ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}</span>
    </button>
  )

  return (
    <div className="table-wrap">
      <table className="table">
        <caption className="sr-only">Deferred defects, most urgent first by default</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort('remaining')}>{sortBtn('remaining', 'Risk')}</th>
            <th scope="col" aria-sort={ariaSort('tail')}>{sortBtn('tail', 'Aircraft')}</th>
            <th scope="col" aria-sort={ariaSort('ata')}>{sortBtn('ata', 'ATA / system')}</th>
            <th scope="col">Defect</th>
            <th scope="col" aria-sort={ariaSort('category')}>{sortBtn('category', 'Cat')}</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        {grouped ? (
          groupByAircraft(defects).map((g) => (
            <tbody key={g.tail}>
              <tr className="group-row">
                <th colSpan={6} scope="colgroup">
                  {g.tail} <span className="muted">{g.aircraftType} · {g.defects.length} deferral{g.defects.length === 1 ? '' : 's'}</span>
                </th>
              </tr>
              {g.defects.map((d) => <Row key={d.id} d={d} now={now} />)}
            </tbody>
          ))
        ) : (
          <tbody>{defects.map((d) => <Row key={d.id} d={d} now={now} />)}</tbody>
        )}
      </table>
    </div>
  )
}
