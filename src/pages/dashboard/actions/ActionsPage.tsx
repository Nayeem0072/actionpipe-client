import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { DashboardSidebar } from '../../../components/DashboardSidebar'
import { createRun, subscribeToRunStream, RunApiError } from '../../../api/runs'
import type { ProgressData, StepDoneData, AgentDoneData, ErrorData, RunCompleteData } from '../../../api/runs'

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

export function ActionsPage() {
  const { user, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'pipeline'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [uploadFormKey, setUploadFormKey] = useState(0)
  const [meetingDate, setMeetingDate] = useState('')
  const [language, setLanguage] = useState('en')
  const [runError, setRunError] = useState<string | null>(null)
  const [runComplete, setRunComplete] = useState(false)
  const [runSummary, setRunSummary] = useState<RunCompleteData['summary']>(undefined)
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

  // Apply SSE stream events to agent steps (extractor and normalizer)
  const applyProgress = (data: ProgressData) => {
    const isExtractor = data.agent === 'extractor'
    const isNormalizer = data.agent === 'normalizer'
    if (!isExtractor && !isNormalizer) return

    const stepIndex = isExtractor
      ? EXTRACTOR_STEP_INDEX[data.step]
      : NORMALIZER_STEP_INDEX[data.step]
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
    const isExtractor = data.agent === 'extractor'
    const isNormalizer = data.agent === 'normalizer'
    if (!isExtractor && !isNormalizer) return

    const stepIndex = isExtractor
      ? EXTRACTOR_STEP_INDEX[data.step]
      : NORMALIZER_STEP_INDEX[data.step]
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
    if (data.agent !== 'extractor' && data.agent !== 'normalizer') return
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
  const pipelineComplete =
    step === 'pipeline' &&
    (runComplete || (extractorDone && normalizerDone))
  const activeStepNumber = step === 'upload' ? 1 : pipelineComplete ? 3 : 2

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
                <span className="actions-step-progress-label">Complete</span>
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
          ) : (
            <section className="section actions-pipeline-section">
              <div className="actions-pipeline-header">
                <h2 className="section-title">Pipeline Run</h2>
                <p className="section-desc">Agents run in order: Extractor → Normalizer → Executor.</p>
                {pipelineComplete && runSummary && (
                  <p className="actions-run-summary" role="status">
                    {runSummary.actions_extracted != null && (
                      <>Actions extracted: {runSummary.actions_extracted}</>
                    )}
                    {runSummary.actions_extracted != null && runSummary.actions_normalized != null && ' · '}
                    {runSummary.actions_normalized != null && (
                      <>Actions normalized: {runSummary.actions_normalized}</>
                    )}
                  </p>
                )}
                {runError && (
                  <p className="actions-run-error" role="alert">
                    {runError}
                  </p>
                )}
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
