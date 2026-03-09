import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getPerson, type NetworkPerson } from '../api/network'
import type { MeUser } from '../api/me'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

export interface UseLinkedPersonResult {
  /** The org person linked to the current user (when GET /me returns org_person_id). */
  linkedPerson: NetworkPerson | null
  /** True while fetching the linked person. */
  isLoading: boolean
}

/**
 * When the current user is linked to an OrgPerson (GET /me has org_person_id),
 * fetches that person so the UI can show "You're in the network as {name}".
 *
 * Expects the MeUser from the single /me call owned by DashboardLayout.
 */
export function useLinkedPerson(meUser: MeUser | null): UseLinkedPersonResult {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [linkedPerson, setLinkedPerson] = useState<NetworkPerson | null>(null)
  const [isLoading, setLoading] = useState(false)

  const orgPersonId = meUser?.org_person_id ?? null

  useEffect(() => {
    if (!isAuthenticated || !orgPersonId) {
      setLinkedPerson(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getAccessTokenSilently(
      AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined
    )
      .then((token) => getPerson(orgPersonId, token))
      .then((person) => {
        if (!cancelled) {
          setLinkedPerson(person)
        }
      })
      .catch(() => {
        if (!cancelled) setLinkedPerson(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, orgPersonId, getAccessTokenSilently])

  return { linkedPerson, isLoading }
}
