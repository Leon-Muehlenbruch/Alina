import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { SOURCE_PREVIEW } from './sourcePreview'
import type { Lang } from '../../lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export function LandingPage() {
  const [copied, setCopied] = useState(false)
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const t = useT()

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
          <img src="/logo.svg?v=2" alt="Alina" />
          <span className="nav-wordmark">alina</span>
        </Link>
        <div className="nav-right">
          <a href="#howto" className="nav-link">{t('landing.guide')}</a>
          <a href="#source" className="nav-link">{t('landing.sourceCode')}</a>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`lang-btn${lang === l.code ? ' active' : ''}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link to="/app" className="nav-cta">{t('landing.openApp')}</Link>
        </div>
      </nav>
      {/* HERO */}
      <section className="hero">
        <div className="hero-logo-block">
          <img src="/logo.svg?v=2" alt="Alina" className="hero-logo" />
          <span className="hero-logo-name">alina</span>
        </div>
        <h1 className="hero-title">
          {t('landing.heroTitle1')}<br /><em>{t('landing.heroTitle2')}</em>
        </h1>
        <p className="hero-sub">{t('landing.heroSub')}</p>
        <div className="hero-actions">
          <Link to="/app" className="btn-primary hero-cta-pulse">{t('landing.openApp')}</Link>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>{t('landing.scrollHint')}</span>
        </div>
      </section>
      {/* PROMISES */}
      <section className="promises" id="promises">
        <div className="container">
          <div className="section-eyebrow">{t('landing.promisesEyebrow')}</div>
          <h2 className="section-title">{t('landing.promisesTitle')} <em>{t('landing.promisesTitleEm')}</em></h2>
          <div className="promise-grid">
            <div className="promise">
              <div className="promise-num">01</div>
              <div className="promise-title">{t('landing.promise1Title')}</div>
              <div className="promise-body">{t('landing.promise1Body')}</div>
            </div>
            <div className="promise">
              <div className="promise-num">02</div>
              <div className="promise-title">{t('landing.promise2Title')}</div>
              <div className="promise-body">{t('landing.promise2Body')}</div>
            </div>
            <div className="promise">
              <div className="promise-num">03</div>
              <div className="promise-title">{t('landing.promise3Title')}</div>
              <div className="promise-body">{t('landing.promise3Body')}</div>
            </div>
            <div className="promise">
              <div className="promise-num">04</div>
              <div className="promise-title">{t('landing.promise4Title')}</div>
              <div className="promise-body">{t('landing.promise4Body')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="section-eyebrow">{t('landing.featuresEyebrow')}</div>
          <h2 className="section-title">
            {t('landing.featuresTitle1')}<br /><em>{t('landing.featuresTitle2')}</em>
          </h2>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">💬</span>
              <div className="feature-name">{t('landing.featureTextName')}</div>
              <div className="feature-desc">{t('landing.featureTextDesc')}</div>
            </div>
            <div className="feature">
              <span className="feature-icon">🖼</span>
              <div className="feature-name">{t('landing.featureImageName')}</div>
              <div className="feature-desc">{t('landing.featureImageDesc')}</div>
            </div>            <div className="feature">
              <span className="feature-icon">📍</span>
              <div className="feature-name">{t('landing.featureLocationName')}</div>
              <div className="feature-desc">{t('landing.featureLocationDesc')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO */}
      <section className="howto" id="howto">
        <div className="container">
          <div className="section-eyebrow">{t('landing.howtoEyebrow')}</div>
          <h2 className="section-title">
            {t('landing.howtoTitle1')} <em>{t('landing.howtoTitle2')}</em>
          </h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-body">
                <div className="step-title">{t('landing.step1Title')}</div>
                <div className="step-desc">{t('landing.step1Desc')}</div>
              </div>
            </div>            <div className="step">
              <div className="step-num">2</div>
              <div className="step-body">
                <div className="step-title">{t('landing.step2Title')}</div>
                <div className="step-desc">{t('landing.step2Desc')}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-body">
                <div className="step-title">{t('landing.step3Title')}</div>
                <div className="step-desc">{t('landing.step3Desc')}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-body">
                <div className="step-title">{t('landing.step4Title')}</div>
                <div className="step-desc">{t('landing.step4Desc')}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-num">5</div>
              <div className="step-body">                <div className="step-title">{t('landing.step5Title')}</div>
                <div className="step-desc">{t('landing.step5Desc')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOURCE */}
      <section id="source">
        <div className="container">
          <div className="section-eyebrow">{t('landing.sourceEyebrow')}</div>
          <h2 className="section-title">{t('landing.sourceTitle')} <em>{t('landing.sourceTitleEm')}</em></h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.8, maxWidth: 520 }}>
            {t('landing.sourceDesc')}
          </p>
          <div className="source-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {t('landing.sourceLicense')}
              </span>
              <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copySource}>
                {copied ? t('landing.sourceCopied') : t('landing.sourceCopy')}
              </button>
            </div>          </div>
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
            <div className="section-eyebrow">{t('landing.philEyebrow')}</div>
            <blockquote>
              {t('landing.philQuote')}
            </blockquote>
            <p className="quote-caption">{t('landing.philCaption')}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.9, marginTop: '1.8rem', paddingLeft: '2rem', maxWidth: 480 }}>
              {t('landing.philBody')}
            </p>
          </div>
        </div>      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          <div className="footer-logo-block">
            <img src="/logo.svg?v=2" alt="Alina" className="footer-logo" />
            <span className="footer-logo-name">alina</span>
          </div>
          <span className="footer-text">{t('landing.footerText')}</span>
        </div>
        <span className="footer-mit">{t('landing.footerLicense')}</span>
      </footer>
    </div>
  )
}
