import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { DashboardSidebar } from '../../../components/DashboardSidebar'

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
  { id: '2', label: 'Split into chunks', status: 'pending' },
  { id: '3', label: 'Process chunks', status: 'pending', current: 0, total: 11 },
  { id: '4', label: 'Extract action items', status: 'pending' },
  { id: '5', label: 'Write raw actions', status: 'pending' },
]

const INITIAL_NORMALIZER_STEPS: WorkingStep[] = [
  { id: '1', label: 'Receive raw actions', status: 'pending' },
  { id: '2', label: 'Classify tools', status: 'pending' },
  { id: '3', label: 'Resolve contacts', status: 'pending' },
  { id: '4', label: 'Normalize payloads', status: 'pending' },
]

const INITIAL_EXECUTOR_STEPS: WorkingStep[] = [
  { id: '1', label: 'Receive normalized actions', status: 'pending' },
  { id: '2', label: 'Dry-run preview', status: 'pending' },
  { id: '3', label: 'Execute (or skip)', status: 'pending' },
]

function buildAgentState(
  extractor: WorkingStep[],
  normalizer: WorkingStep[],
  executor: WorkingStep[]
): AgentCardState[] {
  return [
    { id: 'extractor', name: 'Extractor agent', steps: extractor },
    { id: 'normalizer', name: 'Normalizer agent', steps: normalizer },
    { id: 'executor', name: 'Executor agent', steps: executor },
  ]
}

export function ActionsPage() {
  const { user, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'pipeline'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [meetingDate, setMeetingDate] = useState('')
  const [language, setLanguage] = useState('en')
  const [agents, setAgents] = useState<AgentCardState[]>(() =>
    buildAgentState(
      INITIAL_EXTRACTOR_STEPS,
      INITIAL_NORMALIZER_STEPS,
      INITIAL_EXECUTOR_STEPS
    )
  )

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/', { replace: true })
    }
  }, [isLoading, user, navigate])

  // Simulate pipeline: advance through extractor → normalizer → executor
  useEffect(() => {
    if (step !== 'pipeline') return

    const extractorSequence: { at: number; update: (s: WorkingStep[]) => WorkingStep[] }[] = [
      { at: 0, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 400, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'done' as const } : i === 1 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 800, update: (s) => s.map((x, i) => (i === 1 ? { ...x, status: 'done' as const } : i === 2 ? { ...x, status: 'ongoing' as const, current: 0, total: 11 } : x)) },
      { at: 1200, update: (s) => s.map((x, i) => (i === 2 ? { ...x, current: 3, total: 11 } : x)) },
      { at: 1600, update: (s) => s.map((x, i) => (i === 2 ? { ...x, current: 6, total: 11 } : x)) },
      { at: 2000, update: (s) => s.map((x, i) => (i === 2 ? { ...x, current: 11, total: 11, status: 'done' as const } : i === 3 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 2600, update: (s) => s.map((x, i) => (i === 3 ? { ...x, status: 'done' as const } : i === 4 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 3200, update: (s) => s.map((x, i) => (i === 4 ? { ...x, status: 'done' as const } : x)) },
    ]

    const normalizerSequence: { at: number; update: (s: WorkingStep[]) => WorkingStep[] }[] = [
      { at: 3500, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 4000, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'done' as const } : i === 1 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 4800, update: (s) => s.map((x, i) => (i === 1 ? { ...x, status: 'done' as const } : i === 2 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 5600, update: (s) => s.map((x, i) => (i === 2 ? { ...x, status: 'done' as const } : i === 3 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 6200, update: (s) => s.map((x, i) => (i === 3 ? { ...x, status: 'done' as const } : x)) },
    ]

    const executorSequence: { at: number; update: (s: WorkingStep[]) => WorkingStep[] }[] = [
      { at: 6600, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 7200, update: (s) => s.map((x, i) => (i === 0 ? { ...x, status: 'done' as const } : i === 1 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 8000, update: (s) => s.map((x, i) => (i === 1 ? { ...x, status: 'done' as const } : i === 2 ? { ...x, status: 'ongoing' as const } : x)) },
      { at: 8600, update: (s) => s.map((x, i) => (i === 2 ? { ...x, status: 'done' as const } : x)) },
    ]

    const allDelays = [
      ...extractorSequence.map((e) => ({ agent: 'extractor' as const, ...e })),
      ...normalizerSequence.map((e) => ({ agent: 'normalizer' as const, ...e })),
      ...executorSequence.map((e) => ({ agent: 'executor' as const, ...e })),
    ].sort((a, b) => a.at - b.at)

    const timers: ReturnType<typeof setTimeout>[] = []
    allDelays.forEach(({ at, agent, update }) => {
      const t = setTimeout(() => {
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agent ? { ...a, steps: update(a.steps) } : a
          )
        )
      }, at)
      timers.push(t)
    })
    return () => timers.forEach(clearTimeout)
  }, [step])

  const handleNext = () => {
    setStep('pipeline')
  }

  const handleBack = () => {
    setStep('upload')
    setAgents(
      buildAgentState(
        INITIAL_EXTRACTOR_STEPS,
        INITIAL_NORMALIZER_STEPS,
        INITIAL_EXECUTOR_STEPS
      )
    )
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
          <h1 className="dashboard-main-title">Actions</h1>
          <p className="dashboard-main-subtitle">
            Upload a meeting transcript and run the ActionPipe pipeline (extract → normalize → execute).
          </p>
        </header>
        <div className="dashboard-main-content">
          {step === 'upload' ? (
            <section className="section actions-upload-section">
              <h2 className="section-title">New run</h2>
              <p className="section-desc">Select a meeting transcript and provide details. Then start the pipeline.</p>
              <form
                className="actions-upload-form"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleNext()
                }}
              >
                <div className="actions-upload-cards">
                  <div className="actions-upload-card ecosystem-card">
                    <h3 className="actions-card-heading">Upload</h3>
                    <div className="actions-form-group">
                      <label htmlFor="actions-file" className="actions-label">Meeting transcript</label>
                      <input
                        id="actions-file"
                        type="file"
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
                          required
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
                  <button type="submit" className="btn btn-primary">
                    Next — Start pipeline
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <section className="section actions-pipeline-section">
              <div className="actions-pipeline-header">
                <h2 className="section-title">Pipeline run</h2>
                <p className="section-desc">Agents run in order: Extractor → Normalizer → Executor.</p>
                <button type="button" className="btn btn-secondary" onClick={handleBack}>
                  Back to upload
                </button>
              </div>
              <div className="actions-agent-cards">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
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
              {s.status === 'ongoing' && s.total != null && (
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
