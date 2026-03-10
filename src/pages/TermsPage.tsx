import { Link } from 'react-router-dom'

export function TermsPage() {
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
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>Terms of Use</h1>
        <p className="section-desc" style={{ marginBottom: 48 }}>Last updated: March 10, 2026</p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>1. Acceptance of Terms</h2>
          <p className="section-desc">
            By accessing or using ActionPipe ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time; continued use of the Service constitutes acceptance of any changes.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>2. Description of Service</h2>
          <p className="section-desc">
            ActionPipe is a pipeline tool that extracts, normalizes, and executes action items from meeting transcripts. The Service integrates with third-party platforms including Google Calendar, Gmail, Slack, Jira, and Notion via OAuth. ActionPipe acts solely as a facilitator; we do not store transcript content beyond what is necessary to process your requests.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>3. Accounts and Authentication</h2>
          <p className="section-desc">
            Access to ActionPipe requires authentication via Google OAuth through Auth0. You are responsible for maintaining the security of your account and for all activity that occurs under it. You must notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>4. Third-Party Integrations</h2>
          <p className="section-desc">
            ActionPipe connects to third-party services (Slack, Google Calendar, Jira, Notion) using OAuth tokens you authorize. By connecting these services you grant ActionPipe permission to perform actions on your behalf as described in each integration's scope. You may revoke access at any time from the Integrations page or directly from the third-party service's settings.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>5. Acceptable Use</h2>
          <p className="section-desc">
            You agree not to use the Service to transmit unlawful, harmful, or offensive content; to attempt unauthorized access to any system; to interfere with the Service's availability; or to reverse-engineer any part of the platform. We reserve the right to suspend or terminate accounts that violate these conditions.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>6. Intellectual Property</h2>
          <p className="section-desc">
            All content, branding, and code comprising ActionPipe is the property of ActionPipe and its contributors. You retain ownership of all transcript data and content you submit. By using the Service, you grant us a limited license to process your content solely for the purpose of providing the Service.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>7. Disclaimer of Warranties</h2>
          <p className="section-desc">
            The Service is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the Service will be error-free, uninterrupted, or that results obtained from it will be accurate. Use of the Service is at your own risk.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>8. Limitation of Liability</h2>
          <p className="section-desc">
            To the fullest extent permitted by law, ActionPipe shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of data, loss of profits, or business interruption.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>9. Governing Law</h2>
          <p className="section-desc">
            These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts.
          </p>
        </section>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>10. Contact</h2>
          <p className="section-desc">
            If you have questions about these Terms, please reach out via the contact information available on our website.
          </p>
        </section>

        <div style={{ display: 'flex', gap: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <Link to="/" className="link">← Back to home</Link>
          <Link to="/privacy" className="link">Privacy Policy</Link>
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
