import { getApiBase } from './config'

export interface MeUser {
  id: string
  org_id: string
  org_name: string
  email: string
  name: string
  picture: string
  created_at: string
  /**
   * All decoded token claims for this user (plus /userinfo fields if enabled).
   * Use this to access identity data such as given_name, family_name, etc.,
   * without needing to re-decode the Auth0 token on the client.
   */
  claims: Record<string, unknown>
  /**
   * Set when this user is linked to an OrgPerson (contact) in the same org.
   * Use for "you're in the network as …" or merging profile with contact data.
   * Omitted if backend does not support it yet.
   */
  org_person_id?: string | null
}

export class MeApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'MeApiError'
  }
}

/**
 * GET /me — Returns the current authenticated user from the backend.
 * Backend verifies JWT, creates/updates user in DB, returns User.
 * Pass the Auth0 access token (not the ID token).
 */
export async function getMe(accessToken: string): Promise<MeUser> {
  const base = getApiBase()
  const res = await fetch(`${base}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const json = JSON.parse(text) as { detail?: string; message?: string }
      message = json.detail ?? json.message ?? text
    } catch {
      // use text as-is
    }
    throw new MeApiError(res.status, message)
  }

  return res.json() as Promise<MeUser>
}
