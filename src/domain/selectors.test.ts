import { defect, NOW } from '../test/fixtures'
import { DEFAULT_FILTERS, filterDefects, groupByAircraft, sortDefects, summarize } from './selectors'

const data = [
  defect({ id: 'a', tail: 'N1', hours: 100, description: 'Galley oven' }),
  defect({ id: 'b', tail: 'N2', hours: -2, category: 'C' }),
  defect({ id: 'c', tail: 'N1', hours: 10, status: 'assigned' }),
]

describe('selectors', () => {
  it('filters by search, status, category, risk', () => {
    expect(filterDefects(data, { ...DEFAULT_FILTERS, q: 'oven' }, NOW).map((d) => d.id)).toEqual(['a'])
    expect(filterDefects(data, { ...DEFAULT_FILTERS, status: 'assigned' }, NOW).map((d) => d.id)).toEqual(['c'])
    expect(filterDefects(data, { ...DEFAULT_FILTERS, category: 'C' }, NOW).map((d) => d.id)).toEqual(['b'])
    expect(filterDefects(data, { ...DEFAULT_FILTERS, risk: 'expired' }, NOW).map((d) => d.id)).toEqual(['b'])
  })

  it('sorts by time remaining without mutating input', () => {
    const copy = [...data]
    expect(sortDefects(data, DEFAULT_FILTERS).map((d) => d.id)).toEqual(['b', 'c', 'a'])
    expect(sortDefects(data, { sort: 'remaining', dir: 'desc' }).map((d) => d.id)).toEqual(['a', 'c', 'b'])
    expect(data).toEqual(copy)
  })

  it('groups by aircraft', () => {
    const g = groupByAircraft(sortDefects(data, DEFAULT_FILTERS))
    expect(g.map((x) => [x.tail, x.defects.length])).toEqual([['N2', 1], ['N1', 2]])
  })

  it('summarizes and counts aircraft at risk once', () => {
    expect(summarize(data, NOW)).toEqual({ open: 3, expired: 1, critical: 1, aircraftAtRisk: 2 })
  })
})
