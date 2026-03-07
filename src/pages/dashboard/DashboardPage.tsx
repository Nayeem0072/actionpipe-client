import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export function DashboardPage() {
  const { user, isLoading, logout } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin + '/logout' } })
  }

  if (isLoading || !user) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p className="section-desc">Loading…</p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="header header-scrolled">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="4" cy="12" r="2" />
                <path d="M7 12h5" />
                <circle cx="12" cy="12" r="2" />
                <path d="M14 12h6" />
                <circle cx="20" cy="12" r="2" />
              </svg>
            </span>
            <span className="logo-text">ActionPipe</span>
          </Link>
          <nav className="nav">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/">Home</Link>
          </nav>
          <div className="header-actions">
            {user && (
              <>
                <span className="header-user">
                  {user.picture && <img src={user.picture} alt="" width={28} height={28} style={{ borderRadius: '50%', marginRight: 8 }} />}
                  <span className="header-user-name">{user.name ?? user.email}</span>
                </span>
                <button type="button" className="btn-header btn-header-ghost" onClick={handleLogout}>Log out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <section className="section">
          <h1 className="section-title">Dashboard</h1>
          <p className="section-desc">
            Welcome back{user?.name ? `, ${user.name}` : ''}. This is your ActionPipe dashboard.
          </p>
        </section>

        <section className="section">
          <h2 className="section-title">Overview</h2>
          <div className="dashboard-cards">
            <div className="ecosystem-card dashboard-card">
              <h4>Actions extracted</h4>
              <p className="dashboard-card-value">—</p>
              <p className="section-desc">Total action items from transcripts this period.</p>
            </div>
            <div className="ecosystem-card dashboard-card">
              <h4>Executions</h4>
              <p className="dashboard-card-value">—</p>
              <p className="section-desc">One-click executions completed.</p>
            </div>
            <div className="ecosystem-card dashboard-card">
              <h4>Integrations</h4>
              <p className="dashboard-card-value">—</p>
              <p className="section-desc">MCP servers and APIs connected.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Quick start</h2>
          <p className="section-desc">
            Run the extractor on a transcript, review the normalized actions, then execute with one click. Dry-run is enabled by default.
          </p>
          <Link to="/#try-it" className="btn btn-primary">View documentation</Link>
        </section>
      </main>
    </div>
  )
}
