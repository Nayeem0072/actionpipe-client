import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useSearchParams } from 'react-router-dom'
import {
  getSlackConnectUrl,
  getSlackStatus,
  disconnectSlack,
  type SlackStatus,
} from '../../../api/slack'
import {
  getCalendarConnectUrl,
  getCalendarStatus,
  disconnectCalendar,
  type CalendarStatus,
} from '../../../api/calendar'
import {
  getJiraConnectUrl,
  getJiraStatus,
  disconnectJira,
  type JiraStatus,
} from '../../../api/jira'
import {
  getNotionConnectUrl,
  getNotionStatus,
  disconnectNotion,
  type NotionStatus,
} from '../../../api/notion'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined

const INTEGRATIONS = [
  {
    id: 'email',
    name: 'Email',
    description: 'Connect your inbox to send and track action items from meetings.',
    iconClass: 'fa-regular fa-envelope',
    color: '#ea4335',
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Create and update issues, link tasks to meetings and deadlines.',
    iconClass: 'fa-brands fa-jira',
    color: '#0052CC',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync tasks and databases with your workspace and meeting notes.',
    iconClass: 'fa-brands fa-notion',
    color: '#000000',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Read availability and schedule follow-ups from your calendar.',
    iconClass: 'fa-regular fa-calendar-days',
    color: '#4285F4',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send reminders and updates to channels and DMs from actions.',
    iconClass: 'fa-brands fa-slack',
    color: '#4A154B',
  },
] as const

type IntegrationId = (typeof INTEGRATIONS)[number]['id']

/** Notion logo SVG (Font Awesome v7 style) */
function NotionIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      fill="currentColor"
      aria-hidden
    >
      <path d="M158.9 164.2C173.8 176.3 179.4 175.4 207.5 173.5L471.8 157.6C477.4 157.6 472.7 152 470.9 151.1L426.9 119.4C418.5 112.9 407.3 105.4 385.8 107.3L129.9 125.9C120.6 126.8 118.7 131.5 122.4 135.2L158.8 164.1zM174.8 225.8L174.8 503.9C174.8 518.8 182.3 524.4 199.1 523.5L489.6 506.7C506.4 505.8 508.3 495.5 508.3 483.4L508.3 207.2C508.3 195.1 503.6 188.5 493.3 189.5L189.7 207.1C178.5 208 174.8 213.6 174.8 225.8zM461.5 240.7C463.4 249.1 461.5 257.5 453.1 258.5L439.1 261.3L439.1 466.6C426.9 473.1 415.7 476.9 406.4 476.9C391.4 476.9 387.7 472.2 376.5 458.2L285 314.5L285 453.5L314 460C314 460 314 476.8 290.6 476.8L226.2 480.5C224.3 476.8 226.2 467.4 232.7 465.6L249.5 460.9L249.5 277.1L226.2 275.2C224.3 266.8 229 254.7 242.1 253.7L311.2 249L406.5 394.6L406.5 265.8L382.2 263C380.3 252.7 387.8 245.3 397.1 244.3L461.6 240.5zM108.4 100.7L374.6 81.1C407.3 78.3 415.7 80.2 436.2 95.1L521.2 154.8C535.2 165.1 539.9 167.9 539.9 179.1L539.9 506.7C539.9 527.2 532.4 539.4 506.3 541.2L197.2 559.8C177.6 560.7 168.2 557.9 158 544.9L95.4 463.7C84.2 448.8 79.5 437.6 79.5 424.5L79.5 133.3C79.5 116.5 87 102.5 108.4 100.6z" />
    </svg>
  )
}

