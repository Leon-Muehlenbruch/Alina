import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SOURCE_PREVIEW } from './sourcePreview'

export function LandingPage() {
  const [copied, setCopied] = useState(false)

  const copySource = () => {
    navigator.clipboard.writeText(SOURCE_PREVIEW).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div className="landing-page">
      {/* NAV */}
      <nav>
        <Link to="/" className="nav-logo">
          <img src="/logo.svg" alt="Alina" />
          <span className="nav-wordmark">alina</span>
        </Link>
        <div className="nav-right">
          <a href="#howto" className="nav-link">Guide</a>
          <a href="#source" className="nav-link">Source code</a>
          <Link to="/app" className="nav-cta">Open app</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <img src="/logo.svg" alt="Alina" className="hero-logo" />
        <h1 className="hero-title">
          Private by design.<br /><em>Human by nature.</em>
        </h1>
        <p className="hero-sub">No feed. No followers. Just the people you know.</p>
        <div className="hero-actions">
          <Link to="/app" className="btn-primary">Open app</Link>
          <a href="#source" className="btn-ghost">View source</a>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>Mehr erfahren</span>
        </div>
      </section>

      {/* PROMISES */}
      <section className="promises" id="promises">
        <div className="container">
          <div className="section-eyebrow">Three promises</div>
          <h2 className="section-title">Built on <em>trust.</em></h2>
          <div className="promise-grid">
            <div className="promise">
              <div className="promise-num">01</div>
              <div className="promise-title">No owner.</div>
              <div className="promise-body">
                MIT License. The code belongs to everyone. Anyone can read, change, and share it. No company behind it.
              </div>
            </div>
            <div className="promise">
              <div className="promise-num">02</div>
              <div className="promise-title">Cannot be switched off.</div>
              <div className="promise-body">
                Hundreds of independent Nostr relays worldwide. If one goes down, the others keep running. No state can shut them all down.
              </div>
            </div>
            <div className="promise">
              <div className="promise-num">03</div>
              <div className="promise-title">No bots.</div>
              <div className="promise-body">
                Contacts verified by one-time code outside the app. End-to-end encrypted. Only you and your contact can read messages.
              </div>
            </div>
            <div className="promise">
              <div className="promise-num">04</div>
              <div className="promise-title">Mega simple.</div>
              <div className="promise-body">
                One file. Open it in any browser. No install, no account, no manual. If you can send a text, you can use alina.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="section-eyebrow">Features</div>
          <h2 className="section-title">
            Three things.<br /><em>Nothing more, nothing less.</em>
          </h2>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">💬</span>
              <div className="feature-name">Text &amp; Emojis</div>
              <div className="feature-desc">
                Direktnachrichten und Gruppenräume bis 10 Personen. Verschlüsselt, dezentral.
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🖼</span>
              <div className="feature-name">Bilder senden</div>
              <div className="feature-desc">
                One image per message. No cloud upload, no third party. Directly in the conversation.
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">📍</span>
              <div className="feature-name">Standort</div>
              <div className="feature-desc">
                what3words — drei Wörter, präzise auf 3m². Egal wo auf der Welt.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO */}
      <section className="howto" id="howto">
        <div className="container">
          <div className="section-eyebrow">Guide</div>
          <h2 className="section-title">
            Up and running <em>in two minutes.</em>
          </h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <div className="step-title">Open app</div>
                <div className="step-desc">
                  Tap "Open app" — done. No download, no app store, no account.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <div className="step-title">Namen eingeben</div>
                <div className="step-desc">
                  On first launch enter your name. A key pair is generated automatically — locally, on your device.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <div className="step-title">Add a contact</div>
                <div className="step-desc">
                  Tap <code>+</code> — generate a one-time code and send it via SMS or Signal to your contact. Valid for 10 minutes.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-body">
                <div className="step-title">Install on your homescreen</div>
                <div className="step-desc">
                  Your browser will ask: "Add to home screen?" — one tap and alina appears as an app icon.
                </div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">5</div>
              <div className="step-body">
                <div className="step-title">Write your private key down</div>
                <div className="step-desc">
                  Open Settings (⚙) and save your private key somewhere safe. Lose it and you lose your identity.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCE */}
      <section id="source">
        <div className="container">
          <div className="section-eyebrow">Source code</div>
          <h2 className="section-title">Open to <em>everyone.</em></h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.8, maxWidth: 520 }}>
            Complete code — nothing hidden, nothing minified. React + TypeScript + Nostr. Read it, change it, share it.
          </p>
          <div className="source-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                MIT License · Open to all
              </span>
              <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copySource}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="source-box">
            <div className="source-toolbar">
              <span className="source-filename">src/lib/nostr.ts</span>
              <span className="source-stats">React + TypeScript · Nostr · NIP-04</span>
            </div>
            <pre className="source-pre">{SOURCE_PREVIEW}</pre>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section style={{ borderTop: '1px solid var(--rule)' }}>
        <div className="container">
          <div className="philosophy-inner">
            <div className="section-eyebrow">Philosophy</div>
            <blockquote>
              Das Netz gehört allen — oder es gehört niemandem.
            </blockquote>
            <p className="quote-caption">Why alina exists</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.9, marginTop: '1.8rem', paddingLeft: '2rem', maxWidth: 480 }}>
              alina was built so people can stay in touch with the people they know — regardless of whether a government, a company, or an algorithm decides who is allowed to talk to whom. No server that can be switched off. No owner that can be bought. Just people talking to each other.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          <img src="/logo.svg" alt="Alina" className="footer-logo" />
          <span className="footer-text">alina · v2.0 · © 2025 Kay (__archon) Muehlenbruch</span>
        </div>
        <span className="footer-mit">MIT License · Open source</span>
      </footer>
    </div>
  )
}
