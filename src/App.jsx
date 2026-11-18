import React, { useState, useEffect, useRef } from 'react'
import './App.css'

const AGENTS = [
  {
    id: 'claria',
    name: 'CLARIA',
    prefix: 'CLR',
    role: 'Customer Communications Redesign',
    summary: 'Transform dense legal, billing, and intimidating communications into clear customer copy.',
    categories: ['Content'],
    chips: ['Rewrite', 'Clarity', 'Customer tone'],
    endpoint: 'https://d71pirbml8.execute-api.us-east-1.amazonaws.com/api/simplify',
    live_url: 'https://d3a54sx4bbzktn.cloudfront.net',
    field: 'text',
    sample: 'Pursuant to Clause 14.2(b), failure to remit payment within 14 calendar days shall result in immediate termination of utility privileges without further recourse.',
  },
  {
    id: 'lens',
    name: 'LENS',
    prefix: 'LNS',
    role: 'Content Reviewer & Consistency Auditor',
    summary: 'Audit documents for clarity, contradictions, and readiness before going live.',
    categories: ['Content', 'Governance'],
    chips: ['Review', 'Quality', 'Consistency'],
    endpoint: 'https://9h9cdk5cxi.execute-api.us-east-1.amazonaws.com/api/review',
    live_url: 'https://d1hwt5aw0fwzod.cloudfront.net',
    field: 'text',
    sample: 'Section 2 states 30 days to respond, but Section 6 states payment is due in 45 days.',
  },
  {
    id: 'index',
    name: 'INDEX',
    prefix: 'IXT',
    role: 'Metadata Tagger & Governance Engine',
    summary: 'Generate intelligent document metadata, governance classifications, and discovery tags.',
    categories: ['Content'],
    chips: ['Metadata', 'Tagging', 'Discovery'],
    endpoint: 'https://tl1aqbynmf.execute-api.us-east-1.amazonaws.com/api/tag',
    live_url: 'https://d33eb1zoxf1g08.cloudfront.net',
    field: 'text',
    sample: 'Master Services Agreement dated November 2026 between Acme Financial and Horizon Global regarding cloud modernization.',
  },
  {
    id: 'adapta',
    name: 'ADAPTA',
    prefix: 'ADP',
    role: 'Omnichannel Message Adapter',
    summary: 'Adapt content across channels including Email, SMS, WhatsApp, Push, and Social.',
    categories: ['Content', 'Experience'],
    chips: ['Channel fit', 'Rewrite', 'Consistency'],
    endpoint: 'https://2m1153u1z1.execute-api.us-east-1.amazonaws.com/api/adapt',
    live_url: 'https://d36ns0rvegxqlv.cloudfront.net',
    field: 'text',
    sample: 'We are upgrading our core banking servers on Saturday Nov 22 from 2 AM to 5 AM UTC. ATM and card transactions remain active.',
  },
  {
    id: 'glance',
    name: 'GLANCE',
    prefix: 'GLN',
    role: 'Interactive Statement Lab',
    summary: 'Simplify complex statements and extract clear key figures and clarity scores.',
    categories: ['Experience'],
    chips: ['Statements', 'Insights', 'Simplify'],
    endpoint: 'https://46woy3v8j7.execute-api.us-east-1.amazonaws.com/api/analyze',
    live_url: 'https://d24bu68rg7e4m.cloudfront.net',
    field: 'text',
    sample: 'Statement Period: Oct 1 - Oct 31. Previous Balance: $1,420.00. Payments: $500.00. Finance Charges: $34.50. New Purchases: $890.20. Minimum Payment Due: $75.00.',
  },
  {
    id: 'sortia',
    name: 'SORTIA',
    prefix: 'SRT',
    role: 'Content Classifier & Ambiguity Router',
    summary: 'Classify content into enterprise operational categories with ambiguity detection.',
    categories: ['Governance'],
    chips: ['Classify', 'Routing', 'Labels'],
    endpoint: 'https://n6r7yo1mvl.execute-api.us-east-1.amazonaws.com/api/classify',
    live_url: 'https://d33u4991ehrqv3.cloudfront.net',
    field: 'text',
    sample: 'Formal notice of insurance claim dispute regarding auto collision damage on Highway 101.',
  },
  {
    id: 'echo',
    name: 'ECHO',
    prefix: 'ECH',
    role: 'Semantic Document Comparator',
    summary: 'Surface semantic and clause-level changes across document versions.',
    categories: ['Governance'],
    chips: ['Compare', 'Changes', 'Versions'],
    endpoint: 'https://22s6be3850.execute-api.us-east-1.amazonaws.com/api/compare',
    live_url: 'https://d2e3xsh5ciq5sx.cloudfront.net',
    field: 'message',
    sample: 'Compare File 1: The supplier shall deliver products within 15 days. File 2: The supplier shall deliver products within 30 days and provide insurance.',
  },
  {
    id: 'ally',
    name: 'ALLY',
    prefix: 'ALY',
    role: 'Web Accessibility Coach (WCAG 2.2)',
    summary: 'Audit digital markup and content for WCAG 2.2 accessibility improvements.',
    categories: ['Experience'],
    chips: ['Accessibility', 'Guidance', 'Web'],
    endpoint: 'https://987i4erb3d.execute-api.us-east-1.amazonaws.com/api/review',
    live_url: 'https://d2b1l3a8mjms74.cloudfront.net',
    field: 'message',
    sample: 'Review accessibility: <a href="/download">Click here</a> to get our latest brochure. <img src="logo.png">',
  },
  {
    id: 'taxora',
    name: 'TAXORA',
    prefix: 'TXR',
    role: 'Enterprise Taxonomy & Governance Agent',
    summary: 'Build consistent enterprise taxonomies and hierarchical classifications.',
    categories: ['Structure', 'Governance'],
    chips: ['Taxonomy', 'Hierarchy', 'Governance'],
    endpoint: 'https://yvw8dqk6c2.execute-api.us-east-1.amazonaws.com/api/taxonomize',
    live_url: 'https://duwz8hk1atmbr.cloudfront.net',
    field: 'text',
    sample: 'Enterprise Information Security Policy covering MFA and ISO 27001 controls.',
  },
  {
    id: 'bridge',
    name: 'BRIDGE',
    prefix: 'BRG',
    role: 'CMS Content & Schema Migrator',
    summary: 'Automate schema mappings and transformations for modern headless CMS.',
    categories: ['Structure'],
    chips: ['CMS mapping', 'Migration', 'Schema'],
    endpoint: 'https://hjwkic438k.execute-api.us-east-1.amazonaws.com/api/migrate',
    live_url: 'https://d23utb1q5zn42x.cloudfront.net',
    field: 'content',
    sample: 'Blog article draft with title, author, publishDate, and body html content to migrate to Contentful.',
    under_review: true,
  },
  {
    id: 'grid',
    name: 'GRID',
    prefix: 'GRD',
    role: 'Content Model Architect',
    summary: 'Deconstruct monolithic templates into modular component graphs.',
    categories: ['Structure'],
    chips: ['Content model', 'Schema', 'Components'],
    endpoint: 'https://khag22rlna.execute-api.us-east-1.amazonaws.com/api/model',
    live_url: 'https://d2w2zkazeq82no.cloudfront.net',
    field: 'content',
    sample: 'Product Landing Page template with Hero Banner, Customer Testimonial Grid, Feature Matrix, and Pricing Table.',
    under_review: true,
  },
]

