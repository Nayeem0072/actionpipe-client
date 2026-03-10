const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export function getApiBase(): string {
  return API_BASE.replace(/\/$/, '')
}

/**
 * Returns headers that should be included in every API request.
 * Includes the ngrok bypass header so the free-tier warning page is never
 * served in place of actual API responses.
 */
export function getBaseHeaders(): Record<string, string> {
  return {
    'ngrok-skip-browser-warning': 'true',
  }
}
