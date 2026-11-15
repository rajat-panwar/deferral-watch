import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DEFAULT_FILTERS } from '../domain/selectors'
import type { Filters } from '../domain/types'

const KEYS = Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]

/** Filters live in the URL: shareable, survives refresh, back button restores them. */
export function useDefectFilters() {
  const [params, setParams] = useSearchParams()

  const filters = useMemo<Filters>(() => {
    const f: Record<string, unknown> = { ...DEFAULT_FILTERS }
    for (const k of KEYS) {
      const v = params.get(k)
      if (v === null) continue
      f[k] = k === 'group' ? v === '1' : v
    }
    return f as unknown as Filters
  }, [params])

  const update = useCallback(
    (patch: Partial<Filters>) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            const value = typeof v === 'boolean' ? (v ? '1' : '') : String(v)
            if (!value || value === String(DEFAULT_FILTERS[k as keyof Filters])) next.delete(k)
            else next.set(k, value)
          }
          return next
        },
        { replace: true },
      ),
    [setParams],
  )

  const reset = useCallback(
    () =>
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        KEYS.forEach((k) => next.delete(k))
        return next
      }),
    [setParams],
  )

  const active = KEYS.some((k) => k !== 'sort' && k !== 'dir' && k !== 'group' && filters[k] !== DEFAULT_FILTERS[k])
  return { filters, update, reset, hasActiveFilters: active }
}
