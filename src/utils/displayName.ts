/**
 * Auth0 sub identifiers look like "google-oauth2|123456@auth0.user".
 * When the backend returns sub as "name", we should show email or a fallback instead.
 */
function isAuth0Sub(value: string): boolean {
  return /^\S+\|\S+@auth0\.user$/i.test(value) || (value.includes('|') && value.includes('@auth0.user'))
}

export interface UserWithDisplay {
  name?: string | null
  email?: string | null
}

/**
 * Returns a display name for the user. Prefers name unless it looks like an Auth0 sub.
 */
export function getDisplayName(user: UserWithDisplay | null | undefined): string {
  if (!user) return ''
  const name = user.name?.trim()
  const email = user.email?.trim()
  if (name && !isAuth0Sub(name)) return name
  if (email) return email
  return ''
}
