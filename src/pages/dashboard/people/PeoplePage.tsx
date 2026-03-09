import { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import {
  createPerson,
  listPeople,
  updatePerson,
  type NetworkPerson,
} from '../../../api/network'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

type ModalState =
  | { type: 'none' }
  | { type: 'person'; mode: 'create' | 'edit'; initial?: NetworkPerson }

function clampPage(page: number, totalPages: number) {
  if (totalPages <= 1) return 1
  return Math.min(Math.max(page, 1), totalPages)
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = clampPage(page, totalPages)
  const start = (safePage - 1) * pageSize
  const end = start + pageSize
  return { page: safePage, pageSize, total, totalPages, items: items.slice(start, end) }
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="network-pagination">
      <button type="button" className="btn btn-secondary" onClick={onPrev} disabled={page <= 1}>
        Prev
      </button>
      <span className="network-pagination-label">
        Page <b>{page}</b> of <b>{totalPages}</b>
      </span>
      <button type="button" className="btn btn-secondary" onClick={onNext} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  )
}

export function PeoplePage() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const [people, setPeople] = useState<NetworkPerson[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [peoplePage, setPeoplePage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [peopleQuery, setPeopleQuery] = useState('')

  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      .then(async (token) => {
        const p = await listPeople(token)
        if (cancelled) return
        setPeople(p)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, getAccessTokenSilently])

  const filteredPeople = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase()
    if (!q) return [...people].sort((a, b) => a.name.localeCompare(b.name))
    return people
      .filter((p) => (p.name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [people, peopleQuery])

  const peoplePageData = useMemo(
    () => paginate(filteredPeople, peoplePage, pageSize),
    [filteredPeople, peoplePage, pageSize],
  )

  useEffect(() => {
    setPeoplePage((p) => clampPage(p, peoplePageData.totalPages))
  }, [peoplePageData.totalPages])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      const p = await listPeople(token)
      setPeople(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function onSubmitPerson(form: {
    id?: string
    name: string
    email?: string
    slack_handle?: string
    notion_workspace?: string
    jira_user?: string
    jira_projects?: string[]
    is_client?: boolean
  }) {
    setSaving(true)
    setFormError(null)
    try {
      const token = await getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      if (form.id) {
        await updatePerson(token, form.id, {
          name: form.name,
          email: form.email || undefined,
          slack_handle: form.slack_handle || undefined,
          notion_workspace: form.notion_workspace || undefined,
          jira_user: form.jira_user || undefined,
          jira_projects: form.jira_projects?.length ? form.jira_projects : undefined,
          is_client: form.is_client ?? false,
        })
      } else {
        await createPerson(token, {
          name: form.name,
          email: form.email || undefined,
          slack_handle: form.slack_handle || undefined,
          notion_workspace: form.notion_workspace || undefined,
          jira_user: form.jira_user || undefined,
          jira_projects: form.jira_projects?.length ? form.jira_projects : undefined,
          is_client: form.is_client ?? false,
        })
      }
      setModal({ type: 'none' })
      await refresh()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="dashboard-main-header">
        <div className="network-header">
          <div>
            <h1 className="dashboard-main-title">People</h1>
            <p className="dashboard-main-subtitle">Manage people in your organization.</p>
          </div>
          <div className="network-header-actions">
            <button type="button" className="btn btn-secondary" onClick={refresh} disabled={isLoading}>
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setModal({ type: 'person', mode: 'create' })}
            >
              Add Person
            </button>
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
          <p className="section-desc">Loading people…</p>
        ) : (
          <section className="network-panel">
            <div className="network-panel-header">
              <h2 className="section-title network-section-heading" style={{ marginBottom: 0 }}>
                <svg
                  className="network-section-heading-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d="M376 88C376 57.1 350.9 32 320 32C289.1 32 264 57.1 264 88C264 118.9 289.1 144 320 144C350.9 144 376 118.9 376 88zM400 300.7L446.3 363.1C456.8 377.3 476.9 380.3 491.1 369.7C505.3 359.1 508.3 339.1 497.7 324.9L427.2 229.9C402 196 362.3 176 320 176C277.7 176 238 196 212.8 229.9L142.3 324.9C131.8 339.1 134.7 359.1 148.9 369.7C163.1 380.3 183.1 377.3 193.7 363.1L240 300.7L240 576C240 593.7 254.3 608 272 608C289.7 608 304 593.7 304 576L304 416C304 407.2 311.2 400 320 400C328.8 400 336 407.2 336 416L336 576C336 593.7 350.3 608 368 608C385.7 608 400 593.7 400 576L400 300.7z" />
                </svg>
                <span>People</span>
              </h2>
              <div className="network-panel-controls">
                <input
                  className="actions-input network-search"
                  value={peopleQuery}
                  onChange={(e) => setPeopleQuery(e.target.value)}
                  placeholder="Search people…"
                  aria-label="Search people"
                />
              </div>
            </div>

            <div className="network-table-wrap">
              <table className="network-table">
                <thead>
                  <tr>
                    <th className="network-table-header-small">Name</th>
                    <th className="network-table-header-small">Type</th>
                    <th className="network-table-header-small">Email</th>
                    <th className="network-table-header-small">Slack</th>
                    <th className="network-table-header-small">Notion</th>
                    <th className="network-table-header-small">Jira</th>
                    <th className="network-table-header-small" />
                  </tr>
                </thead>
                <tbody>
                  {peoplePageData.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="network-empty">No people found.</td>
                    </tr>
                  ) : (
                    peoplePageData.items.map((p) => (
                      <tr key={p.id}>
                        <td className="network-strong">{p.name}</td>
                        <td>{p.is_client ? 'Client' : 'Internal'}</td>
                        <td>{p.email ?? <span className="network-muted">—</span>}</td>
                        <td>{p.slack_handle ?? <span className="network-muted">—</span>}</td>
                        <td>{p.notion_workspace ?? <span className="network-muted">—</span>}</td>
                        <td>{p.jira_user ?? <span className="network-muted">—</span>}</td>
                        <td className="network-actions">
                          <button
                            type="button"
                            className="btn btn-secondary network-action-btn"
                            onClick={() => setModal({ type: 'person', mode: 'edit', initial: p })}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="network-panel-footer">
              <div className="network-page-size">
                <span className="network-muted">Rows:</span>
                <select
                  className="actions-select network-page-size-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <Pagination
                page={peoplePageData.page}
                totalPages={peoplePageData.totalPages}
                onPrev={() => setPeoplePage((p) => Math.max(1, p - 1))}
                onNext={() => setPeoplePage((p) => Math.min(peoplePageData.totalPages, p + 1))}
              />
            </div>
          </section>
        )}
      </div>

      {modal.type === 'person' && (
        <div className="network-modal-backdrop" role="dialog" aria-modal="true">
          <div className="network-modal">
            <div className="network-modal-header">
              <h3 className="network-modal-title">
                {modal.mode === 'create' ? 'Add Person' : 'Edit Person'}
              </h3>
              <button type="button" className="network-modal-close" onClick={() => setModal({ type: 'none' })} aria-label="Close">
                ×
              </button>
            </div>

            {formError && (
              <div className="network-alert network-alert--error" role="alert">
                {formError}
              </div>
            )}

            <PersonForm
              key={(modal.initial?.id ?? 'new') + modal.mode}
              initial={modal.initial}
              saving={saving}
              onCancel={() => setModal({ type: 'none' })}
              onSubmit={onSubmitPerson}
            />
          </div>
        </div>
      )}
    </>
  )
}

function PersonForm({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial?: NetworkPerson
  saving: boolean
  onCancel: () => void
  onSubmit: (data: {
    id?: string
    name: string
    email?: string
    slack_handle?: string
    notion_workspace?: string
    jira_user?: string
    jira_projects?: string[]
    is_client?: boolean
  }) => void | Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [slack, setSlack] = useState(initial?.slack_handle ?? '')
  const [notion, setNotion] = useState(initial?.notion_workspace ?? '')
  const [jiraUser, setJiraUser] = useState(initial?.jira_user ?? '')
  const [jiraProjects, setJiraProjects] = useState((initial?.jira_projects ?? []).join(', '))
  const [isClient, setIsClient] = useState(Boolean(initial?.is_client))

  return (
    <form
      className="network-form"
      onSubmit={(e) => {
        e.preventDefault()
        const cleanedName = name.trim()
        if (!cleanedName) return
        const projects = jiraProjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        onSubmit({
          id: initial?.id,
          name: cleanedName,
          email: email.trim() || undefined,
          slack_handle: slack.trim() || undefined,
          notion_workspace: notion.trim() || undefined,
          jira_user: jiraUser.trim() || undefined,
          jira_projects: projects.length ? projects : undefined,
          is_client: isClient,
        })
      }}
    >
      <div className="network-form-grid">
        <label className="actions-form-group">
          <span className="actions-label">Name *</span>
          <input className="actions-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="actions-form-group">
          <span className="actions-label">Email</span>
          <input className="actions-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>

        <label className="actions-form-group">
          <span className="actions-label">Slack handle</span>
          <input className="actions-input" value={slack} onChange={(e) => setSlack(e.target.value)} placeholder="@name" />
        </label>
        <label className="actions-form-group">
          <span className="actions-label">Notion workspace</span>
          <input className="actions-input" value={notion} onChange={(e) => setNotion(e.target.value)} />
        </label>

        <label className="actions-form-group">
          <span className="actions-label">Jira user</span>
          <input className="actions-input" value={jiraUser} onChange={(e) => setJiraUser(e.target.value)} />
        </label>
        <label className="actions-form-group">
          <span className="actions-label">Jira projects</span>
          <input className="actions-input" value={jiraProjects} onChange={(e) => setJiraProjects(e.target.value)} placeholder="PROJ, SEC" />
        </label>

        <label className="network-checkbox">
          <input type="checkbox" checked={isClient} onChange={(e) => setIsClient(e.target.checked)} />
          <span>Is this a Client contact?</span>
        </label>
      </div>

      <div className="network-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

