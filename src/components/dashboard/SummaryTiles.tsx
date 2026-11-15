import type { Summary } from '../../domain/selectors'

export function SummaryTiles({ summary }: { summary: Summary }) {
  const tiles = [
    { label: 'Open deferrals', value: summary.open, tone: 'neutral' },
    { label: 'Expired', value: summary.expired, tone: 'expired' },
    { label: 'Expiring < 48h', value: summary.critical, tone: 'critical' },
    { label: 'Aircraft at risk', value: summary.aircraftAtRisk, tone: 'warning' },
  ]
  return (
    <dl className="tiles">
      {tiles.map((t) => (
        <div key={t.label} className={`tile tile--${t.tone}`}>
          <dt>{t.label}</dt>
          <dd>{t.value}</dd>
        </div>
      ))}
    </dl>
  )
}
