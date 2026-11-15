import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDefect, fetchDefects, performAction } from '../api/client'
import { applyAction } from '../domain/actions'
import type { Defect, DefectAction } from '../domain/types'

export const keys = {
  all: ['defects'] as const,
  one: (id: string) => ['defects', id] as const,
}

export const useDefects = () => useQuery({ queryKey: keys.all, queryFn: fetchDefects })

export const useDefect = (id: string) => useQuery({ queryKey: keys.one(id), queryFn: () => fetchDefect(id) })

/**
 * Optimistic update: patch both the list and the detail cache immediately,
 * roll back on error, and reconcile with the server on settle.
 */
export function useDefectAction(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (action: DefectAction) => performAction(id, action),
    onMutate: async (action) => {
      await qc.cancelQueries({ queryKey: keys.all })
      const prevList = qc.getQueryData<Defect[]>(keys.all)
      const prevOne = qc.getQueryData<Defect>(keys.one(id))
      const now = new Date()
      qc.setQueryData<Defect[]>(keys.all, (l) => l?.map((d) => (d.id === id ? applyAction(d, action, now) : d)))
      qc.setQueryData<Defect>(keys.one(id), (d) => (d ? applyAction(d, action, now) : d))
      return { prevList, prevOne }
    },
    onError: (_e, _a, ctx) => {
      qc.setQueryData(keys.all, ctx?.prevList)
      qc.setQueryData(keys.one(id), ctx?.prevOne)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: keys.all }),
  })
}
