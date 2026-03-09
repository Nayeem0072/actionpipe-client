import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import type { MeUser } from '../api/me'
import { useLinkedPerson } from '../hooks/useLinkedPerson'
import { getDisplayName } from '../utils/displayName'

const sidebarNav = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    expanded: true,
    children: [
      { label: 'Overview', href: '/dashboard', activeMatch: '/dashboard' },
      { label: 'Reports', href: '/dashboard/reports' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    href: '/#features',
    icon: FeaturesIcon,
    children: [
      { label: 'Actions', href: '/dashboard/actions' },
    ],
  },
  {
    id: 'connections',
    label: 'Connections',
    href: '/#features',
    icon: IntegrationsIcon,
    children: [
      { label: 'Integrations', href: '/dashboard/integrations' },
    ],
  },
  {
    id: 'organization',
    label: 'Organization',
    href: '/#organization',
    icon: OrganizationIcon,
    children: [
      { label: 'People', href: '/dashboard/people' },
      { label: 'Teams', href: '/dashboard/teams' },
    ],
  },
  { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
]

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function FeaturesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function IntegrationsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" /><path d="m6.8 15-3.5 2" /><path d="m20.7 17-3.5-2" /><path d="M6.8 9 3.3 7" /><path d="m20.7 7-3.5 2" /><path d="M12 22v-4" /><path d="m17.2 15 3.5 2" /><path d="m17.2 9 3.5-2" /><path d="m8 12 4-4 4 4" />
    </svg>
  )
}

function OrganizationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <path d="M4 21v-2a4 4 0 0 1 4-4h2" />
      <path d="M20 21v-2a4 4 0 0 0-4-4h-2" />
    </svg>
  )
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}

interface DashboardSidebarProps {
  user: MeUser | { name?: string; email?: string; picture?: string } | null
  meUser: MeUser | null
}

