import { useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { MeUser } from '../../api/me'
import { useDashboardSummary } from '../../hooks/useDashboardSummary'
import { getDisplayName } from '../../utils/displayName'
import { useLinkedPerson } from '../../hooks/useLinkedPerson'
import {
  formatCount,
  formatMetricLabel,
  getRunSuccessRate,
  sortCountEntries,
  sumCounts,
} from './summaryFormatting'

export interface DashboardOutletContext {
  user: MeUser | { name?: string; email?: string; picture?: string } | null
  meUser: MeUser | null
}

export function DashboardPage() {
  const { user, meUser } = useOutletContext<DashboardOutletContext>()
  const { linkedPerson } = useLinkedPerson(meUser)
  const displayName = getDisplayName(user)
  const isInNetwork = Boolean(meUser?.org_person_id)
  const { summary, isLoading, error, loadSummary } = useDashboardSummary()

  const runEntries = useMemo(
    () => (summary ? sortCountEntries(summary.runs) : []),
    [summary],
  )

  const actionEntries = useMemo(
    () => (summary ? sortCountEntries(summary.actions) : []),
    [summary],
  )

  const foundIntegrationEntries = useMemo(
    () =>
      sortCountEntries(summary?.integrationsFound ?? {}).filter(
        ([integration]) => formatMetricLabel(integration) !== 'General Task',
      ),
    [summary],
  )

  const connectedIntegrationEntries = useMemo(
    () => sortCountEntries(summary?.integrationsConnected ?? {}),
    [summary],
  )

  const stageStatuses = useMemo(() => {
    const preferredOrder = ['success', 'completed', 'in_progress', 'failed', 'error', 'pending']
    const statusSet = new Set<string>()

    Object.values(summary?.agentStages ?? {}).forEach((counts) => {
      Object.keys(counts).forEach((status) => statusSet.add(status))
    })

    const statuses = Array.from(statusSet)
    return statuses.sort((a, b) => {
      const aIndex = preferredOrder.indexOf(a)
      const bIndex = preferredOrder.indexOf(b)
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b)
      if (aIndex === -1) return 1
      if (bIndex === -1) return -1
      return aIndex - bIndex
    })
  }, [summary])

  const connectedIntegrationTotal = sumCounts(summary?.integrationsConnected ?? {})
  const foundIntegrationTotal = foundIntegrationEntries.reduce((total, [, value]) => total + value, 0)
  const runsRequested = summary?.runs.requested ?? 0
  const runsCompleted = summary?.runs.completed ?? 0
  const actionsExecuted = summary?.actions.executed ?? 0

  return (
    <>
      <header className="dashboard-main-header">
        <div className="network-header">
          <div>
            <h1 className="dashboard-main-title">Dashboard</h1>
            <p className="dashboard-main-subtitle">
              Hello there{displayName ? <b>{`, ${displayName}`}</b> : ''}. Welcome to your ActionPipe dashboard.
            </p>
            {isInNetwork && (
              <p className="dashboard-main-network-badge" role="status">
                {linkedPerson
                  ? `You're in the contact network as ${linkedPerson.name}.`
                  : 'You\'re in the contact network.'}
              </p>
            )}
          </div>
          <div className="network-header-actions">
            <button type="button" className="btn btn-secondary" onClick={loadSummary} disabled={isLoading}>
              Refresh
            </button>
            <Link to="/dashboard/actions" className="btn btn-primary">
              New Run
            </Link>
          </div>
        </div>
      </header>
      <div className="dashboard-main-content">
        {error && (
          <div className="network-alert network-alert--error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="section-desc">Loading dashboard summary…</p>
        ) : summary ? (
          <div className="dashboard-summary-stack">
            <section className="dashboard-cards dashboard-overview-cards">
              <div className="ecosystem-card dashboard-card dashboard-overview-card">
                <div className="dashboard-overview-card-icon" aria-hidden>
                  <i className="fa-solid fa-bolt" />
                </div>
                <h4>Runs Requested</h4>
                <p className="dashboard-card-value">{formatCount(runsRequested)}</p>
                <p className="section-desc">All pipeline requests triggered for your account.</p>
              </div>
              <div className="ecosystem-card dashboard-card dashboard-overview-card">
                <div className="dashboard-overview-card-icon" aria-hidden>
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h4>Runs Completed</h4>
                <p className="dashboard-card-value">{formatCount(runsCompleted)}</p>
                <p className="section-desc">{getRunSuccessRate(summary.runs)}% success rate across requested runs.</p>
              </div>
              <div className="ecosystem-card dashboard-card dashboard-overview-card">
                <div className="dashboard-overview-card-icon" aria-hidden>
                  <i className="fa-solid fa-play" />
                </div>
                <h4>Actions Executed</h4>
                <p className="dashboard-card-value">{formatCount(actionsExecuted)}</p>
                <p className="section-desc">Actions your executor has completed so far.</p>
              </div>
              <div className="ecosystem-card dashboard-card dashboard-overview-card">
                <div className="dashboard-overview-card-icon" aria-hidden>
                  <i className="fa-solid fa-plug-circle-check" />
                </div>
                <h4>Integrations Connected</h4>
                <p className="dashboard-card-value">{formatCount(connectedIntegrationTotal)}</p>
                <p className="section-desc">{formatCount(foundIntegrationTotal)} targets identified across your activity.</p>
              </div>
            </section>

            <section className="dashboard-summary-grid dashboard-summary-grid--single">
              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-wave-square network-section-heading-icon" aria-hidden />
                      <span>Run Status</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Distribution of requested pipeline runs by current outcome.
                    </p>
                  </div>
                </div>

                <div className="dashboard-stat-tiles-grid">
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">Success</span>
                    <strong>{formatCount(summary.runs.success)}</strong>
                  </div>
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">Failed</span>
                    <strong>{formatCount(summary.runs.failed)}</strong>
                  </div>
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">In progress</span>
                    <strong>{formatCount(summary.runs.in_progress)}</strong>
                  </div>
                </div>

                <div className="dashboard-bar-list">
                  {runEntries.map(([status, value]) => {
                    const width = runsRequested > 0 ? (value / runsRequested) * 100 : 0
                    return (
                      <div key={status} className="dashboard-bar-row">
                        <div className="dashboard-bar-row-header">
                          <span>{formatMetricLabel(status)}</span>
                          <strong>{formatCount(value)}</strong>
                        </div>
                        <div className="dashboard-bar-track" aria-hidden>
                          <span className="dashboard-bar-fill dashboard-bar-fill--secondary" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            </section>

            <section className="dashboard-summary-grid">
              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-list-check network-section-heading-icon" aria-hidden />
                      <span>Action Throughput</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Volume across extraction, normalization, and execution stages.
                    </p>
                  </div>
                </div>
                <div className="dashboard-stat-tiles-grid dashboard-stat-tiles-grid--three">
                  {actionEntries.map(([label, value]) => (
                    <div key={label} className="dashboard-stat-tile">
                      <span className="dashboard-stat-label">{formatMetricLabel(label)}</span>
                      <strong>{formatCount(value)}</strong>
                    </div>
                  ))}
                </div>
              </article>

              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-diagram-project network-section-heading-icon" aria-hidden />
                      <span>Agent Stages</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Status counts grouped by extractor, normalizer, and executor.
                    </p>
                  </div>
                </div>

                <div className="network-table-wrap">
                  <table className="network-table dashboard-stage-table">
                    <thead>
                      <tr>
                        <th>Agent</th>
                        {stageStatuses.map((status) => (
                          <th key={status}>{formatMetricLabel(status)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(summary.agentStages).map(([agent, counts]) => (
                        <tr key={agent}>
                          <td className="network-strong">{formatMetricLabel(agent)}</td>
                          {stageStatuses.map((status) => (
                            <td key={status}>{formatCount(counts[status] ?? 0)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>

            <section className="dashboard-summary-grid">
              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-binoculars network-section-heading-icon" aria-hidden />
                      <span>Actions By Integrations</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Provider and tool targets detected from your extracted work.
                    </p>
                  </div>
                </div>

                {foundIntegrationEntries.length > 0 ? (
                  <div className="dashboard-bar-list">
                    {foundIntegrationEntries.map(([integration, value]) => {
                      const width = foundIntegrationTotal > 0 ? (value / foundIntegrationTotal) * 100 : 0
                      return (
                        <div key={integration} className="dashboard-bar-row">
                          <div className="dashboard-bar-row-header">
                            <span>{formatMetricLabel(integration)}</span>
                            <strong>{formatCount(value)}</strong>
                          </div>
                          <div className="dashboard-bar-track" aria-hidden>
                            <span className="dashboard-bar-fill" style={{ width: `${width}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="network-empty">No integration targets found yet.</p>
                )}
              </article>

              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-link network-section-heading-icon" aria-hidden />
                      <span>Integrations Connected</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Connected accounts currently available through your user tokens.
                    </p>
                  </div>
                </div>

                {connectedIntegrationEntries.length > 0 ? (
                  <div className="dashboard-connected-grid">
                    {connectedIntegrationEntries.map(([integration, value]) => (
                      <div key={integration} className="dashboard-stat-tile">
                        <span className="dashboard-stat-label">{formatMetricLabel(integration)}</span>
                        <strong>{formatCount(value)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="network-empty">No connected integrations yet.</p>
                )}
              </article>
            </section>

            {/* <section className="section network-panel dashboard-summary-panel">
              <h2 className="section-title">Quick start</h2>
              <p className="section-desc">
                Run the extractor on a transcript, review the normalized actions, then execute with one click. Dry-run is enabled by default.
              </p>
              <div className="network-header-actions">
                <Link to="/dashboard/actions" className="btn btn-primary">
                  Open actions
                </Link>
                <Link to="/#try-it" className="btn btn-secondary">
                  View documentation
                </Link>
              </div>
            </section> */}
          </div>
        ) : (
          <p className="section-desc">No dashboard summary is available yet.</p>
        )}
      </div>
    </>
  )
}
