import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

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
    id: 'integrations',
    label: 'Integrations',
    href: '/#features',
    icon: IntegrationsIcon,
    children: [
      { label: 'Connections', href: '/dashboard/connections' },
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

export function DashboardSidebar() {
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['dashboard']))
  const { user, logout } = useAuth0()
  const location = useLocation()

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
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
            const isParentActive =
              (item.href === '/dashboard' && location.pathname.startsWith('/dashboard')) ||
              (item.id === 'features' && location.pathname.startsWith('/dashboard/actions')) ||
              (item.id === 'integrations' && location.pathname.startsWith('/dashboard/connections'))

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
            {user?.picture && (
              <img
                src={user.picture}
                alt=""
                width={32}
                height={32}
                className="dashboard-sidebar-user-avatar"
              />
            )}
            <div className="dashboard-sidebar-user-info">
              <span className="dashboard-sidebar-user-name">{user?.name ?? user?.email ?? 'Account'}</span>
              <span className="dashboard-sidebar-user-meta">Account settings</span>
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
      </div>
    </aside>
  )
}