export function DashboardSidebar({ user, meUser }: DashboardSidebarProps) {
  const [search, setSearch] = useState('')
  const location = useLocation()
  const { user: auth0User, logout } = useAuth0()
  const { linkedPerson } = useLinkedPerson(meUser)
  const effectiveUser = user ?? auth0User
  const isInNetwork = Boolean(meUser?.org_person_id)
  const networkLabel = linkedPerson
    ? `In network as ${linkedPerson.name}`
    : isInNetwork
      ? 'In contact network'
      : 'Account settings'
  const orgName = meUser?.org_name

  const getActiveParentId = (pathname: string) => {
    if (pathname === '/dashboard' || pathname.startsWith('/dashboard/reports')) return 'dashboard'
    if (pathname.startsWith('/dashboard/actions')) return 'features'
    if (pathname.startsWith('/dashboard/integrations')) return 'connections'
    if (pathname.startsWith('/dashboard/people') || pathname.startsWith('/dashboard/teams')) return 'organization'
    return null
  }

  const getInitialExpandedIds = (pathname: string) => {
    const set = new Set<string>()
    const activeParentId = getActiveParentId(pathname)
    if (activeParentId) {
      set.add(activeParentId)
    }
    return set
  }

  // Track which single drawer is expanded; start with only the active parent open (if any)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getInitialExpandedIds(location.pathname))

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set<string>()
      if (!prev.has(id)) {
        next.add(id)
      }
      return next
    })
  }

  const isActive = (href: string, activeMatch?: string) => {
    const path = location.pathname
    if (activeMatch) return path === activeMatch || (activeMatch !== '/dashboard' && path.startsWith(activeMatch + '/'))
    return path === href || (href !== '/dashboard' && path.startsWith(href + '/'))
  }

  const isChildActive = (child: { href: string; label: string }) => {
    if (child.label === 'Overview' && child.href === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname === child.href || location.pathname.startsWith(child.href + '/')
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-inner">
        <Link to="/" className="dashboard-sidebar-logo">
          <span className="logo-icon" aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="4" cy="12" r="2" />
              <path d="M7 12h6" />
              <circle cx="12" cy="12" r="2" />
              <path d="M14 12h7" />
              <circle cx="20" cy="12" r="2" />
            </svg>
          </span>
          <span className="logo-text">ActionPipe</span>
        </Link>

        <div className="dashboard-sidebar-search">
          <SearchIcon className="dashboard-sidebar-search-icon" />
          <input
            type="search"
            placeholder="Search for..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dashboard-sidebar-search-input"
            aria-label="Search"
          />
        </div>

        <nav className="dashboard-sidebar-nav">
          {sidebarNav.map((item) => {
            const hasChildren = 'children' in item && item.children?.length
            const isExpanded = expandedIds.has(item.id)
            const isParentActive = item.id === getActiveParentId(location.pathname)

            if (hasChildren) {
              return (
                <div key={item.id} className="dashboard-sidebar-group">
                  <button
                    type="button"
                    className={`dashboard-sidebar-link dashboard-sidebar-link-parent ${isParentActive ? 'is-active' : ''}`}
                    onClick={() => toggleExpanded(item.id)}
                    aria-expanded={isExpanded}
                  >
                    <span className="dashboard-sidebar-link-bg" />
                    <item.icon className="dashboard-sidebar-link-icon" />
                    <span className="dashboard-sidebar-link-label">{item.label}</span>
                    <ChevronDown className="dashboard-sidebar-chevron" />
                  </button>
                  {isExpanded && (
                    <div className="dashboard-sidebar-children">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href + child.label}
                          to={child.href}
                          className={`dashboard-sidebar-item ${isChildActive(child) ? 'is-active' : ''}`}
                        >
                          <span className="dashboard-sidebar-item-bg" />
                          <span className="dashboard-sidebar-item-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            const isLink = item.href.startsWith('/dashboard')
            const content = (
              <>
                <span className="dashboard-sidebar-link-bg" />
                <item.icon className="dashboard-sidebar-link-icon" />
                <span className="dashboard-sidebar-link-label">{item.label}</span>
                <ChevronRight className="dashboard-sidebar-chevron" />
              </>
            )

            if (isLink) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={`dashboard-sidebar-link ${isActive(item.href) ? 'is-active' : ''}`}
                >
                  {content}
                </Link>
              )
            }
            return (
              <a
                key={item.id}
                href={item.href}
                className="dashboard-sidebar-link"
              >
                {content}
              </a>
            )
          })}
        </nav>

        <div className="dashboard-sidebar-divider" aria-hidden />

        <div className="dashboard-sidebar-user">
          <div className="dashboard-sidebar-user-block">
            {effectiveUser?.picture && (
              <img
                src={effectiveUser.picture}
                alt=""
                width={32}
                height={32}
                className="dashboard-sidebar-user-avatar"
              />
            )}
            <div className="dashboard-sidebar-user-info">
              <span className="dashboard-sidebar-user-name">{getDisplayName(effectiveUser) || 'Account'}</span>
              <span className="dashboard-sidebar-user-meta">{networkLabel}</span>
            </div>
            <ChevronRight className="dashboard-sidebar-chevron" />
          </div>
          <button
            type="button"
            className="dashboard-sidebar-logout"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/logout' } })}
          >
            Log out
          </button>
        </div>

        {orgName && (
          <div className="dashboard-sidebar-org">
            <span className="dashboard-sidebar-user-meta">Organization</span>
            <div>
              <span
                className="dashboard-sidebar-org-label"
                style={{ color: 'var(--accent-color, var(--accent))' }}
              >
                <svg
                  className="dashboard-sidebar-org-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  aria-hidden="true"
                  fill="currentColor"
                  style={{ width: '1em', height: '1em', marginRight: 6, verticalAlign: 'middle' }}
                >
                  <path d="M144 96C117.5 96 96 117.5 96 144C96 170.5 117.5 192 144 192L296 192L296 232L248 280L176 280C136.2 280 104 312.2 104 352L104 416L96 416C78.3 416 64 430.3 64 448L64 512C64 529.7 78.3 544 96 544L160 544C177.7 544 192 529.7 192 512L192 448C192 430.3 177.7 416 160 416L152 416L152 352C152 338.7 162.7 328 176 328L248 328L296 376L296 416L288 416C270.3 416 256 430.3 256 448L256 512C256 529.7 270.3 544 288 544L352 544C369.7 544 384 529.7 384 512L384 448C384 430.3 369.7 416 352 416L344 416L344 376L392 328L464 328C477.3 328 488 338.7 488 352L488 416L480 416C462.3 416 448 430.3 448 448L448 512C448 529.7 462.3 544 480 544L544 544C561.7 544 576 529.7 576 512L576 448C576 430.3 561.7 416 544 416L536 416L536 352C536 312.2 503.8 280 464 280L392 280L344 232L344 192L496 192C522.5 192 544 170.5 544 144C544 117.5 522.5 96 496 96L144 96z" />
                </svg>
                <span className="dashboard-sidebar-org-name">{orgName}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
