import { getApiBase, getBaseHeaders } from './config'

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
 * Sends the access token so the backend can identify the user.
 */
export async function createRun(
  options: CreateRunOptions,
  accessToken: string
): Promise<CreateRunResponse> {
  const base = getApiBase()
  const form = new FormData()
  form.append('file', options.file)
  if (options.meetingDate) form.append('meetingDate', options.meetingDate)
  if (options.language) form.append('language', options.language)

  const res = await fetch(`${base}/runs`, {
    method: 'POST',
    headers: {
      ...getBaseHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
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

/** One action sent to the executor; included in run_complete.executor_actions */
export interface ExecutorAction {
  id: string
  tool_type: string
  server: string
  mcp_tool: string
  params: Record<string, unknown>
  status: 'success' | 'dry_run' | 'skipped' | 'error'
  response: Record<string, unknown> | null
  error: string | null
  labels?: string[]
  /** Jira: display name of the assignee */
  assignee_display_name?: string
  /** Jira: assignee user/account id (backend sends as assignee) */
  assignee?: string
  /** Slack: display name of the recipient */
  recipient_display_name?: string
  /** Slack: recipient user id (backend sends as recipient, e.g. U0AKYDAC3U4) */
  recipient?: string
}

export interface RunCompleteData {
  summary?: {
    actions_extracted?: number
    actions_normalized?: number
    actions_executed?: number
    [key: string]: unknown
  }
  executor_actions?: ExecutorAction[]
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

function dispatchStreamEvent(
  eventType: string,
  rawData: string,
  callbacks: StreamCallbacks
): boolean {
  try {
    const data = JSON.parse(rawData) as unknown

    switch (eventType) {
      case 'progress':
        callbacks.onProgress?.(data as ProgressData)
        return false
      case 'step_done':
        callbacks.onStepDone?.(data as StepDoneData)
        return false
      case 'agent_done':
        callbacks.onAgentDone?.(data as AgentDoneData)
        return false
      case 'run_complete':
        callbacks.onRunComplete?.(data as RunCompleteData)
        return true
      case 'error':
        callbacks.onError?.(data as ErrorData)
        return true
      default:
        // Some servers may emit unnamed events with error-shaped payloads.
        if (data && typeof data === 'object' && 'message' in data) {
          callbacks.onError?.(data as ErrorData)
          return true
        }
        return false
    }
  } catch (e) {
    console.error('SSE parse error', e)
    return false
  }
}

function processSseChunk(chunk: string, callbacks: StreamCallbacks): boolean {
  let eventType = 'message'
  const dataLines: string[] = []

  for (const line of chunk.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue

    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim() || 'message'
      continue
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  if (dataLines.length === 0) return false
  return dispatchStreamEvent(eventType, dataLines.join('\n'), callbacks)
}

/**
 * Subscribe to GET /runs/{runId}/stream via fetch + ReadableStream.
 * This allows sending ngrok bypass headers that EventSource cannot attach.
 * Calls the appropriate callback for each SSE event type.
 * Returns an unsubscribe function.
 */
export function subscribeToRunStream(
  runId: string,
  accessToken: string,
  callbacks: StreamCallbacks
): () => void {
  const base = getApiBase()
  const url = `${base}/runs/${runId}/stream?token=${encodeURIComponent(accessToken)}`
  const controller = new AbortController()
  let closed = false

  void (async () => {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getBaseHeaders(),
          Authorization: `Bearer ${accessToken}`,
          Accept: 'text/event-stream',
        },
        signal: controller.signal,
      })

      if (!res.ok) {
        const message = await res.text()
        if (!closed) {
          callbacks.onError?.({
            message: message || `Stream connection failed (${res.status} ${res.statusText})`,
          })
        }
        return
      }

      if (!res.body) {
        if (!closed) callbacks.onError?.({ message: 'Stream response had no body' })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!closed) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split(/\r?\n\r?\n/)
        buffer = chunks.pop() ?? ''

        for (const chunk of chunks) {
          if (processSseChunk(chunk, callbacks)) {
            closed = true
            controller.abort()
            return
          }
        }
      }

      buffer += decoder.decode()
      if (!closed && buffer.trim()) {
        processSseChunk(buffer, callbacks)
      }
    } catch (error) {
      if (closed || controller.signal.aborted) return

      const message =
        error instanceof Error ? error.message : 'Stream connection failed'
      callbacks.onError?.({ message })
    }
  })()

  return () => {
    closed = true
    controller.abort()
  }
}
