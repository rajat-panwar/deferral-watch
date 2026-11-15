import { applyAction } from '../domain/actions'
import type { Defect, DefectAction } from '../domain/types'
import { buildDefects } from './mockData'

/**
 * Simulated backend. Swapping in real fetch calls only requires changing this file.
 * Dev toggles (query string): ?fail=1 → list fails once per reload,
 * ?slow=1 → longer latency, ?empty=1 → empty dataset, ?mutfail=1 → every mutation fails.
 */
let db: Defect[] | null = null
let listShouldFail = false

const flag = (name: string) =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has(name)

const delay = (ms: number) => new Promise((r) => setTimeout(r, flag('slow') ? ms * 5 : ms))

export class ApiError extends Error {}

function store(): Defect[] {
  if (!db) db = flag('empty') ? [] : buildDefects()
  return db
}

export function resetApi(opts: { fail?: boolean } = {}) {
  db = null
  listShouldFail = opts.fail ?? flag('fail')
}
resetApi()

export async function fetchDefects(): Promise<Defect[]> {
  await delay(600)
  if (listShouldFail) {
    listShouldFail = false // first call fails, "Retry" succeeds
    throw new ApiError('Maintenance system unreachable (503)')
  }
  return structuredClone(store())
}

export async function fetchDefect(id: string): Promise<Defect> {
  await delay(300)
  const d = store().find((x) => x.id === id)
  if (!d) throw new ApiError(`Defect ${id} not found`)
  return structuredClone(d)
}

export async function performAction(id: string, action: DefectAction): Promise<Defect> {
  await delay(700)
  if (flag('mutfail')) throw new ApiError('Could not save change – please try again')
  const list = store()
  const idx = list.findIndex((x) => x.id === id)
  if (idx < 0) throw new ApiError(`Defect ${id} not found`)
  list[idx] = applyAction(list[idx], action, new Date())
  return structuredClone(list[idx])
}
