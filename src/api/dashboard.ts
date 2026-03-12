import { getApiBase, getBaseHeaders } from './config'

export class DashboardApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'DashboardApiError'
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text()
  if (!text) return `${res.status} ${res.statusText}`
  try {
    const json = JSON.parse(text) as { detail?: string; message?: string }
    return json.detail ?? json.message ?? text
  } catch {
    return text
  }
}

export type DashboardAgentTotals = Record<string, number>
export type DashboardStatusCounts = Record<string, number>
export type DashboardIntegrationCounts = Record<string, number>

export interface DashboardTokensSummary {
  used_total: number
  prompt_total: number
  completion_total: number
  used_this_month: number
  allocated_this_month: number | null
  remaining_this_month: number
  is_unlimited: boolean
  by_agent: DashboardAgentTotals
}

export interface DashboardRunsSummary {
  requested: number
  success: number
  completed: number
  failed: number
  in_progress: number
}

export interface DashboardSummary {
  tokens: DashboardTokensSummary
  runs: DashboardRunsSummary
  agentStages: Record<string, DashboardStatusCounts>
  actions: {
    extracted: number
    normalized: number
    executed: number
  }
  integrationsFound: DashboardIntegrationCounts
  integrationsConnected: DashboardIntegrationCounts
}

export async function getDashboardSummary(accessToken: string): Promise<DashboardSummary> {
  const base = getApiBase()
  const res = await fetch(`${base}/dashboard/summary`, {
    method: 'GET',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new DashboardApiError(res.status, await readErrorMessage(res))
  }

  return res.json() as Promise<DashboardSummary>
}
