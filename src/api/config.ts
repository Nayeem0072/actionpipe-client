const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, '')
}