export function IntegrationsPage() {
  const { getAccessTokenSilently } = useAuth0()
  const [searchParams, setSearchParams] = useSearchParams()

  const [slackStatus, setSlackStatus] = useState<SlackStatus | null>(null)
  const [slackLoading, setSlackLoading] = useState(false)
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus | null>(null)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [jiraStatus, setJiraStatus] = useState<JiraStatus | null>(null)
  const [jiraLoading, setJiraLoading] = useState(false)
  const [notionStatus, setNotionStatus] = useState<NotionStatus | null>(null)
  const [notionLoading, setNotionLoading] = useState(false)
  const [connectingId, setConnectingId] = useState<IntegrationId | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getToken = useCallback(
    () =>
      getAccessTokenSilently(
        AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined,
      ),
    [getAccessTokenSilently],
  )

  const fetchSlackStatus = useCallback(async () => {
    setSlackLoading(true)
    try {
      const token = await getToken()
      const status = await getSlackStatus(token)
      setSlackStatus(status)
    } catch {
      // Non-fatal — leave slackStatus as null (treat as disconnected)
    } finally {
      setSlackLoading(false)
    }
  }, [getToken])

  const fetchCalendarStatus = useCallback(async () => {
    setCalendarLoading(true)
    try {
      const token = await getToken()
      const status = await getCalendarStatus(token)
      setCalendarStatus(status)
    } catch {
      // Non-fatal — leave calendarStatus as null (treat as disconnected)
    } finally {
      setCalendarLoading(false)
    }
  }, [getToken])

  const fetchJiraStatus = useCallback(async () => {
    setJiraLoading(true)
    try {
      const token = await getToken()
      const status = await getJiraStatus(token)
      setJiraStatus(status)
    } catch {
      // Non-fatal — leave jiraStatus as null (treat as disconnected)
    } finally {
      setJiraLoading(false)
    }
  }, [getToken])

  const fetchNotionStatus = useCallback(async () => {
    setNotionLoading(true)
    try {
      const token = await getToken()
      const status = await getNotionStatus(token)
      setNotionStatus(status)
    } catch {
      // Non-fatal — leave notionStatus as null (treat as disconnected)
    } finally {
      setNotionLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    if (searchParams.get('slack') === 'connected') {
      setSuccessMessage('Slack connected successfully!')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('slack')
        return next
      }, { replace: true })
    }

    if (searchParams.get('calendar') === 'connected') {
      setSuccessMessage('Google Calendar connected successfully!')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('calendar')
        return next
      }, { replace: true })
    }

    if (searchParams.get('jira') === 'connected') {
      setSuccessMessage('Jira connected successfully!')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('jira')
        return next
      }, { replace: true })
    }

    if (searchParams.get('notion') === 'connected') {
      setSuccessMessage('Notion connected successfully!')
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('notion')
        return next
      }, { replace: true })
    }

    fetchSlackStatus()
    fetchCalendarStatus()
    fetchJiraStatus()
    fetchNotionStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = async (id: IntegrationId) => {
    if (id !== 'slack' && id !== 'calendar' && id !== 'jira' && id !== 'notion') return

    setConnectingId(id)
    setError(null)
    try {
      const token = await getToken()
      if (id === 'slack') {
        const url = await getSlackConnectUrl(token)
        window.location.href = url
      } else if (id === 'calendar') {
        const url = await getCalendarConnectUrl(token)
        window.location.href = url
      } else if (id === 'jira') {
        const url = await getJiraConnectUrl(token)
        window.location.href = url
      } else {
        const url = await getNotionConnectUrl(token)
        window.location.href = url
      }
    } catch (err) {
      const label =
        id === 'slack' ? 'Slack' : id === 'calendar' ? 'Google Calendar' : id === 'jira' ? 'Jira' : 'Notion'
      setError(err instanceof Error ? err.message : `Failed to start ${label} connection.`)
      setConnectingId(null)
    }
  }

  const handleDisconnectSlack = async () => {
    setConnectingId('slack')
    setError(null)
    try {
      const token = await getToken()
      await disconnectSlack(token)
      setSlackStatus({ connected: false, workspace: null, slack_user_id: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Slack.')
    } finally {
      setConnectingId(null)
    }
  }

  const handleDisconnectCalendar = async () => {
    setConnectingId('calendar')
    setError(null)
    try {
      const token = await getToken()
      await disconnectCalendar(token)
      setCalendarStatus({ connected: false, email: null, scopes: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Google Calendar.')
    } finally {
      setConnectingId(null)
    }
  }

  const handleDisconnectJira = async () => {
    setConnectingId('jira')
    setError(null)
    try {
      const token = await getToken()
      await disconnectJira(token)
      setJiraStatus({ connected: false, site_url: null, site_name: null, scope: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Jira.')
    } finally {
      setConnectingId(null)
    }
  }

  const handleDisconnectNotion = async () => {
    setConnectingId('notion')
    setError(null)
    try {
      const token = await getToken()
      await disconnectNotion(token)
      setNotionStatus({ connected: false, workspace_name: null, workspace_id: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect Notion.')
    } finally {
      setConnectingId(null)
    }
  }

  const isSlackConnected = slackStatus?.connected === true
  const isCalendarConnected = calendarStatus?.connected === true
  const isJiraConnected = jiraStatus?.connected === true
  const isNotionConnected = notionStatus?.connected === true

  return (
    <>
      <header className="dashboard-main-header">
        <h1 className="dashboard-main-title">Integrations</h1>
        <p className="dashboard-main-subtitle">
          Connect your tools so ActionPipe can send tasks, create issues, and sync with your workflow.
        </p>
      </header>
      <div className="dashboard-main-content">
        {successMessage && (
          <div className="network-alert network-alert--success" role="status">
            <i className="fa-solid fa-circle-check" aria-hidden /> {successMessage}
          </div>
        )}
        {error && (
          <div className="network-alert network-alert--error" role="alert">
            {error}
          </div>
        )}
        <section className="section">
          <h2 className="section-title">Integration Points</h2>
          <div className="section-desc">
            Authorize each service below. You can connect or disconnect at any time from this page.
          </div>
          <ul className="actions-executor-list-items">
            {INTEGRATIONS.map((integration) => {
              const isSlack = integration.id === 'slack'
              const isCalendar = integration.id === 'calendar'
              const isJira = integration.id === 'jira'
              const isNotion = integration.id === 'notion'
              const connected =
                (isSlack && isSlackConnected) ||
                (isCalendar && isCalendarConnected) ||
                (isJira && isJiraConnected) ||
                (isNotion && isNotionConnected)
              const loading =
                (isSlack && (slackLoading || connectingId === 'slack')) ||
                (isCalendar && (calendarLoading || connectingId === 'calendar')) ||
                (isJira && (jiraLoading || connectingId === 'jira')) ||
                (isNotion && (notionLoading || connectingId === 'notion'))

              const connectedSubtitle = isSlack
                ? slackStatus?.workspace ?? null
                : isCalendar
                  ? calendarStatus?.email ?? null
                  : isJira
                    ? jiraStatus?.site_name ?? null
                    : isNotion
                      ? notionStatus?.workspace_name ?? null
                      : null

              const handleDisconnect = isSlack
                ? handleDisconnectSlack
                : isCalendar
                  ? handleDisconnectCalendar
                  : isJira
                    ? handleDisconnectJira
                    : isNotion
                      ? handleDisconnectNotion
                      : undefined

              const isImplemented = isSlack || isCalendar || isJira || isNotion

              return (
                <li key={integration.id} className="actions-executor-list-item">
                  <div
                    className="actions-executor-card ecosystem-card"
                    data-connected={connected}
                  >
                    <div
                      className="actions-executor-card-icon connections-card-icon"
                      aria-hidden
                    >
                      {integration.id === 'notion' ? (
                        <NotionIcon className="connections-card-icon-svg" />
                      ) : (
                        <i className={integration.iconClass} aria-hidden />
                      )}
                    </div>
                    <div className="actions-executor-card-body connections-card-body">
                      <h4>
                        {integration.name}
                        {connected && (
                          <span className="integration-connected-badge">
                            <i className="fa-solid fa-circle-check" aria-hidden /> Connected
                            {connectedSubtitle ? ` · ${connectedSubtitle}` : ''}
                          </span>
                        )}
                      </h4>
                      <p>{integration.description}</p>
                    </div>
                    <div className="actions-executor-card-actions">
                      {isImplemented ? (
                        connected ? (
                          <button
                            type="button"
                            className="btn btn-secondary actions-executor-btn actions-executor-btn-action"
                            onClick={handleDisconnect}
                            disabled={loading}
                          >
                            {loading ? 'Disconnecting…' : 'Disconnect'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary actions-executor-btn actions-executor-btn-action"
                            onClick={() => handleConnect(integration.id)}
                            disabled={loading}
                          >
                            {loading ? 'Connecting…' : 'Connect'}
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary actions-executor-btn actions-executor-btn-action"
                          disabled
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}
