import { useId, useState, type FormEvent } from 'react'
import type { Defect, DefectAction } from '../../domain/types'
import { useDefectAction } from '../../hooks/useDefects'

type Mode = 'assign' | 'schedule' | 'request-extension'

const ASSIGNEES = ['A. Okafor (B1)', 'M. Lindqvist (B2)', 'R. Patel (B1)', 'S. Duarte (B2)']

/** One form at a time; submit runs an optimistic mutation and reports failure inline. */
export function ActionPanel({ defect }: { defect: Defect }) {
  const [mode, setMode] = useState<Mode | null>(null)
  const mutation = useDefectAction(defect.id)
  const uid = useId()

  const run = (action: DefectAction) => {
    mutation.mutate(action, { onSuccess: () => setMode(null) })
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (mode === 'assign') run({ type: 'assign', assignee: String(f.get('assignee')) })
    if (mode === 'schedule')
      run({ type: 'schedule', scheduledFor: new Date(String(f.get('when'))).toISOString(), station: String(f.get('station')).toUpperCase() })
    if (mode === 'request-extension') run({ type: 'request-extension', reason: String(f.get('reason')).trim() })
  }

  const choose = (m: Mode) => {
    mutation.reset()
    setMode(m)
  }

  return (
    <section className="card" aria-labelledby={`${uid}-h`}>
      <h2 id={`${uid}-h`} className="card__title">Actions</h2>
      <div className="btn-row">
        <button className="btn" aria-pressed={mode === 'assign'} onClick={() => choose('assign')}>Assign engineer</button>
        <button className="btn" aria-pressed={mode === 'schedule'} onClick={() => choose('schedule')}>Schedule rectification</button>
        <button className="btn" aria-pressed={mode === 'request-extension'} onClick={() => choose('request-extension')}>Request extension</button>
      </div>

      {mode && (
        <form className="action-form" onSubmit={submit} key={mode}>
          {mode === 'assign' && (
            <label className="field">
              <span>Engineer</span>
              <select name="assignee" required defaultValue={defect.assignee ?? ASSIGNEES[0]}>
                {ASSIGNEES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
          )}
          {mode === 'schedule' && (
            <>
              <label className="field">
                <span>Date &amp; time</span>
                <input name="when" type="datetime-local" required />
              </label>
              <label className="field">
                <span>Station</span>
                <input name="station" required maxLength={4} defaultValue={defect.station} />
              </label>
            </>
          )}
          {mode === 'request-extension' && (
            <label className="field field--grow">
              <span>Reason</span>
              <textarea name="reason" required minLength={5} rows={3} placeholder="e.g. Part on back-order until Thursday" />
            </label>
          )}
          <div className="btn-row">
            <button className="btn btn--primary" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Confirm'}
            </button>
            <button className="btn btn--link" type="button" onClick={() => setMode(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div aria-live="polite" role="status">
        {mutation.isError && (
          <p className="inline-error" role="alert">{mutation.error.message}</p>
        )}
        {mutation.isSuccess && !mode && <p className="inline-ok">Saved.</p>}
      </div>
    </section>
  )
}
