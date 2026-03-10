import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div className="page">
      <header className="header header-scrolled">
        <div className="header-inner">
          <Link to="/" className="logo">
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
        </div>
      </header>

      <main className="main" style={{ maxWidth: 800, margin: '0 auto', padding: '120px 32px 80px' }}>
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>Privacy Policy</h1>
        <p className="section-desc" style={{ marginBottom: 48 }}>Last updated: March 10, 2026</p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>1. Overview</h2>
          <p className="section-desc">
            ActionPipe ("we", "us", "our") respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. By using the Service you agree to the practices described here.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>2. Information We Collect</h2>
          <p className="section-desc" style={{ marginBottom: 12 }}>
            <strong>Account information.</strong> When you sign in via Google OAuth, we receive your name, email address, and profile picture from Google. This is used solely to identify your account.
          </p>
          <p className="section-desc" style={{ marginBottom: 12 }}>
            <strong>OAuth tokens.</strong> When you connect third-party services (Slack, Google Calendar, Jira, Notion), we store the OAuth access tokens required to perform actions on your behalf. These tokens are encrypted at rest and never shared with other users.
          </p>
          <p className="section-desc">
            <strong>Usage data.</strong> We may collect anonymized logs of feature usage (e.g. number of actions extracted, integrations used) to improve the product. We do not log the content of your transcripts or action items beyond what is needed to process them in the moment.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>3. How We Use Your Information</h2>
          <p className="section-desc">
            We use the information we collect to authenticate you, execute integrations you've authorized (sending messages, creating calendar events, creating Jira issues, writing Notion pages), provide customer support, and improve the Service. We do not sell your personal data to third parties.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>4. Third-Party Services</h2>
          <p className="section-desc">
            ActionPipe integrates with Google, Slack, Atlassian, and Notion. When you authorize these integrations, those services' own privacy policies apply to data held on their platforms. We recommend reviewing each service's privacy policy independently. You can revoke ActionPipe's access at any time from the Integrations page or from the relevant service's connected apps settings.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>5. Data Retention</h2>
          <p className="section-desc">
            We retain your account data and OAuth tokens for as long as your account is active. You may delete your account and all associated data at any time by contacting us. Disconnecting an integration from the Integrations page immediately removes the stored token for that service.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>6. Security</h2>
          <p className="section-desc">
            We use industry-standard security practices including encrypted storage of credentials, HTTPS-only communication, and short-lived JWT tokens for API access. No system is completely secure; we encourage you to use a strong Google account password and enable two-factor authentication.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>7. Cookies and Local Storage</h2>
          <p className="section-desc">
            ActionPipe uses Auth0 for authentication, which may set cookies or use local storage to maintain your session. We do not use third-party advertising cookies. You can clear cookies at any time through your browser settings, though doing so will log you out.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>8. Your Rights</h2>
          <p className="section-desc">
            Depending on your jurisdiction you may have the right to access, correct, or delete your personal data; to object to or restrict processing; and to data portability. To exercise any of these rights, contact us using the information below.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>9. Children's Privacy</h2>
          <p className="section-desc">
            The Service is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If you believe we have inadvertently collected such information, please contact us so we can delete it.
          </p>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>10. Contact</h2>
          <p className="section-desc">
            If you have questions or requests regarding this Privacy Policy, please reach out via the contact information available on our website.
          </p>
        </section>

        <div style={{ display: 'flex', gap: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="link">← Back to home</Link>
          <Link to="/terms" className="link">Terms of Use</Link>
        </div>
      </main>

      <footer className="footer">
        <p className="footer-bottom" style={{ marginTop: 0 }}>
          ActionPipe — From meeting notes to done. &nbsp;·&nbsp;{' '}
          <Link to="/terms" style={{ color: 'inherit', textDecoration: 'underline' }}>Terms</Link>
          {' '}·{' '}
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy</Link>
        </p>
      </footer>
    </div>
  )
}
