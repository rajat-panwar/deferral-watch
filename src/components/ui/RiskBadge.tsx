import { formatRemaining } from '../../domain/deadline'
import type { Risk } from '../../domain/types'

const LABEL: Record<Risk, string> = { expired: 'Expired', critical: 'Critical', warning: 'Warning', ok: 'OK' }
const ICON: Record<Risk, string> = { expired: '✕', critical: '▲', warning: '◆', ok: '●' }

/** Risk is conveyed by icon + text + colour, never colour alone. */
export function RiskBadge({ risk, ms }: { risk: Risk; ms?: number }) {
  return (
    <span className={`badge badge--${risk}`}>
      <span aria-hidden="true">{ICON[risk]}</span>
      <span>{LABEL[risk]}</span>
      {ms !== undefined && <span className="badge__time">{formatRemaining(ms)}</span>}
    </span>
  )
}
