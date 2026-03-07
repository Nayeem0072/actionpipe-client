import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { DashboardSidebar } from '../../../components/DashboardSidebar'
import { createRun, subscribeToRunStream, RunApiError } from '../../../api/runs'
import type { ProgressData, StepDoneData, AgentDoneData, ErrorData, RunCompleteData, ExecutorAction } from '../../../api/runs'

type StepStatus = 'pending' | 'done' | 'ongoing'

interface WorkingStep {
  id: string
  label: string
  status: StepStatus
  current?: number
  total?: number
}

interface AgentCardState {
  id: string
  name: string
  steps: WorkingStep[]
}

const INITIAL_EXTRACTOR_STEPS: WorkingStep[] = [
  { id: '1', label: 'Load transcript', status: 'pending' },
  { id: '2', label: 'Segmenter', status: 'pending' },
  { id: '3', label: 'Parallel extraction', status: 'pending' },
  { id: '4', label: 'Evidence normalizer', status: 'pending' },
  { id: '5', label: 'Cross-chunk resolver', status: 'pending' },
  { id: '6', label: 'Global deduplicator', status: 'pending' },
  { id: '7', label: 'Action finalizer', status: 'pending' },
]

const INITIAL_NORMALIZER_STEPS: WorkingStep[] = [
  { id: '1', label: 'Deadline normalizer', status: 'pending' },
  { id: '2', label: 'Verb enricher', status: 'pending' },
  { id: '3', label: 'Action splitter', status: 'pending' },
  { id: '4', label: 'Deduplicator', status: 'pending' },
  { id: '5', label: 'Tool classifier', status: 'pending' },
]

const INITIAL_EXECUTOR_STEPS: WorkingStep[] = [
  { id: '1', label: 'Contact resolver', status: 'pending' },
  { id: '2', label: 'MCP dispatcher', status: 'pending' },
]

function buildAgentState(
  extractor: WorkingStep[],
  normalizer: WorkingStep[],
  executor: WorkingStep[]
): AgentCardState[] {
  return [
    { id: 'extractor', name: 'Extractor Agent', steps: extractor },
    { id: 'normalizer', name: 'Normalizer Agent', steps: normalizer },
    { id: 'executor', name: 'Executor Agent', steps: executor },
  ]
}

// Map backend step names to our extractor step indices (0–6)
const EXTRACTOR_STEP_INDEX: Record<string, number> = {
  load_transcript: 0,
  segmenter: 1,
  parallel_extractor: 2,
  evidence_normalizer: 3,
  cross_chunk_resolver: 4,
  global_deduplicator: 5,
  action_finalizer: 6,
}

// Map backend step names to our normalizer step indices (0–4)
const NORMALIZER_STEP_INDEX: Record<string, number> = {
  deadline_normalizer: 0,
  verb_enricher: 1,
  action_splitter: 2,
  deduplicator: 3,
  tool_classifier: 4,
}

// Map backend step names to our executor step indices (0–1)
const EXECUTOR_STEP_INDEX: Record<string, number> = {
  contact_resolver: 0,
  mcp_dispatcher: 1,
}

