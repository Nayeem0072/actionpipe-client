import { getApiBase } from './config'

export interface CreateRunResponse {
  runId: string
  streamUrl: string
}

export interface CreateRunOptions {
  file: File
  meetingDate?: string
  language?: string
}

/**
 * Create a pipeline run via POST /runs (multipart).
 * Returns runId and streamUrl for SSE consumption.
 */
export async function createRun(options: CreateRunOptions): Promise<CreateRunResponse> {
  const base = getApiBase()
  const form = new FormData()
  form.append('file', options.file)
  if (options.meetingDate) form.append('meetingDate', options.meetingDate)
  if (options.language) form.append('language', options.language)

  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const json = JSON.parse(text) as { detail?: string; message?: string }
      message = json.detail ?? json.message ?? text
    } catch {
      // use text as-is
    }
    throw new RunApiError(res.status, message)
  }

  return res.json() as Promise<CreateRunResponse>
}

export class RunApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'RunApiError'
  }
}

// --- SSE stream types (match backend events) ---

export type StreamAgent = 'extractor' | 'normalizer' | 'executor'

export interface ProgressData {
  agent: StreamAgent
  step: string
  status: string
  current?: number
  total?: number
}

export interface StepDoneData {
  agent: StreamAgent
  step: string
}

export interface AgentDoneData {
  agent: StreamAgent
}

export interface RunCompleteData {
  summary?: {
    actions_extracted?: number
    actions_normalized?: number
    [key: string]: unknown
  }
}

export interface ErrorData {
  message: string
  code?: string
  agent?: string
  step?: string
}

export type StreamEvent =
  | { type: 'progress'; data: ProgressData }
  | { type: 'step_done'; data: StepDoneData }
  | { type: 'agent_done'; data: AgentDoneData }
  | { type: 'run_complete'; data: RunCompleteData }
  | { type: 'error'; data: ErrorData }

export interface StreamCallbacks {
  onProgress?(data: ProgressData): void
  onStepDone?(data: StepDoneData): void
  onAgentDone?(data: AgentDoneData): void
  onRunComplete?(data: RunCompleteData): void
  onError?(data: ErrorData): void
}

/**
 * Subscribe to GET /runs/{runId}/stream via EventSource.
 * Calls the appropriate callback for each SSE event type.
 * Returns an unsubscribe function.
 */
export function subscribeToRunStream(runId: string, callbacks: StreamCallbacks): () => void {
  const base = getApiBase()
  const url = `${base}/runs/${runId}/stream`
  const es = new EventSource(url)

  function handleEvent(event: MessageEvent<string>) {
    try {
      const data = JSON.parse(event.data) as unknown
      const eventType = (event.type || 'message') as string

      switch (eventType) {
        case 'progress':
          callbacks.onProgress?.(data as ProgressData)
          break
        case 'step_done':
          callbacks.onStepDone?.(data as StepDoneData)
          break
        case 'agent_done':
          callbacks.onAgentDone?.(data as AgentDoneData)
          break
        case 'run_complete':
          callbacks.onRunComplete?.(data as RunCompleteData)
          es.close()
          break
        case 'error':
          callbacks.onError?.(data as ErrorData)
          es.close()
          break
        default:
          // e.g. default "message" event might carry run_complete
          if (data && typeof data === 'object' && 'message' in data) {
            callbacks.onError?.(data as ErrorData)
            es.close()
          }
      }
    } catch (e) {
      console.error('SSE parse error', e)
    }
  }

  es.addEventListener('progress', handleEvent)
  es.addEventListener('step_done', handleEvent)
  es.addEventListener('agent_done', handleEvent)
  es.addEventListener('run_complete', handleEvent)
  es.addEventListener('error', (e) => {
    if (e.data) handleEvent(e as MessageEvent<string>)
    else callbacks.onError?.({ message: 'Stream connection failed' })
    es.close()
  })

  return () => es.close()
}