export default function App() {
  const [view, setView] = useState('library') // 'library' | 'guide' | 'workspace'
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeWorkspaceAgent, setActiveWorkspaceAgent] = useState(AGENTS[0])
  const [guideAgent, setGuideAgent] = useState(AGENTS[0])
  const [guideTab, setGuideTab] = useState('package') // 'package' | 'api'
  const [copiedKey, setCopiedKey] = useState('')
  const timerRef = useRef(null)

  const filteredAgents = activeCategory === 'All'
    ? AGENTS
    : AGENTS.filter(a => a.categories.includes(activeCategory))

  // Safe current index if category changed
  const safeIndex = currentIndex >= filteredAgents.length ? 0 : currentIndex
  const currentAgent = filteredAgents[safeIndex] || filteredAgents[0] || AGENTS[0]

  // Auto-rotation timer
  useEffect(() => {
    if (view !== 'library') return
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [view, filteredAgents.length])

  function startTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredAgents.length)
    }, 5400)
  }

  function pauseTimer() {
    clearInterval(timerRef.current)
  }

  function handlePrev() {
    pauseTimer()
    setCurrentIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length)
    startTimer()
  }

  function handleNext() {
    pauseTimer()
    setCurrentIndex(prev => (prev + 1) % filteredAgents.length)
    startTimer()
  }

  function handleOpenGuide(agent) {
    setGuideAgent(agent)
    setView('guide')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleLaunchWorkspace(agent) {
    pauseTimer()
    setActiveWorkspaceAgent(agent)
    setView('workspace')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function handleBackToLibrary() {
    setView('library')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function copyText(text, key) {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2200)
    })
  }

  return (
    <div className={`shell ${view === 'workspace' ? 'workspaceShell' : ''}`}>
      {/* Top Bar - hidden during workspace view to maximize screen estate and eliminate duplicate header */}
      {view !== 'workspace' && (
        <header className="top">
          <div className="logo" onClick={handleBackToLibrary}>
            <b>AI</b> AGENTS STORE
          </div>
          {view === 'library' ? (
            <div className="meta">AI FOR BUSINESS</div>
          ) : (
            <button className="backBtn" type="button" onClick={handleBackToLibrary}>
              <span>←</span> BACK TO STORE
            </button>
          )}
        </header>
      )}

      {view === 'library' ? (
        /* ==================== 1. MAIN LIBRARY VIEW ==================== */
        <main>
          {/* Category Tabs */}
          <nav className="cats">
            {['All', 'Content', 'Structure', 'Experience', 'Governance'].map(cat => (
              <button
                key={cat}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => {
                  setActiveCategory(cat)
                  setCurrentIndex(0)
                }}
                type="button"
              >
                {cat === 'All' ? 'All Agents' : cat}
              </button>
            ))}
          </nav>

          {/* Carousel Feature Section */}
          <section
            className="feature"
            onMouseEnter={pauseTimer}
            onMouseLeave={startTimer}
          >
            <div
              className="track"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {filteredAgents.map((agent, i) => (
                <article key={agent.id} className="slide">
                  <div>
                    <div className="kicker">
                      AI AGENTS STORE · AI FOR BUSINESS
                    </div>
                    <div className="heroTitleRow">
                      <h2>{agent.name}</h2>
                      {agent.under_review && (
                        <span className="underReviewBadge">UNDER REVIEW</span>
                      )}
                    </div>
                    <div className="role">{agent.role}</div>
                    <p>
                      {agent.summary} Open the live workspace directly, or use the interactive implementation guide for package downloads and API integration.
                    </p>

                    <div className="chips">
                      {agent.chips.map(c => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>

                    <div className="actions">
                      <button
                        className="primary"
                        type="button"
                        onClick={() => handleLaunchWorkspace(agent)}
                      >
                        OPEN AGENT →
                      </button>
                      <button
                        className="implement"
                        type="button"
                        onClick={() => handleOpenGuide(agent)}
                      >
                        IMPLEMENTATION GUIDE
                      </button>
                    </div>
                  </div>

                  <div className="visual">
                    <div className="signature">
                      <span>AI AGENTS STORE</span>
                      <strong>{agent.name}</strong>
                      <i />
                      <small>{agent.role}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="dots">
              {filteredAgents.map((_, i) => (
                <span
                  key={i}
                  className={`dot ${i === safeIndex ? 'on' : ''}`}
                  onClick={() => {
                    pauseTimer()
                    setCurrentIndex(i)
                    startTimer()
                  }}
                />
              ))}
            </div>

            {/* Slider Controls */}
            <div className="controls">
              <button type="button" onClick={handlePrev} aria-label="Previous agent">‹</button>
              <button type="button" onClick={handleNext} aria-label="Next agent">›</button>
            </div>
          </section>

          {/* Agent Ribbon Bar */}
          <div className="head">
            <b>Agent ribbon</b>
            <span>
              {activeCategory === 'All'
                ? 'AI FOR BUSINESS'
                : `${activeCategory.toUpperCase()} · AI FOR BUSINESS`}
            </span>
          </div>

          <section className="ribbon">
            {filteredAgents.map((agent, idx) => (
              <div
                key={agent.id}
                role="button"
                tabIndex={0}
                className={`card ${idx === safeIndex ? 'active' : ''} ${agent.under_review ? 'underReviewCard' : ''}`}
                title={agent.under_review ? `${agent.name} (Under Review)` : agent.name}
                onClick={() => handleLaunchWorkspace(agent)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleLaunchWorkspace(agent)
                  }
                }}
              >
                <div className="agentText">
                  <div className="cardTitleRow">
                    <b>{agent.name}</b>
                    {agent.under_review && (
                      <span className="underReviewPill">UNDER REVIEW</span>
                    )}
                  </div>
                  <div className="agentRole">{agent.role}</div>
                </div>
                <span className="cardAction">OPEN →</span>
              </div>
            ))}
          </section>
        </main>
      ) : view === 'workspace' ? (
        /* ==================== 2. EMBEDDED IN-PORTAL WORKSPACE VIEW (ALWAYS MAXIMUM SCREEN) ==================== */
        <main className="workspaceMain">
          <div className="workspaceControlBar">
            <div className="wsLeft">
              <button
                className="wsBackBtn"
                onClick={handleBackToLibrary}
                type="button"
                title="Return to AI Agents Store"
              >
                ← Back to Store
              </button>
              <div className="wsDivider" />
              <div className="wsAgentMeta">
                <span className="wsBadge">LIVE WORKSPACE</span>
                <b className="wsName">{activeWorkspaceAgent.name}</b>
                <span className="wsRole">{activeWorkspaceAgent.role}</span>
              </div>
            </div>

            <div className="wsRight">
              <div className="wsSelectorGroup">
                <span className="wsSelectLabel">Switch Agent:</span>
                <select
                  value={activeWorkspaceAgent.id}
                  onChange={e => {
                    const found = AGENTS.find(a => a.id === e.target.value)
                    if (found) setActiveWorkspaceAgent(found)
                  }}
                >
                  {AGENTS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wsBtnGroup">
                <button
                  className="wsGuideBtn"
                  type="button"
                  onClick={() => handleOpenGuide(activeWorkspaceAgent)}
                >
                  Implementation Guide
                </button>

                <a
                  className="wsExtBtn"
                  href={activeWorkspaceAgent.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Open ${activeWorkspaceAgent.name} in a separate tab`}
                >
                  Open Standalone ↗
                </a>
              </div>
            </div>
          </div>

          <div className="workspaceFrameContainer">
            <iframe
              key={activeWorkspaceAgent.id}
              src={activeWorkspaceAgent.live_url}
              title={`${activeWorkspaceAgent.name} Enterprise AI Workspace`}
              className="workspaceIframe"
              allow="clipboard-write; clipboard-read; fullscreen"
            />
          </div>
        </main>
      ) : (
        /* ==================== 3. IMPLEMENTATION GUIDE VIEW ==================== */
        <main>
          <section className="guideHero">
            <div className="guideTopNav">
              <div className="eyebrow">IMPLEMENTATION GUIDE & API CONTRACT</div>
              <div className="agentSelector">
                <span style={{ fontSize: '11px', color: '#849bb4' }}>Switch Agent:</span>
                <select
                  value={guideAgent.id}
                  onChange={e => {
                    const found = AGENTS.find(a => a.id === e.target.value)
                    if (found) setGuideAgent(found)
                  }}
                >
                  {AGENTS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h1>{guideAgent.name}</h1>
            <p>
              {guideAgent.role} · Choose how you want to implement this agent. Both options use the same verified Bedrock foundation with full PCI-DSS and GLBA security guardrails.
            </p>
            <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
              <button
                className="btnLaunchWorkspace"
                type="button"
                onClick={() => handleLaunchWorkspace(guideAgent)}
              >
                Launch {guideAgent.name} Live Workspace →
              </button>
            </div>
          </section>

          {/* Tab Switcher */}
          <div className="switch">
            <button
              className={guideTab === 'package' ? 'active' : ''}
              onClick={() => setGuideTab('package')}
              type="button"
            >
              Downloadable Package (SDK)
            </button>
            <button
              className={guideTab === 'api' ? 'active' : ''}
              onClick={() => setGuideTab('api')}
              type="button"
            >
              API Integration (HTTP / REST)
            </button>
          </div>

          {guideTab === 'package' ? (
            /* TAB A: DOWNLOADABLE PACKAGE */
            <section className="panel">
              <h2>Use as a downloadable package</h2>
              <p className="intro">
                For teams that want the agent client SDK embedded inside their own codebase or CI/CD deployment pipeline.
              </p>

              {/* Direct Download Banner */}
              <div className="downloadActionStrip">
                <div className="downloadInfo">
                  <b>{guideAgent.name} Agent SDK Distribution</b>
                  <small>Version 1.0.0 · Python 3.9+ · Standalone Client + Quickstart Demo</small>
                </div>
                <div className="downloadBtnGroup">
                  <a
                    className="btnDownloadPrimary"
                    href={`downloads/${guideAgent.id}-agent-1.0.0-sdk-bundle.zip`}
                    download
                  >
                    Download SDK Bundle (.zip) ↓
                  </a>
                  <a
                    className="btnDownloadSecondary"
                    href={`downloads/${guideAgent.id}_agent-1.0.0-py3-none-any.whl`}
                    download
                  >
                    Wheel (.whl)
                  </a>
                  <a
                    className="btnDownloadSecondary"
                    href={`downloads/${guideAgent.id}-agent-1.0.0.tar.gz`}
                    download
                  >
                    Source (.tar.gz)
                  </a>
                </div>
              </div>

              {/* 4 Steps */}
              <div className="steps">
                <div className="step">
                  <span className="n">01</span>
                  <b>Download</b>
                  <p>Get the `{guideAgent.id}-agent-1.0.0-sdk-bundle.zip` package directly above or via pip wheel.</p>
                </div>
                <div className="step">
                  <span className="n">02</span>
                  <b>Configure</b>
                  <p>Copy `.env.example` to `.env` and set API endpoint, timeout, and AWS region.</p>
                </div>
                <div className="step">
                  <span className="n">03</span>
                  <b>Install</b>
                  <p>Install minimal dependencies in an isolated virtual environment (`pip install -r requirements.txt`).</p>
                </div>
                <div className="step">
                  <span className="n">04</span>
                  <b>Run</b>
                  <p>Execute `python quickstart_example.py` to test live connectivity and parse trace verification codes.</p>
                </div>
              </div>

              {/* Code Snippets */}
              <div className="codeWrap">
                <div className="code">
                  <div className="codeHeaderRow">
                    <span className="codeHead">TERMINAL INSTALLATION</span>
                    <button
                      className="copyBtn"
                      onClick={() =>
                        copyText(
                          `unzip ${guideAgent.id}-agent-1.0.0-sdk-bundle.zip\ncd ${guideAgent.id}-agent\npython -m venv .venv\n# Linux/macOS: source .venv/bin/activate\n# Windows: .venv\\Scripts\\activate\npip install -r requirements.txt\npython quickstart_example.py`,
                          'term'
                        )
                      }
                      type="button"
                    >
                      {copiedKey === 'term' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                  <pre>{`unzip ${guideAgent.id}-agent-1.0.0-sdk-bundle.zip
cd ${guideAgent.id}-agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python quickstart_example.py`}</pre>
                </div>

                <div className="code">
                  <div className="codeHeaderRow">
                    <span className="codeHead">ENVIRONMENT CONFIG (.ENV)</span>
                    <button
                      className="copyBtn"
                      onClick={() =>
                        copyText(
                          `${guideAgent.name}_API_ENDPOINT=${guideAgent.endpoint}\nAWS_REGION=us-east-1\nLOG_LEVEL=INFO`,
                          'env'
                        )
                      }
                      type="button"
                    >
                      {copiedKey === 'env' ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                  <pre>{`${guideAgent.name}_API_ENDPOINT=${guideAgent.endpoint}
AWS_REGION=us-east-1
LOG_LEVEL=INFO`}</pre>
                </div>
              </div>

              <div className="note">
                <strong>Enterprise Security Policy:</strong> Do not package passwords, AWS root keys, access keys (`AKIA...`), customer PII, or production secrets in source files. {guideAgent.name} enforces a strict hard block against raw credentials.
              </div>
            </section>
          ) : (
            /* TAB B: API INTEGRATION */
            <section className="panel">
              <h2>Use through API</h2>
              <p className="intro">
                For microservices, web apps, or backend services that want to invoke {guideAgent.name} without embedding an SDK.
              </p>

              {/* Live Endpoint Bar */}
              <div className="endpointBar">
                <div className="endpointLeft">
                  <span className="methodBadge">POST</span>
                  <span className="endpointUrl">{guideAgent.endpoint}</span>
                </div>
                <button
                  className="copyBtn"
                  onClick={() => copyText(guideAgent.endpoint, 'ep')}
                  type="button"
                >
                  {copiedKey === 'ep' ? 'Copied ✓' : 'Copy Endpoint'}
                </button>
              </div>

              {/* 4 Steps */}
              <div className="steps">
                <div className="step">
                  <span className="n">01</span>
                  <b>Target Endpoint</b>
                  <p>Send HTTPS POST requests to the dedicated API Gateway endpoint shown above.</p>
                </div>
                <div className="step">
                  <span className="n">02</span>
                  <b>Prepare Request</b>
                  <p>Submit JSON containing `{guideAgent.field}` or multipart form-data for file uploads.</p>
                </div>
                <div className="step">
                  <span className="n">03</span>
                  <b>Handle Response</b>
                  <p>Extract structured findings, `guardrails.status`, and verify `trace_id` for compliance audits.</p>
                </div>
                <div className="step">
                  <span className="n">04</span>
                  <b>Productionize</b>
                  <p>Set a 30s timeout, exponential retries, and route low-confidence items to human review.</p>
                </div>
              </div>

              {/* Code Snippets */}
              <div className="codeWrap">
                <div className="code">
                  <div className="codeHeaderRow">
                    <span className="codeHead">PYTHON EXECUTABLE INTEGRATION</span>
                    <button
                      className="copyBtn"
                      onClick={() =>
                        copyText(
                          `import requests\n\nAPI_URL = "${guideAgent.endpoint}"\n\npayload = {\n    "${guideAgent.field}": "${guideAgent.sample}"\n}\n\nresponse = requests.post(API_URL, json=payload, timeout=30)\nresponse.raise_for_status()\n\ndata = response.json()\nprint("Status:", data.get("status"))\nprint("Trace ID:", data.get("trace_id"))\nprint("Guardrails:", data.get("guardrails", {}).get("status"))\nprint(data)`,
                          'py'
                        )
                      }
                      type="button"
                    >
                      {copiedKey === 'py' ? 'Copied ✓' : 'Copy Code'}
                    </button>
                  </div>
                  <pre>{`import requests

API_URL = "${guideAgent.endpoint}"

payload = {
    "${guideAgent.field}": "${guideAgent.sample}"
}

response = requests.post(API_URL, json=payload, timeout=30)
response.raise_for_status()

data = response.json()
print("Trace ID:", data.get("trace_id"))
print("Guardrails:", data.get("guardrails", {}).get("status"))`}</pre>
                </div>

                <div className="code">
                  <div className="codeHeaderRow">
                    <span className="codeHead">CURL TERMINAL TEST</span>
                    <button
                      className="copyBtn"
                      onClick={() =>
                        copyText(
                          `curl -X POST "${guideAgent.endpoint}" \\\n     -H "Content-Type: application/json" \\\n     -d '{"${guideAgent.field}": "${guideAgent.sample}"}'`,
                          'curl'
                        )
                      }
                      type="button"
                    >
                      {copiedKey === 'curl' ? 'Copied ✓' : 'Copy cURL'}
                    </button>
                  </div>
                  <pre>{`curl -X POST "${guideAgent.endpoint}" \\
     -H "Content-Type: application/json" \\
     -d '{"${guideAgent.field}": "${guideAgent.sample}"}'`}</pre>
                </div>
              </div>

              <div className="note">
                <strong>Response Contract:</strong> All {guideAgent.name} responses include an immutable verification trace ID (`{guideAgent.prefix}-YYYYMMDD-XXXXXX`) and a structured guardrail inspection outcome (`PASSED`, `REDACTED`, or `BLOCKED`).
              </div>
            </section>
          )}

          <footer className="footer">
            <span>{guideAgent.name} · {guideAgent.role}</span>
            <span>DOWNLOADABLE PACKAGE · API INTEGRATION · ZERO SECRETS POLICY</span>
          </footer>
        </main>
      )}
    </div>
  )
}