/** Human-readable label for tool_type (e.g. send_email → "Send email") */
function formatToolTypeLabel(toolType: string): string {
  return toolType
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Human-readable label for param/label keys (e.g. due_date → "Due Date") */
function formatLabelKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/** Renders a param value in a readable way (e.g. participants as a list of "Name (email)") */
function ParamValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="actions-executor-param-na">N/A</span>
  if (typeof value === 'string') {
    if (value.trim() === '') return <span className="actions-executor-param-na">N/A</span>
    return <>{value}</>
  }
  if (typeof value === 'number' || typeof value === 'boolean') return <>{String(value)}</>
  if (Array.isArray(value)) {
    const hasNameEmail =
      value.length > 0 &&
      value.every(
        (item) =>
          item &&
          typeof item === 'object' &&
          'name' in item &&
          'email' in item
      )
    if (hasNameEmail) {
      const list = value as Array<{ name?: string; email?: string }>
      return (
        <span className="actions-executor-participants">
          {list.map((p, i) => (
            <span key={i}>
              {i > 0 && ', '}
              {p.name}
              {p.email ? (
                <>
                  {' '}
                  <em className="actions-executor-participants-email">({p.email})</em>
                </>
              ) : (
                ''
              )}
            </span>
          ))}
        </span>
      )
    }
    if (value.every((v) => typeof v === 'string')) {
      return (
        <ul className="actions-executor-param-list">
          {value.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )
    }
    return <>{JSON.stringify(value)}</>
  }
  if (typeof value === 'object') return <>{JSON.stringify(value)}</>
  return null
}

/** Icon for executor action type */
function ActionIcon({ toolType, server }: { toolType: string; server?: string }) {
  const className = 'actions-executor-card-icon-svg'
  const t = toolType.toLowerCase()
  const s = (server ?? '').toLowerCase()
  // Slack (chat): match by server or tool_type
  if (s.includes('slack') || t.includes('slack')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </svg>
    )
  }
  // Calendar: set_calendar_event, create_calendar_event, etc.
  if (t.includes('calendar')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  }
  // Notion: document (match by server or tool_type)
  if (s.includes('notion') || t.includes('notion')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  }
  // Jira: pen / edit (match by server or tool_type)
  if (s.includes('jira') || t.includes('jira')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    )
  }
  switch (toolType) {
    case 'send_email':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      )
    case 'create_calendar_event':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    case 'create_task':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7" />
        </svg>
      )
    case 'set_reminder':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      )
  }
}

