import { getApiBase, getBaseHeaders } from './config'

export interface SlackStatus {
  connected: boolean
  workspace: string | null
  slack_user_id: string | null
}

export class SlackApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'SlackApiError'
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data.detail ?? data.message ?? res.statusText
  } catch {
    return res.statusText
  }
}

export async function getSlackConnectUrl(accessToken: string): Promise<string> {
  const base = getApiBase()
  const res = await fetch(`${base}/slack/connect`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new SlackApiError(res.status, await readErrorMessage(res))
  const data = await res.json()
  return data.url as string
}

export async function getSlackStatus(accessToken: string): Promise<SlackStatus> {
  const base = getApiBase()
  const res = await fetch(`${base}/slack/status`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new SlackApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<SlackStatus>
}

export async function disconnectSlack(accessToken: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/slack/disconnect`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new SlackApiError(res.status, await readErrorMessage(res))
}
