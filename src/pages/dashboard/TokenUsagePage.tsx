import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDashboardSummary } from '../../hooks/useDashboardSummary'
import { formatCount, formatMetricLabel, getUsagePercent, sortCountEntries } from './summaryFormatting'

export function TokenUsagePage() {
  const { summary, isLoading, error, loadSummary } = useDashboardSummary()

  const tokenByAgent = useMemo(
    () => sortCountEntries(summary?.tokens.by_agent ?? {}),
    [summary],
  )

  const tokenUsagePercent = useMemo(
    () => (summary ? getUsagePercent(summary.tokens) : 0),
    [summary],
  )

  const maxAgentValue = useMemo(
    () => Math.max(...tokenByAgent.map(([, count]) => count), 1),
    [tokenByAgent],
  )

  return (
    <>
      <header className="dashboard-main-header">
        <div className="network-header">
          <div>
            <h1 className="dashboard-main-title">Token Usage</h1>
            <p className="dashboard-main-subtitle">
              Track monthly consumption, total token volume, and which agents are using the most tokens.
            </p>
          </div>
          <div className="network-header-actions">
            <button type="button" className="btn btn-secondary" onClick={loadSummary} disabled={isLoading}>
              Refresh
            </button>
            <Link to="/dashboard" className="btn btn-primary">
              Back to Overview
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
          <p className="section-desc">Loading token usage…</p>
        ) : summary ? (
          <div className="dashboard-summary-stack">
            <section className="network-panel dashboard-summary-panel dashboard-summary-panel--highlight">
              <div className="dashboard-panel-header">
                <div>
                  <h2 className="section-title network-section-heading dashboard-panel-title">
                    <i className="fa-solid fa-chart-line network-section-heading-icon" aria-hidden />
                    <span>Monthly Allocation</span>
                  </h2>
                </div>
              </div>

              <div className="dashboard-token-hero">
                <div>
                  <div className="dashboard-token-hero-value">
                    {formatCount(summary.tokens.used_this_month)}
                    <span className="dashboard-token-hero-unit"> tokens used this month</span>
                  </div>
                  <p className="dashboard-token-hero-meta">
                    {summary.tokens.is_unlimited
                      ? 'Unlimited plan'
                      : `${formatCount(summary.tokens.remaining_this_month)} remaining of ${formatCount(summary.tokens.allocated_this_month ?? 0)}`}
                  </p>
                </div>
                <div className="dashboard-progress-meta">
                  {summary.tokens.is_unlimited ? 'Unlimited' : `${Math.round(tokenUsagePercent ?? 0)}%`}
                </div>
              </div>

              <div
                className={`dashboard-progress${summary.tokens.is_unlimited ? ' dashboard-progress--unlimited' : ''}`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={summary.tokens.is_unlimited ? undefined : summary.tokens.allocated_this_month ?? 0}
                aria-valuenow={summary.tokens.is_unlimited ? undefined : summary.tokens.used_this_month}
                aria-label="Monthly token usage"
              >
                <span
                  className="dashboard-progress-bar"
                  style={{ width: `${summary.tokens.is_unlimited ? 100 : tokenUsagePercent ?? 0}%` }}
                />
              </div>
            </section>

            <section className="dashboard-summary-grid">
              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-coins network-section-heading-icon" aria-hidden />
                      <span>Totals</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Breakdown of all tokens processed for your account.
                    </p>
                  </div>
                </div>

                <div className="dashboard-token-stats">
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">Used Total</span>
                    <strong>{formatCount(summary.tokens.used_total)}</strong>
                  </div>
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">Prompt Tokens</span>
                    <strong>{formatCount(summary.tokens.prompt_total)}</strong>
                  </div>
                  <div className="dashboard-stat-tile">
                    <span className="dashboard-stat-label">Completion Tokens</span>
                    <strong>{formatCount(summary.tokens.completion_total)}</strong>
                  </div>
                </div>
              </article>

              <article className="network-panel dashboard-summary-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2 className="section-title network-section-heading dashboard-panel-title">
                      <i className="fa-solid fa-microchip network-section-heading-icon" aria-hidden />
                      <span>Usage By Agent</span>
                    </h2>
                    <p className="section-desc dashboard-panel-subtitle">
                      Compare token consumption across the agents involved in your runs.
                    </p>
                  </div>
                </div>

                {tokenByAgent.length > 0 ? (
                  <div className="dashboard-bar-list">
                    {tokenByAgent.map(([agent, value]) => {
                      const width = (value / maxAgentValue) * 100
                      return (
                        <div key={agent} className="dashboard-bar-row">
                          <div className="dashboard-bar-row-header">
                            <span>{formatMetricLabel(agent)}</span>
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
                  <p className="network-empty">No per-agent token usage yet.</p>
                )}
              </article>
            </section>
          </div>
        ) : (
          <p className="section-desc">No token usage summary is available yet.</p>
        )}
      </div>
    </>
  )
}
