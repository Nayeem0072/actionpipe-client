import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useMe } from '../hooks/useMe'
import { MeApiError } from '../api/me'
import { DashboardSidebar } from '../components/DashboardSidebar'

/**
 * Wraps all dashboard routes. Handles Auth0 + /me once:
 * - Redirects to / if not authenticated
 * - 401 from /me → logout
 * - 503 or other /me error → error screen
 * - Renders sidebar + outlet when ready
 */
export function DashboardLayout() {
  const { user: auth0User, isLoading: authLoading, logout } = useAuth0()
  const { user: meUser, isLoading: meLoading, error: meError } = useMe()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !auth0User) {
      navigate('/', { replace: true })
    }
  }, [authLoading, auth0User, navigate])

  useEffect(() => {
    if (meError instanceof MeApiError && meError.status === 401) {
      logout({ logoutParams: { returnTo: window.location.origin + '/logout' } })
    }
  }, [meError, logout])

  const isLoading = authLoading || meLoading
  const user = meUser ?? auth0User

  if (isLoading || !auth0User) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p className="section-desc">Loading…</p>
      </div>
    )
  }

  if (meError instanceof MeApiError && meError.status === 503) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <p className="section-desc">Service temporarily unavailable. Please try again later.</p>
        <button type="button" className="btn-header" onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/logout' } })}>
          Log out
        </button>
      </div>
    )
  }

  if (meError && !(meError instanceof MeApiError && meError.status === 401)) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <p className="section-desc">Could not load your account. Try logging out and back in.</p>
        <button type="button" className="btn-header" onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/logout' } })}>
          Log out
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        <Outlet context={{ user }} />
      </main>
    </div>
  )
}
