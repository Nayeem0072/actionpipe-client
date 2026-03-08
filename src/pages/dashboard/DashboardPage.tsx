import { Link, useOutletContext } from 'react-router-dom'
import type { MeUser } from '../../api/me'
import { getDisplayName } from '../../utils/displayName'

export interface DashboardOutletContext {
  user: MeUser | { name?: string; email?: string } | null
}

export function DashboardPage() {
  const { user } = useOutletContext<DashboardOutletContext>()
  const displayName = getDisplayName(user)

  return (
    <>
      <header className="dashboard-main-header">
        <h1 className="dashboard-main-title">Dashboard</h1>
        <p className="dashboard-main-subtitle">
          Hello there{displayName ? <b>{`, ${displayName}`}</b> : ''}. Welcome to your ActionPipe dashboard.
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
    </>
  )
}
