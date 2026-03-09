import { useEffect, useMemo, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import {
  createTeam,
  listPeople,
  listTeams,
  updateTeam,
  addPersonToTeam,
  removePersonFromTeam,
  type NetworkPerson,
  type NetworkTeam,
} from '../../../api/network'

const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE

type ModalState =
  | { type: 'none' }
  | { type: 'team'; mode: 'create' | 'edit'; initial?: NetworkTeam }
  | { type: 'teamMembers'; team: NetworkTeam }

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

export function TeamsPage() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()

  const [people, setPeople] = useState<NetworkPerson[]>([])
  const [teams, setTeams] = useState<NetworkTeam[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [teamsPage, setTeamsPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [teamsQuery, setTeamsQuery] = useState('')

  const [modal, setModal] = useState<ModalState>({ type: 'none' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [membersSaving, setMembersSaving] = useState(false)
  const [membersError, setMembersError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      .then(async (token) => {
        const [p, t] = await Promise.all([listPeople(token), listTeams(token)])
        if (cancelled) return
        setPeople(p)
        setTeams(t)
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

  const peopleById = useMemo(() => {
    const map = new Map<string, NetworkPerson>()
    for (const p of people) map.set(p.id, p)
    return map
  }, [people])

  const filteredTeams = useMemo(() => {
    const q = teamsQuery.trim().toLowerCase()
    if (!q) return [...teams].sort((a, b) => a.name.localeCompare(b.name))
    return teams.filter((t) => (t.name ?? '').toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name))
  }, [teams, teamsQuery])

  const teamsPageData = useMemo(
    () => paginate(filteredTeams, teamsPage, pageSize),
    [filteredTeams, teamsPage, pageSize],
  )

  useEffect(() => {
    setTeamsPage((p) => clampPage(p, teamsPageData.totalPages))
  }, [teamsPageData.totalPages])

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const token = await getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      const [p, t] = await Promise.all([listPeople(token), listTeams(token)])
      setPeople(p)
      setTeams(t)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function onUpdateTeamMembers(team: NetworkTeam, memberIds: string[]) {
    setMembersSaving(true)
    setMembersError(null)
    try {
      const current = new Set(team.member_ids ?? [])
      const next = new Set(memberIds)

      const toAdd = Array.from(next).filter((id) => !current.has(id))
      const toRemove = Array.from(current).filter((id) => !next.has(id))

      if (toAdd.length === 0 && toRemove.length === 0) {
        setModal({ type: 'none' })
        return
      }

      const token = await getAccessTokenSilently(
        AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined,
      )

      await Promise.all([
        ...toAdd.map((personId) => addPersonToTeam(token, team.id, personId)),
        ...toRemove.map((personId) => removePersonFromTeam(token, team.id, personId)),
      ])

      setModal({ type: 'none' })
      await refresh()
    } catch (e) {
      setMembersError(e instanceof Error ? e.message : String(e))
    } finally {
      setMembersSaving(false)
    }
  }

  async function onSubmitTeam(form: {
    id?: string
    name: string
    email?: string
    slack_handle?: string
    slack_channel?: string
    notion_workspace?: string
    is_client?: boolean
  }) {
    setSaving(true)
    setFormError(null)
    try {
      const token = await getAccessTokenSilently(AUDIENCE ? { authorizationParams: { audience: AUDIENCE } } : undefined)
      if (form.id) {
        await updateTeam(token, form.id, {
          name: form.name,
          email: form.email || undefined,
          slack_handle: form.slack_handle || undefined,
          slack_channel: form.slack_channel || undefined,
          notion_workspace: form.notion_workspace || undefined,
          is_client: form.is_client ?? false,
        })
      } else {
        await createTeam(token, {
          name: form.name,
          email: form.email || undefined,
          slack_handle: form.slack_handle || undefined,
          slack_channel: form.slack_channel || undefined,
          notion_workspace: form.notion_workspace || undefined,
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
            <h1 className="dashboard-main-title">Teams</h1>
            <p className="dashboard-main-subtitle">Manage teams in your organization.</p>
          </div>
          <div className="network-header-actions">
            <button type="button" className="btn btn-secondary" onClick={refresh} disabled={isLoading}>
              Refresh
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => setModal({ type: 'team', mode: 'create' })}
            >
              Add Team
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
          <p className="section-desc">Loading teams…</p>
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
                  <path d="M320 64C355.3 64 384 92.7 384 128C384 163.3 355.3 192 320 192C284.7 192 256 163.3 256 128C256 92.7 284.7 64 320 64zM416 376C416 401 403.3 423 384 435.9L384 528C384 554.5 362.5 576 336 576L304 576C277.5 576 256 554.5 256 528L256 435.9C236.7 423 224 401 224 376L224 336C224 283 267 240 320 240C373 240 416 283 416 336L416 376zM160 96C190.9 96 216 121.1 216 152C216 182.9 190.9 208 160 208C129.1 208 104 182.9 104 152C104 121.1 129.1 96 160 96zM176 336L176 368C176 400.5 188.1 430.1 208 452.7L208 528C208 529.2 208 530.5 208.1 531.7C199.6 539.3 188.4 544 176 544L144 544C117.5 544 96 522.5 96 496L96 439.4C76.9 428.4 64 407.7 64 384L64 352C64 299 107 256 160 256C172.7 256 184.8 258.5 195.9 262.9C183.3 284.3 176 309.3 176 336zM432 528L432 452.7C451.9 430.2 464 400.5 464 368L464 336C464 309.3 456.7 284.4 444.1 262.9C455.2 258.4 467.3 256 480 256C533 256 576 299 576 352L576 384C576 407.7 563.1 428.4 544 439.4L544 496C544 522.5 522.5 544 496 544L464 544C451.7 544 440.4 539.4 431.9 531.7C431.9 530.5 432 529.2 432 528zM480 96C510.9 96 536 121.1 536 152C536 182.9 510.9 208 480 208C449.1 208 424 182.9 424 152C424 121.1 449.1 96 480 96z" />
                </svg>
                <span>Teams</span>
              </h2>
              <div className="network-panel-controls">
                <input
                  className="actions-input network-search"
                  value={teamsQuery}
                  onChange={(e) => setTeamsQuery(e.target.value)}
                  placeholder="Search teams…"
                  aria-label="Search teams"
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
                    <th className="network-table-header-small">Channel</th>
                    <th className="network-table-header-small">Members</th>
                    <th className="network-table-header-small" />
                  </tr>
                </thead>
                <tbody>
                  {teamsPageData.items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="network-empty">No teams found.</td>
                    </tr>
                  ) : (
                    teamsPageData.items.map((t) => {
                      const members = (t.member_ids ?? []).map((id) => peopleById.get(id)?.name).filter(Boolean) as string[]
                      return (
                        <tr key={t.id}>
                          <td className="network-strong">{t.name}</td>
                          <td>{t.is_client ? 'Client' : 'Internal'}</td>
                          <td>{t.email ?? <span className="network-muted">—</span>}</td>
                          <td>{t.slack_handle ?? <span className="network-muted">—</span>}</td>
                          <td>{t.slack_channel ?? <span className="network-muted">—</span>}</td>
                          <td>
                            <span className="network-chip">{(t.member_ids ?? []).length}</span>
                            {members.length ? (
                              <span className="network-muted">
                                {' '}
                                · {members.slice(0, 2).join(', ')}
                                {members.length > 2 ? '…' : ''}
                              </span>
                            ) : null}
                          </td>
                          <td className="network-actions">
                            <button
                              type="button"
                              className="btn btn-secondary network-action-btn"
                              onClick={() => setModal({ type: 'team', mode: 'edit', initial: t })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary network-action-btn"
                              onClick={() => setModal({ type: 'teamMembers', team: t })}
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      )
                    })
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
                page={teamsPageData.page}
                totalPages={teamsPageData.totalPages}
                onPrev={() => setTeamsPage((p) => Math.max(1, p - 1))}
                onNext={() => setTeamsPage((p) => Math.min(teamsPageData.totalPages, p + 1))}
              />
            </div>
          </section>
        )}
      </div>

      {modal.type === 'team' && (
        <div className="network-modal-backdrop" role="dialog" aria-modal="true">
          <div className="network-modal">
            <div className="network-modal-header">
              <h3 className="network-modal-title">
                {modal.mode === 'create' ? 'Add Team' : 'Edit Team'}
              </h3>
              <button
                type="button"
                className="network-modal-close"
                onClick={() => setModal({ type: 'none' })}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="network-alert network-alert--error" role="alert">
                {formError}
              </div>
            )}

            <TeamForm
              key={(modal.initial?.id ?? 'new') + modal.mode}
              initial={modal.initial}
              saving={saving}
              onCancel={() => setModal({ type: 'none' })}
              onSubmit={onSubmitTeam}
            />
          </div>
        </div>
      )}

      {modal.type === 'teamMembers' && (
        <div className="network-modal-backdrop" role="dialog" aria-modal="true">
          <div className="network-modal">
            <div className="network-modal-header">
              <h3 className="network-modal-title">Configure Team</h3>
              <button
                type="button"
                className="network-modal-close"
                onClick={() => setModal({ type: 'none' })}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {membersError && (
              <div className="network-alert network-alert--error" role="alert">
                {membersError}
              </div>
            )}

            <TeamMembersForm
              team={modal.team}
              people={people}
              saving={membersSaving}
              onCancel={() => setModal({ type: 'none' })}
              onSave={onUpdateTeamMembers}
            />
          </div>
        </div>
      )}
    </>
  )
}

function TeamForm({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial?: NetworkTeam
  saving: boolean
  onCancel: () => void
  onSubmit: (data: {
    id?: string
    name: string
    email?: string
    slack_handle?: string
    slack_channel?: string
    notion_workspace?: string
    is_client?: boolean
  }) => void | Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [slackHandle, setSlackHandle] = useState(initial?.slack_handle ?? '')
  const [slackChannel, setSlackChannel] = useState(initial?.slack_channel ?? '')
  const [notion, setNotion] = useState(initial?.notion_workspace ?? '')
  const [isClient, setIsClient] = useState(Boolean(initial?.is_client))

  return (
    <form
      className="network-form"
      onSubmit={(e) => {
        e.preventDefault()
        const cleanedName = name.trim()
        if (!cleanedName) return
        onSubmit({
          id: initial?.id,
          name: cleanedName,
          email: email.trim() || undefined,
          slack_handle: slackHandle.trim() || undefined,
          slack_channel: slackChannel.trim() || undefined,
          notion_workspace: notion.trim() || undefined,
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
          <input className="actions-input" value={slackHandle} onChange={(e) => setSlackHandle(e.target.value)} placeholder="@team" />
        </label>
        <label className="actions-form-group">
          <span className="actions-label">Slack channel</span>
          <input className="actions-input" value={slackChannel} onChange={(e) => setSlackChannel(e.target.value)} placeholder="#channel" />
        </label>

        <label className="actions-form-group">
          <span className="actions-label">Notion workspace</span>
          <input className="actions-input" value={notion} onChange={(e) => setNotion(e.target.value)} />
        </label>

        <label className="network-checkbox">
          <input type="checkbox" checked={isClient} onChange={(e) => setIsClient(e.target.checked)} />
          <span>Is this a Client team?</span>
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

function TeamMembersForm({
  team,
  people,
  saving,
  onCancel,
  onSave,
}: {
  team: NetworkTeam
  people: NetworkPerson[]
  saving: boolean
  onCancel: () => void
  onSave: (team: NetworkTeam, memberIds: string[]) => void | Promise<void>
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(team.member_ids ?? []),
  )

  const togglePerson = (personId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(personId)) next.delete(personId)
      else next.add(personId)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(team, Array.from(selectedIds))
  }

  const sortedPeople = useMemo(
    () => [...people].sort((a, b) => a.name.localeCompare(b.name)),
    [people],
  )

  return (
    <form className="network-form" onSubmit={handleSubmit}>
      <div className="network-form-grid">
        <div className="actions-form-group" style={{ gridColumn: '1 / -1' }}>
          <span className="actions-label">Team</span>
          <div className="network-strong">{team.name}</div>
        </div>

        <div className="actions-form-group" style={{ gridColumn: '1 / -1', maxHeight: 260, overflow: 'auto' }}>
          <span className="actions-label">Members</span>
          <div className="network-members-list">
            {sortedPeople.map((person) => (
              <label key={person.id} className="network-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.has(person.id)}
                  onChange={() => togglePerson(person.id)}
                />
                <span>
                  {person.name}
                  {person.email ? (
                    <span className="network-muted"> — {person.email}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="network-form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}


