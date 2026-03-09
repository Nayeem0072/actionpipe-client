import { useEffect } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { LandingPage } from './pages/landing'
import { DashboardLayout } from './components/DashboardLayout'
import { DashboardPage, ActionsPage, IntegrationsPage, PeoplePage, TeamsPage } from './pages/dashboard'
import './App.css'

function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p className="section-desc">Completing login…</p>
    </div>
  )
}

function LogoutPage() {
  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <p className="section-desc">You have been logged out.</p>
      <Link to="/" className="btn-header">Back to home</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="actions" element={<ActionsPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="teams" element={<TeamsPage />} />
      </Route>
      <Route path="/logout" element={<LogoutPage />} />
    </Routes>
  )
}

export default App
