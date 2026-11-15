import type { Defect, DefectAction } from './types'

/**
 * Pure state transition shared by the fake API and the optimistic cache update,
 * so the UI and "server" can never disagree about what an action does.
 */
export function applyAction(defect: Defect, action: DefectAction, now: Date, by = 'You'): Defect {
  const at = now.toISOString()
  switch (action.type) {
    case 'assign':
      return {
        ...defect,
        status: 'assigned',
        assignee: action.assignee,
        history: [...defect.history, { at, by, text: `Assigned to ${action.assignee}` }],
      }
    case 'schedule':
      return {
        ...defect,
        status: 'scheduled',
        scheduledFor: action.scheduledFor,
        station: action.station,
        history: [
          ...defect.history,
          { at, by, text: `Rectification scheduled at ${action.station} for ${new Date(action.scheduledFor).toLocaleString()}` },
        ],
      }
    case 'request-extension':
      return {
        ...defect,
        status: 'extension-requested',
        history: [...defect.history, { at, by, text: `Extension requested: ${action.reason}` }],
      }
  }
}
