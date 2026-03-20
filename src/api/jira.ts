import { getApiBase, getBaseHeaders } from './config'

export interface JiraStatus {
  connected: boolean
  site_url: string | null
  site_name: string | null
  scope: string | null
  project_key: string | null
}

export class JiraApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'JiraApiError'
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

export async function getJiraConnectUrl(accessToken: string): Promise<string> {
  const base = getApiBase()
  const res = await fetch(`${base}/jira/connect`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new JiraApiError(res.status, await readErrorMessage(res))
  const data = await res.json()
  return data.url as string
}

export async function getJiraStatus(accessToken: string): Promise<JiraStatus> {
  const base = getApiBase()
  const res = await fetch(`${base}/jira/status`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new JiraApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<JiraStatus>
}

export async function disconnectJira(accessToken: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/jira/disconnect`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204)
    throw new JiraApiError(res.status, await readErrorMessage(res))
}

export interface JiraProject {
  key: string
  name: string
  type: string
  style: string
}

export interface JiraProjectsResponse {
  projects: JiraProject[]
  saved_project_key: string | null
}

export async function getJiraProjects(accessToken: string): Promise<JiraProjectsResponse> {
  const base = getApiBase()
  const res = await fetch(`${base}/jira/projects`, {
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new JiraApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<JiraProjectsResponse>
}

export async function patchJiraSettings(
  accessToken: string,
  projectKey: string,
): Promise<{ project_key: string }> {
  const base = getApiBase()
  const res = await fetch(`${base}/jira/settings`, {
    method: 'PATCH',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ project_key: projectKey }),
  })
  if (!res.ok) throw new JiraApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<{ project_key: string }>
}
