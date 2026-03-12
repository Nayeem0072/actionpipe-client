import { useAuth0 } from '@auth0/auth0-react'
import { useCallback, useEffect, useState } from 'react'
import { getDashboardSummary, type DashboardSummary } from '../api/dashboard'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

export function useDashboardSummary() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently(
        AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined,
      )
      const nextSummary = await getDashboardSummary(token)
      setSummary(nextSummary)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsLoading(false)
    }
  }, [getAccessTokenSilently])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      .then((token) => getDashboardSummary(token))
      .then((nextSummary) => {
        if (cancelled) return
        setSummary(nextSummary)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [getAccessTokenSilently, isAuthenticated])

  return { summary, isLoading, error, loadSummary }
}
