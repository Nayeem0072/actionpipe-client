import { getApiBase, getBaseHeaders } from './config'

export interface CalendarStatus {
  connected: boolean
  email: string | null
  scopes: string | null
}

export class CalendarApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'CalendarApiError'
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

export async function getCalendarConnectUrl(accessToken: string): Promise<string> {
  const base = getApiBase()
  const res = await fetch(`${base}/calendar/connect`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new CalendarApiError(res.status, await readErrorMessage(res))
  const data = await res.json()
  return data.url as string
}

export async function getCalendarStatus(accessToken: string): Promise<CalendarStatus> {
  const base = getApiBase()
  const res = await fetch(`${base}/calendar/status`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new CalendarApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<CalendarStatus>
}

export async function disconnectCalendar(accessToken: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/calendar/disconnect`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204)
    throw new CalendarApiError(res.status, await readErrorMessage(res))
}
