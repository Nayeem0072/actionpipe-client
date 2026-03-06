import './App.css'

function App() {
  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <a href="#" className="logo">
            <span className="logo-icon">→</span>
            <span>Meeting Action Extractor</span>
          </a>
          <nav className="nav">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#try-it">Try it</a>
            <span className="nav-divider" aria-hidden />
          </nav>
          <a href="#try-it" className="btn-header">Sign Up Now</a>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="hero-badge">Turn meeting transcripts into done</p>
          <div className="hero-content">
            <h1 className="hero-title">
              From meeting notes to done — automatically.
            </h1>
            <p className="hero-desc">
              Extract structured action items from raw transcripts, normalize them into ready-to-run tool calls, and execute with one click. Emails, calendar events, Jira tasks, Slack messages, and Notion docs — powered by your choice of LLM (Gemini, Claude, or fully local with Ollama).
            </p>
          </div>
          <div className="hero-cta">
            <div className="hero-cta-row">
              <input
                type="email"
                className="hero-input"
                placeholder="Enter email"
                aria-label="Email address"
              />
              <a href="#try-it" className="btn-header">Sign Up Now</a>
            </div>
            <p className="hero-hint">We care about your data. See our privacy policy.</p>
          </div>
        </section>

        <section className="section value">
          <h2 className="section-title">Why it matters</h2>
          <ul className="value-list">
            <li>
              <strong>No manual triage</strong> — The pipeline finds actions, assigns tools, resolves “who” and “where” from your contact graph, and can run them via MCP or your own APIs.
            </li>
            <li>
              <strong>Preview before sending</strong> — Dry-run shows exactly what would be sent; users verify, then execute with one click.
            </li>
            <li>
              <strong>Works your way</strong> — Run in the cloud (Gemini/Claude) or fully on-device with Ollama; no lock-in.
            </li>
          </ul>
        </section>

        <section id="how-it-works" className="section steps">
          <h2 className="section-title">How it works</h2>
          <ol className="steps-list">
            <li className="step">
              <span className="step-num">1</span>
              <div>
                <h3>Extract</h3>
                <p>Upload a transcript. The pipeline chunks it, filters noise, and extracts action items in parallel. Descriptions are self-contained; cross-chunk references and duplicates are merged.</p>
              </div>
            </li>
            <li className="step">
              <span className="step-num">2</span>
              <div>
                <h3>Normalize</h3>
                <p>Each action gets a tool type (email, calendar, Jira, Slack, Notion), structured params, and normalized deadlines. Rules handle most cases; the LLM is used only when needed.</p>
              </div>
            </li>
            <li className="step">
              <span className="step-num">3</span>
              <div>
                <h3>Execute</h3>
                <p>A relation graph (contacts, teams, channels) resolves real recipients and channels. Preview in dry-run, then run for real — via MCP servers or your own backend.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="features" className="section features">
          <h2 className="section-title">Key features</h2>
          <ul className="features-list">
            <li className="feature-item">
              <span className="feature-label">Smart extraction</span>
              <p className="feature-desc">Concurrent chunk processing, pronoun resolution, semantic dedup, topic tags.</p>
            </li>
            <li className="feature-item">
              <span className="feature-label">Tool-ready normalization</span>
              <p className="feature-desc">Deadline parsing (“March 10” → ISO date), verb upgrading, compound-action splitting, tool classification and param extraction.</p>
            </li>
            <li className="feature-item">
              <span className="feature-label">Contact-aware execution</span>
              <p className="feature-desc">Editable contact graph; LLM maps actions to the right connection (team, channel, email). No manual field mapping.</p>
            </li>
            <li className="feature-item">
              <span className="feature-label">Integrations</span>
              <p className="feature-desc">Gmail, Google Calendar, Slack, Notion, Jira via MCP (or replace with direct APIs).</p>
            </li>
            <li className="feature-item">
              <span className="feature-label">Flexible LLM</span>
              <p className="feature-desc">Gemini (recommended), Claude, or Ollama for fully local runs.</p>
            </li>
          </ul>
        </section>

        <section className="section audience">
          <h2 className="section-title">For whom</h2>
          <div className="audience-cards">
            <div className="audience-card">
              <p>Teams that want meeting outcomes turned into real tasks and messages without manual copy-paste.</p>
            </div>
            <div className="audience-card">
              <p>Devs and ops who want a single pipeline from transcript → normalized actions → optional one-click execution, with preview and control.</p>
            </div>
          </div>
        </section>

        <section id="try-it" className="section cta">
          <h2 className="section-title">Get started</h2>
          <div className="cta-cards">
            <div className="cta-card">
              <h3>Try it</h3>
              <p>Clone, set <code>ACTIVE_PROVIDER</code> and API key in <code>.env</code>, run extractor → normalizer → executor (dry-run by default).</p>
              <a href="#" className="btn btn-primary">Clone & run</a>
            </div>
            <div className="cta-card">
              <h3>Go live</h3>
              <p>Add MCP credentials (or wire your own APIs), run executor with <code>--live</code> after users verify the preview.</p>
              <a href="#" className="btn btn-secondary">Configure for production</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span className="footer-logo">Meeting Action Extractor ®</span>
        <p className="footer-tagline">Extract · Normalize · Execute</p>
      </footer>
    </div>
  )
}

export default App