export function ActionsPage() {
  const { user, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'pipeline' | 'actions'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [uploadFormKey, setUploadFormKey] = useState(0)
  const [meetingDate, setMeetingDate] = useState('')
  const [language, setLanguage] = useState('en')
  const [runError, setRunError] = useState<string | null>(null)
  const [runComplete, setRunComplete] = useState(false)
  const [runSummary, setRunSummary] = useState<RunCompleteData['summary']>(undefined)
  const [executorActions, setExecutorActions] = useState<ExecutorAction[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [agents, setAgents] = useState<AgentCardState[]>(() =>
    buildAgentState(
      INITIAL_EXTRACTOR_STEPS,
      INITIAL_NORMALIZER_STEPS,
      INITIAL_EXECUTOR_STEPS
    )
  )
  const unsubscribeStreamRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  // Apply SSE stream events to agent steps (extractor, normalizer, executor)
  const applyProgress = (data: ProgressData) => {
    const stepIndex =
      data.agent === 'extractor'
        ? EXTRACTOR_STEP_INDEX[data.step]
        : data.agent === 'normalizer'
          ? NORMALIZER_STEP_INDEX[data.step]
          : data.agent === 'executor'
            ? EXECUTOR_STEP_INDEX[data.step]
            : undefined
    if (stepIndex === undefined) return

    const agentId = data.agent
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a
        const steps = a.steps.map((s, i) => {
          if (i === stepIndex) {
            return {
              ...s,
              status: 'ongoing' as const,
              ...(data.current != null && { current: data.current }),
              ...(data.total != null && { total: data.total }),
            }
          }
          if (i < stepIndex && s.status !== 'done') {
            return { ...s, status: 'done' as const }
          }
          return s
        })
        return { ...a, steps }
      })
    )
  }

  const applyStepDone = (data: StepDoneData) => {
    const stepIndex =
      data.agent === 'extractor'
        ? EXTRACTOR_STEP_INDEX[data.step]
        : data.agent === 'normalizer'
          ? NORMALIZER_STEP_INDEX[data.step]
          : data.agent === 'executor'
            ? EXECUTOR_STEP_INDEX[data.step]
            : undefined
    if (stepIndex === undefined) return

    const agentId = data.agent
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a
        const agentSteps = a.steps
        const allPreviousDone = agentSteps
          .slice(0, stepIndex)
          .every((s) => s.status === 'done')
        if (!allPreviousDone) return a
        return {
          ...a,
          steps: agentSteps.map((s, i) =>
            i === stepIndex ? { ...s, status: 'done' as const } : s
          ),
        }
      })
    )
  }

  const applyAgentDone = (data: AgentDoneData) => {
    if (data.agent !== 'extractor' && data.agent !== 'normalizer' && data.agent !== 'executor') return
    setAgents((prev) =>
      prev.map((a) =>
        a.id === data.agent
          ? {
              ...a,
              steps: a.steps.map((s) =>
                s.status !== 'done' ? { ...s, status: 'done' as const } : s
              ),
            }
          : a
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setRunError(null)
    setIsSubmitting(true)
    try {
      const { runId } = await createRun({
        file,
        meetingDate: meetingDate || undefined,
        language: language || undefined,
      })
      setStep('pipeline')
      const unsubscribe = subscribeToRunStream(runId, {
        onProgress: applyProgress,
        onStepDone: applyStepDone,
        onAgentDone: applyAgentDone,
        onRunComplete: (data: RunCompleteData) => {
          setRunComplete(true)
          if (data.summary) setRunSummary(data.summary)
          if (data.executor_actions) setExecutorActions(data.executor_actions)
          if (data.executor_actions?.length) setStep('actions')
          unsubscribeStreamRef.current = null
        },
        onError: (data: ErrorData) => {
          setRunError(data.message || 'Pipeline error')
          unsubscribeStreamRef.current = null
        },
      })
      unsubscribeStreamRef.current = unsubscribe
    } catch (err) {
      const message =
        err instanceof RunApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to start run'
      setRunError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (unsubscribeStreamRef.current) {
      unsubscribeStreamRef.current()
      unsubscribeStreamRef.current = null
    }
    setStep('upload')
    setFile(null)
    setRunError(null)
    setRunComplete(false)
    setRunSummary(undefined)
    setExecutorActions([])
    setUploadFormKey((k) => k + 1)
    setAgents(
      buildAgentState(
        INITIAL_EXTRACTOR_STEPS,
        INITIAL_NORMALIZER_STEPS,
        INITIAL_EXECUTOR_STEPS
      )
    )
  }

  const extractorDone = agents.find((a) => a.id === 'extractor')?.steps.every((s) => s.status === 'done') ?? false
  const normalizerDone = agents.find((a) => a.id === 'normalizer')?.steps.every((s) => s.status === 'done') ?? false
  const executorDone = agents.find((a) => a.id === 'executor')?.steps.every((s) => s.status === 'done') ?? false
  const pipelineComplete =
    step === 'pipeline' &&
    (runComplete || (extractorDone && normalizerDone && executorDone))
  const activeStepNumber =
    step === 'upload' ? 1 : step === 'pipeline' ? 2 : 3

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
          <h1 className="dashboard-main-title">Actions</h1>
          <p className="dashboard-main-subtitle">
            Upload a meeting transcript and run the ActionPipe pipeline (extract → normalize → execute).
          </p>
        </header>
        <div className="dashboard-main-content">
          <nav className="actions-step-progress" aria-label="Progress">
            <ol className="actions-step-progress-list">
              <li className={`actions-step-progress-item ${activeStepNumber >= 1 ? 'is-active' : ''} ${activeStepNumber > 1 ? 'is-complete' : ''}`}>
                <span className="actions-step-progress-marker">1</span>
                <span className="actions-step-progress-label">Upload & details</span>
              </li>
              <li className={`actions-step-progress-connector ${activeStepNumber > 1 ? 'is-complete' : ''}`} aria-hidden />
              <li className={`actions-step-progress-item ${activeStepNumber >= 2 ? 'is-active' : ''} ${activeStepNumber > 2 ? 'is-complete' : ''}`}>
                <span className="actions-step-progress-marker">2</span>
                <span className="actions-step-progress-label">Pipeline</span>
              </li>
              <li className={`actions-step-progress-connector ${activeStepNumber > 2 ? 'is-complete' : ''}`} aria-hidden />
              <li className={`actions-step-progress-item ${activeStepNumber >= 3 ? 'is-active' : ''} ${activeStepNumber > 3 ? 'is-complete' : ''}`}>
                <span className="actions-step-progress-marker">3</span>
                <span className="actions-step-progress-label">Actions</span>
              </li>
            </ol>
          </nav>
          {step === 'upload' ? (
            <section className="section actions-upload-section">
              <h2 className="section-title">New Run</h2>
              <p className="section-desc">Select a meeting transcript and provide details. Then start the pipeline.</p>
              <form
                className="actions-upload-form"
                onSubmit={handleSubmit}
              >
                <div className="actions-upload-cards">
                  <div className="actions-upload-card ecosystem-card">
                    <h3 className="actions-card-heading">Upload</h3>
                    <div className="actions-form-group">
                      <label htmlFor="actions-file" className="actions-label">Meeting transcript</label>
                      <input
                        id="actions-file"
                        type="file"
                        key={uploadFormKey}
                        accept=".txt,.csv,.pdf,.doc,text/plain,text/csv,application/pdf,application/msword"
                        className="actions-file-input"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        required
                      />
                      <p className="actions-file-hint">only .txt, .csv, .pdf, .doc supported, max file size 15MB</p>
                      {file && (
                        <p className="actions-file-name">{file.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="actions-upload-card ecosystem-card">
                    <h3 className="actions-card-heading">Details</h3>
                    <div className="actions-details-row">
                      <div className="actions-form-group">
                        <label htmlFor="actions-date" className="actions-label">Meeting date</label>
                        <input
                          id="actions-date"
                          type="date"
                          className="actions-input"
                          value={meetingDate}
                          onChange={(e) => setMeetingDate(e.target.value)}
                        />
                      </div>
                      <div className="actions-form-group">
                        <label htmlFor="actions-language" className="actions-label">Language</label>
                        <select
                          id="actions-language"
                          className="actions-select"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="bn">Bangla</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="actions-upload-actions">
                  {runError && (
                    <p className="actions-run-error" role="alert">
                      {runError}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Starting…' : 'Next — Start pipeline'}
                  </button>
                </div>
              </form>
            </section>
          ) : step === 'pipeline' ? (
            <section className="section actions-pipeline-section">
              <div className="actions-pipeline-header">
                <h2 className="section-title">Pipeline Run</h2>
                <p className="section-desc">Agents run in order: Extractor → Normalizer → Executor.</p>
                {pipelineComplete && runSummary && (
                  <p className="actions-run-summary" role="status">
                    {runSummary.actions_extracted != null && (
                      <>Actions extracted: {runSummary.actions_extracted}</>
                    )}
                    {runSummary.actions_extracted != null && (runSummary.actions_normalized != null || runSummary.actions_executed != null) && ' · '}
                    {runSummary.actions_normalized != null && (
                      <>Actions normalized: {runSummary.actions_normalized}</>
                    )}
                    {runSummary.actions_normalized != null && runSummary.actions_executed != null && ' · '}
                    {runSummary.actions_executed != null && (
                      <>Actions executed: {runSummary.actions_executed}</>
                    )}
                  </p>
                )}
                {runError && (
                  <p className="actions-run-error" role="alert">
                    {runError}
                  </p>
                )}
                <div className="actions-pipeline-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleBack}>
                    Back to upload
                  </button>
                  {pipelineComplete && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setStep('actions')}
                    >
                      Next — View actions
                    </button>
                  )}
                </div>
              </div>
              <div className="actions-agent-cards">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </section>
          ) : (
            <section className="section actions-actions-section">
              <h2 className="section-title">Actions</h2>
              <p className="section-desc">Actions sent to the executor. Use the button to run or preview.</p>
              <button type="button" className="btn btn-secondary actions-back-btn" onClick={() => setStep('pipeline')}>
                Back to pipeline
              </button>
              <p className="actions-executor-total" role="status">
                Total actions extracted: <b>{executorActions.length}</b>
              </p>
              <ul className="actions-executor-list-items">
                {executorActions.map((action) => (
                  <li key={action.id} className="actions-executor-list-item">
                    <div className="actions-executor-card ecosystem-card">
                      <div className="actions-executor-card-icon">
                        <ActionIcon toolType={action.tool_type} server={action.server} />
                      </div>
                      <div className="actions-executor-card-body">
                        {action.params && typeof action.params === 'object' && (() => {
                          const entries = Object.entries(action.params).filter(([key]) => key !== 'labels')
                          if (entries.length === 0) return null
                          return (
                            <dl className="actions-executor-params">
                              {entries.map(([key, value]) => (
                                <div key={key} className="actions-executor-param">
                                  <dt className="actions-executor-param-key">{formatLabelKey(key)}</dt>
                                  <dd className="actions-executor-param-value">
                                    <ParamValue value={value} />
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          )
                        })()}
                        <div className="actions-executor-meta">
                          <span className={`actions-executor-status actions-executor-status--${action.status}`}>
                            {formatLabelKey(action.status)}
                          </span>
                          {(action.labels ?? (Array.isArray(action.params?.labels) ? (action.params.labels as string[]) : [])).map((label) => (
                            <span key={label} className="actions-executor-status actions-executor-status--label">
                              {formatLabelKey(label)}
                            </span>
                          ))}
                          {action.error && (
                            <span className="actions-executor-error">{action.error}</span>
                          )}
                        </div>
                      </div>
                      <div className="actions-executor-card-actions">
                        <button type="button" className="btn btn-primary actions-executor-btn actions-executor-btn-action">
                          Accept
                        </button>
                        <button type="button" className="btn actions-executor-btn actions-executor-btn-modify">
                          Modify
                        </button>
                        <button type="button" className="btn actions-executor-btn actions-executor-btn-reject">
                          Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

function AgentCard({ agent }: { agent: AgentCardState }) {
  const hasOngoing = agent.steps.some((s) => s.status === 'ongoing')
  const allDone = agent.steps.every((s) => s.status === 'done')
  const statusLabel = allDone ? 'Done' : hasOngoing ? 'Running' : 'Pending'

  return (
    <div
      className={`actions-agent-card ecosystem-card ${hasOngoing ? 'is-running' : ''} ${allDone ? 'is-done' : ''}`}
    >
      <div className="actions-agent-card-header">
        <h3 className="actions-agent-card-title">{agent.name}</h3>
        <span className={`actions-agent-card-badge actions-agent-card-badge--${allDone ? 'done' : hasOngoing ? 'running' : 'pending'}`}>
          {statusLabel}
        </span>
      </div>
      <ul className="actions-agent-steps">
        {agent.steps.map((s) => (
          <li
            key={s.id}
            className={`actions-agent-step actions-agent-step--${s.status}`}
          >
            <StepIcon status={s.status} />
            <span className="actions-agent-step-label">
              {s.label}
              {s.status === 'ongoing' && s.total != null && s.total > 0 && (
                <span className="actions-agent-step-progress">
                  {' '}
                  — {s.current ?? 0}/{s.total}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <span className="actions-step-icon actions-step-icon--done" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    )
  }
  if (status === 'ongoing') {
    return (
      <span className="actions-step-icon actions-step-icon--ongoing" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </span>
    )
  }
  return (
    <span className="actions-step-icon actions-step-icon--pending" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
      </svg>
    </span>
  )
}
