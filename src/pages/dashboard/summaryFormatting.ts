import type { DashboardSummary } from '../../api/dashboard'

const INTEGER_FORMATTER = new Intl.NumberFormat('en-US')

export function formatCount(value: number): string {
  return INTEGER_FORMATTER.format(value)
}

export function formatMetricLabel(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function sumCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, value) => sum + value, 0)
}

export function sortCountEntries<T extends object>(counts: T): Array<[string, number]> {
  return (Object.entries(counts) as Array<[string, unknown]>)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1]
      return a[0].localeCompare(b[0])
    })
}

export function getUsagePercent(tokens: DashboardSummary['tokens']): number | null {
  if (tokens.is_unlimited) return null
  if (!tokens.allocated_this_month || tokens.allocated_this_month <= 0) return 0
  return Math.min((tokens.used_this_month / tokens.allocated_this_month) * 100, 100)
}

export function getRunSuccessRate(runs: DashboardSummary['runs']): number {
  if (runs.requested <= 0) return 0
  return Math.round((runs.success / runs.requested) * 100)
}
