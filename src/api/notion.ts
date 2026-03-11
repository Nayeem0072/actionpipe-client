import { getApiBase, getBaseHeaders } from './config'

export interface NotionStatus {
  connected: boolean
  workspace_name: string | null
  workspace_id: string | null
}

export class NotionApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'NotionApiError'
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

export async function getNotionConnectUrl(accessToken: string): Promise<string> {
  const base = getApiBase()
  const res = await fetch(`${base}/notion/connect`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new NotionApiError(res.status, await readErrorMessage(res))
  const data = await res.json()
  return data.url as string
}

export async function getNotionStatus(accessToken: string): Promise<NotionStatus> {
  const base = getApiBase()
  const res = await fetch(`${base}/notion/status`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new NotionApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NotionStatus>
}

export async function disconnectNotion(accessToken: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/notion/disconnect`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204)
    throw new NotionApiError(res.status, await readErrorMessage(res))
}
