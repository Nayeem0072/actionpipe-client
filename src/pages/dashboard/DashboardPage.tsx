import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { DashboardSidebar } from '../../components/DashboardSidebar'

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
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-main">
        <header className="dashboard-main-header">
          <h1 className="dashboard-main-title">Dashboard</h1>
          <p className="dashboard-main-subtitle">
            Hello there<b>{user?.name ? `, ${user.name}` : ''}</b>. Welcome to your ActionPipe dashboard.
          </p>
        </header>
        <div className="dashboard-main-content">
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
        </div>
      </main>
    </div>
  )
}
