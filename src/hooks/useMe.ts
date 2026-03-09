import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { getMe, type MeUser, MeApiError } from '../api/me'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

export interface UseMeResult {
  /** Backend user from GET /me (created/updated on first request after login). */
  user: MeUser | null
  /** True while Auth0 or /me request is in progress. */
  isLoading: boolean
  /** Error from /me (401, 503, or network). */
  error: Error | null
  /** Call to refetch /me (e.g. after token refresh). */
  refetch: () => Promise<void>
}

/**
 * After Auth0 login, gets the access token and calls GET /me to load/create
 * the backend user. Use this in dashboard and anywhere you need the DB user.
 */
export function useMe(): UseMeResult {
  const { isAuthenticated, getAccessTokenSilently, isLoading: authLoading } = useAuth0()
  const [user, setUser] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMe = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently(
        AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined
      )
      const me = await getMe(token)
      setUser(me)
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      setError(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAccessTokenSilently])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return {
    user,
    isLoading: authLoading || loading,
    error,
    refetch: fetchMe,
  }
}

export type { MeUser }
export { MeApiError }
