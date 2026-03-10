import { getApiBase, getBaseHeaders } from './config'

export class NetworkApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'NetworkApiError'
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

/** Person from the Network API. */
export interface NetworkPerson {
  id: string
  org_id?: string
  name: string
  email?: string
  slack_handle?: string
  notion_workspace?: string
  jira_user?: string
  jira_projects?: string[]
  is_client?: boolean
  user_id?: string | null
  created_at?: string
  team_ids?: string[]
}

export interface CreateNetworkPersonRequest {
  name: string
  email?: string
  slack_handle?: string
  notion_workspace?: string
  jira_user?: string
  jira_projects?: string[]
  is_client?: boolean
  user_id?: string | null
}

export type UpdateNetworkPersonRequest = Partial<CreateNetworkPersonRequest>

export interface NetworkTeam {
  id: string
  org_id?: string
  name: string
  email?: string
  slack_handle?: string
  slack_channel?: string
  notion_workspace?: string
  is_client?: boolean
  created_at?: string
  member_ids?: string[]
}

export interface CreateNetworkTeamRequest {
  name: string
  email?: string
  slack_handle?: string
  slack_channel?: string
  notion_workspace?: string
  is_client?: boolean
}

export type UpdateNetworkTeamRequest = Partial<CreateNetworkTeamRequest>

export interface TeamMember {
  team_id: string
  person_id: string
  created_at: string
}

/**
 * GET /network/people/{person_id}
 * Returns a single person (with team_ids). 404 if not in current org.
 * Used to show linked contact name when user has org_person_id from GET /me.
 */
export async function getPerson(
  personId: string,
  accessToken: string
): Promise<NetworkPerson> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/people/${personId}`, {
    method: 'GET',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    throw new NetworkApiError(res.status, await readErrorMessage(res))
  }

  return res.json() as Promise<NetworkPerson>
}

/**
 * GET /network/people
 * List all people in the current org. Optional filter: ?is_client=true|false
 */
export async function listPeople(
  accessToken: string,
  opts?: { is_client?: boolean }
): Promise<NetworkPerson[]> {
  const base = getApiBase()
  const url = new URL(`${base}/network/people`)
  if (typeof opts?.is_client === 'boolean') {
    url.searchParams.set('is_client', String(opts.is_client))
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkPerson[]>
}

/** POST /network/people */
export async function createPerson(
  accessToken: string,
  body: CreateNetworkPersonRequest
): Promise<NetworkPerson> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/people`, {
    method: 'POST',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkPerson>
}

/** PATCH /network/people/{person_id} */
export async function updatePerson(
  accessToken: string,
  personId: string,
  body: UpdateNetworkPersonRequest
): Promise<NetworkPerson> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/people/${personId}`, {
    method: 'PATCH',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkPerson>
}

/** DELETE /network/people/{person_id} */
export async function deletePerson(accessToken: string, personId: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/people/${personId}`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204) throw new NetworkApiError(res.status, await readErrorMessage(res))
}

/**
 * GET /network/teams
 * List all teams in the current org. Optional filter: ?is_client=true|false
 */
export async function listTeams(
  accessToken: string,
  opts?: { is_client?: boolean }
): Promise<NetworkTeam[]> {
  const base = getApiBase()
  const url = new URL(`${base}/network/teams`)
  if (typeof opts?.is_client === 'boolean') {
    url.searchParams.set('is_client', String(opts.is_client))
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkTeam[]>
}

/** POST /network/teams */
export async function createTeam(
  accessToken: string,
  body: CreateNetworkTeamRequest
): Promise<NetworkTeam> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams`, {
    method: 'POST',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkTeam>
}

/** PATCH /network/teams/{team_id} */
export async function updateTeam(
  accessToken: string,
  teamId: string,
  body: UpdateNetworkTeamRequest
): Promise<NetworkTeam> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams/${teamId}`, {
    method: 'PATCH',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<NetworkTeam>
}

/** DELETE /network/teams/{team_id} */
export async function deleteTeam(accessToken: string, teamId: string): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams/${teamId}`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204) throw new NetworkApiError(res.status, await readErrorMessage(res))
}

/** GET /network/teams/{team_id}/members */
export async function listTeamMembers(
  accessToken: string,
  teamId: string
): Promise<TeamMember[]> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams/${teamId}/members`, {
    method: 'GET',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<TeamMember[]>
}

/** POST /network/teams/{team_id}/members */
export async function addPersonToTeam(
  accessToken: string,
  teamId: string,
  personId: string
): Promise<TeamMember> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams/${teamId}/members`, {
    method: 'POST',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ person_id: personId }),
  })
  if (!res.ok) throw new NetworkApiError(res.status, await readErrorMessage(res))
  return res.json() as Promise<TeamMember>
}

/** DELETE /network/teams/{team_id}/members/{person_id} */
export async function removePersonFromTeam(
  accessToken: string,
  teamId: string,
  personId: string
): Promise<void> {
  const base = getApiBase()
  const res = await fetch(`${base}/network/teams/${teamId}/members/${personId}`, {
    method: 'DELETE',
    headers: { ...getBaseHeaders(), Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok && res.status !== 204) throw new NetworkApiError(res.status, await readErrorMessage(res))
}
