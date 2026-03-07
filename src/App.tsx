import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page">
      <header className={`header ${headerScrolled ? 'header-scrolled' : ''}`}>
        <div className="header-inner">
          <a href="#" className="logo">
            <span className="logo-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="4" cy="12" r="2" />
                <path d="M7 12h5" />
                <circle cx="12" cy="12" r="2" />
                <path d="M14 12h6" />
                <circle cx="20" cy="12" r="2" />
              </svg>
            </span>
            <span className="logo-text">ActionPipe</span>
          </a>
          <nav className="nav">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#try-it">Try it</a>
            <a href="#try-it">Get started</a>
          </nav>
          <div className="header-actions">
            <a href="#" className="btn-header btn-header-ghost">Log in</a>
            <a href="#try-it" className="btn-header">Sign Up Now</a>
          </div>
        </div>
      </header>

      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden />
        <section className="hero">
          <h1 className="hero-title">
            From meeting notes
            <br />
            to <span className="hero-title-done">Done</span> — autonomously.
          </h1>
          <p className="hero-desc">
            Extract structured action items from raw transcripts, normalize them into ready-to-run tool calls, and execute with one click. Emails, calendar events, Jira tasks, Slack messages, and Notion docs — powered by your choice of LLM.
          </p>
          <p className="hero-login">
            Already have an account? <a href="#try-it">Log in</a>
          </p>
          <div className="hero-cta-wrap">
            <span className="hero-cta-blur" aria-hidden />
            <a href="#try-it" className="hero-cta">View Documentation</a>
          </div>
        </section>
      </div>

      <div className="cards-row">
        <article className="feature-card feature-card-gradient">
          <div className="feature-card-img">
            <div className="feature-card-ide vscode-ide">
              <div className="vscode-title-bar">
                <span className="vscode-dot" /><span className="vscode-dot" /><span className="vscode-dot" />
              </div>
              <div className="vscode-editor">
                <div className="vscode-line-nums" aria-hidden>1<br />2<br />3<br />4<br />5</div>
                <pre className="vscode-code"><code><span className="code-keyword">from</span> src.action_extractor.workflow <span className="code-keyword">import</span> extract_actions{'\n'}
{'\n'}
actions = extract_actions(transcript_raw=<span className="code-string">"&lt;your transcript text&gt;"</span>){'\n'}
<span className="code-comment"># returns a list of dicts, one per action item</span></code></pre>
              </div>
            </div>
          </div>
          <div className="feature-card-body">
            <h3>Start Developing</h3>
            <p>Build rich pipelines with extract → normalize → execute. Our approach covers transcripts, tool classification, contact resolution, and dry-run preview so you can ship actions without manual triage.</p>
            <a href="#try-it" className="link">View Documentation</a>
          </div>
        </article>
        <article className="feature-card feature-card-glass">
          <div className="feature-card-img">
            <div className="feature-card-ide vscode-ide">
              <div className="vscode-title-bar">
                <span className="vscode-dot" /><span className="vscode-dot" /><span className="vscode-dot" />
              </div>
              <div className="vscode-editor">
                <div className="vscode-line-nums" aria-hidden>1<br />2<br />3<br />4<br />5</div>
                <pre className="vscode-code"><code>MCP_SERVERS = [{'\n'}
{`    `}<span className="code-string">"gmail"</span>, <span className="code-string">"calendar"</span>, <span className="code-string">"slack"</span>,{'\n'}
{`    `}<span className="code-string">"notion"</span>, <span className="code-string">"jira"</span>{'\n'}
]</code></pre>
              </div>
            </div>
          </div>
          <div className="feature-card-body">
            <h3>Integrations</h3>
            <p>Gmail, Google Calendar, Slack, Notion, Jira via MCP — or replace with your own APIs. Flexible LLM: Gemini, Claude, or Ollama for fully local runs.</p>
            <a href="#features" className="link">View Integrations</a>
          </div>
        </article>
      </div>

      <main className="main">
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

        <section id="features" className="section ecosystem">
          <h2 className="ecosystem-title">Keeping the pipeline powerful</h2>
          <div className="ecosystem-grid">
            <div className="ecosystem-card">
              <div className="icon" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <h4>Smart extraction</h4>
              <p>Concurrent chunk processing, pronoun resolution, semantic dedup, topic tags.</p>
            </div>
            <div className="ecosystem-card">
              <div className="icon" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <h4>Tool-ready normalization</h4>
              <p>Deadline parsing (“March 10” → ISO date), verb upgrading, compound-action splitting.</p>
            </div>
            <div className="ecosystem-card">
              <div className="icon" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h4>Contact-aware execution</h4>
              <p>Editable contact graph; LLM maps actions to the right connection. No manual field mapping.</p>
            </div>
            <div className="ecosystem-card">
              <div className="icon" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" ry="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
              </div>
              <h4>Flexible LLM</h4>
              <p>Gemini (recommended), Claude, or Ollama for fully local runs.</p>
            </div>
          </div>
        </section>

        <section className="section audience">
          <h2 className="section-title">For whom</h2>
          <div className="audience-cards">
            <div className="ecosystem-card">
              <h4>Teams</h4>
              <p>Teams that want meeting outcomes turned into real tasks and messages without manual copy-paste.</p>
            </div>
            <div className="ecosystem-card">
              <h4>Developers & ops</h4>
              <p>Devs and ops who want a single pipeline from transcript → normalized actions → optional one-click execution, with preview and control.</p>
            </div>
            <div className="ecosystem-card">
              <h4>Leaders & managers</h4>
              <p>Leaders who want visibility into action items and outcomes without running the pipeline themselves.</p>
            </div>
          </div>
        </section>

        <section id="try-it" className="section cta">
          <h2 className="section-title">Get started</h2>
          <p className="section-desc">Clone the repo, set your provider and API key, then run extractor → normalizer → executor. Dry-run by default.</p>
          <div className="cta-cards">
            <div className="ecosystem-card">
              <h4>Try it</h4>
              <p>Set <code>ACTIVE_PROVIDER</code> and API key in <code>.env</code>, run extractor → normalizer → executor (dry-run by default).</p>
              <a href="#" className="btn btn-primary">Clone & run</a>
            </div>
            <div className="ecosystem-card">
              <h4>Go live</h4>
              <p>Add MCP credentials (or wire your own APIs), run executor with <code>--live</code> after users verify the preview.</p>
              <a href="#" className="btn btn-secondary">Configure for production</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#try-it">Get started</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>ActionPipe</h4>
            <ul>
              <li><span>Extract · Normalize · Execute</span></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy policy</a></li>
            </ul>
          </div>
        </div>
        <p className="footer-bottom">ActionPipe — From meeting notes to done.</p>
      </footer>
    </div>
  )
}

export default App
