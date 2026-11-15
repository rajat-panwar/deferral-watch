import { bucketOf, DAY, formatRemaining, HOUR, riskLevel } from './deadline'

describe('riskLevel', () => {
  it.each([
    [-1, 'expired'],
    [0, 'critical'],
    [48 * HOUR - 1, 'critical'],
    [48 * HOUR, 'warning'],
    [7 * DAY - 1, 'warning'],
    [7 * DAY, 'ok'],
  ] as const)('%d ms -> %s', (ms, risk) => expect(riskLevel(ms)).toBe(risk))
})

describe('bucketOf', () => {
  it('places boundaries in the later bucket', () => {
    expect(bucketOf(-1)).toBe('expired')
    expect(bucketOf(DAY - 1)).toBe('lt24h')
    expect(bucketOf(DAY)).toBe('d1to3')
    expect(bucketOf(14 * DAY)).toBe('gt14d')
  })
})

describe('formatRemaining', () => {
  it('formats future and past', () => {
    expect(formatRemaining(26 * HOUR)).toBe('1d 2h left')
    expect(formatRemaining(-90 * 60_000)).toBe('Expired 1h 30m ago')
  })
})
