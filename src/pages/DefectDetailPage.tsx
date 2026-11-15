import { Link, useParams } from 'react-router-dom'
import { ActionPanel } from '../components/detail/ActionPanel'
import { RiskBadge } from '../components/ui/RiskBadge'
import { ErrorState, Skeleton } from '../components/ui/States'
import { msRemaining, riskLevel } from '../domain/deadline'
import { useDefect, useDefects } from '../hooks/useDefects'
import { useNow } from '../hooks/useNow'

const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function DefectDetailPage() {
  const { id = '' } = useParams()
  const now = useNow()
  const { data: d, isPending, isError, error, refetch } = useDefect(id)
  const { data: all } = useDefects()

  if (isPending) return <Skeleton rows={4} label="Loading defect" />
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />

  const ms = msRemaining(d, now)
  const siblings = (all ?? []).filter((x) => x.tail === d.tail && x.id !== d.id)

  return (
    <article className="detail">
      <Link to=".." relative="path" onClick={(e) => { if (window.history.length > 1) { e.preventDefault(); window.history.back() } }}>
        ← Back to dashboard
      </Link>
      <header className="detail__head">
        <h1>{d.tail} <span className="muted">{d.aircraftType}</span></h1>
        <RiskBadge risk={riskLevel(ms)} ms={ms} />
      </header>
      <p className="detail__desc">{d.description}</p>

      <dl className="facts">
        <div><dt>Reference</dt><dd>{d.id}</dd></div>
        <div><dt>ATA</dt><dd>{d.ataChapter} · {d.system}</dd></div>
        <div><dt>MEL item</dt><dd>{d.melRef} (Cat {d.category})</dd></div>
        <div><dt>Deferred</dt><dd>{fmt(d.deferredAt)}</dd></div>
        <div><dt>Expires</dt><dd>{fmt(d.expiresAt)}</dd></div>
        <div><dt>Station</dt><dd>{d.station}</dd></div>
        <div><dt>Status</dt><dd>{d.status.replace('-', ' ')}</dd></div>
        {d.assignee && <div><dt>Assigned to</dt><dd>{d.assignee}</dd></div>}
        {d.scheduledFor && <div><dt>Scheduled</dt><dd>{fmt(d.scheduledFor)}</dd></div>}
      </dl>

      <ActionPanel defect={d} />

      <section className="card" aria-labelledby="hist-h">
        <h2 id="hist-h" className="card__title">Activity</h2>
        <ol className="timeline">
          {[...d.history].reverse().map((h, i) => (
            <li key={i}>
              <time dateTime={h.at}>{fmt(h.at)}</time> <strong>{h.by}</strong> — {h.text}
            </li>
          ))}
        </ol>
      </section>

      {siblings.length > 0 && (
        <section className="card" aria-labelledby="sib-h">
          <h2 id="sib-h" className="card__title">Other deferrals on {d.tail}</h2>
          <ul className="plain">
            {siblings.map((s) => (
              <li key={s.id}>
                <Link to={`/defects/${s.id}`}>{s.description}</Link>{' '}
                <RiskBadge risk={riskLevel(msRemaining(s, now))} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
