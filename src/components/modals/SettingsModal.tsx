import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { encodeNpub, encodeNsec } from '../../lib/crypto'
import { loadLogs, clearLogs as clearStoredLogs } from '../../lib/storage'
import type { Lang } from '../../lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export function SettingsModal() {
  const identity = useStore(s => s.identity)
  const updateName = useStore(s => s.updateName)
  const logout = useStore(s => s.logout)
  const setOpenModal = useStore(s => s.setOpenModal)
  const showStatus = useStore(s => s.showStatus)
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const t = useT()

  const [name, setName] = useState(identity?.name ?? '')
  const [showLogs, setShowLogs] = useState(false)

  if (!identity) return null

  const npub = encodeNpub(identity.pubkey)
  const nsec = encodeNsec(identity.privkey)

  const close = () => setOpenModal(null)

  const handleSave = () => {
    if (name.trim()) updateName(name.trim())
    close()
  }

  const handleLogout = () => {
    if (!confirm(t('settings.signoutConfirm'))) return
    logout()
    close()
  }

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => showStatus(msg, 2000)).catch(() => {})
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">{t('settings.title')}</div>

        <div>
          <div className="setup-label">{t('settings.nameLabel')}</div>
          <input type="text" maxLength={30} value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <div className="setup-label">{t('settings.pubkeyLabel')}</div>
          <div className="key-display" onClick={() => copyToClipboard(npub, t('settings.pubkeyCopied'))}>
            {npub}
          </div>
        </div>

        <div>
          <div className="setup-label">{t('settings.privkeyLabel')}</div>
          <div className="key-display" onClick={() => copyToClipboard(nsec, t('settings.privkeyCopied'))}>
            {nsec}
          </div>
        </div>

        <div className="warning-box">{t('settings.keyWarning')}</div>

        <div>
          <div className="setup-label">{t('settings.language')}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: 6,
                  border: `1px solid ${lang === l.code ? 'var(--accent)' : 'var(--border)'}`,
                  background: lang === l.code ? 'var(--accent)' : 'var(--surface2)',
                  color: lang === l.code ? '#1a1a1b' : 'var(--text)',
                  fontWeight: lang === l.code ? 700 : 400,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textAlign: 'center', paddingTop: '0.5rem', letterSpacing: '0.05em' }}>
          © 2025 Kay (__archon) Muehlenbruch · MIT License
        </div>

        <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
          <button className="btn danger small" onClick={handleLogout}>{t('settings.signout')}</button>
          <button className="btn secondary small" onClick={() => setShowLogs(true)} title="View error logs">🪲 {t('settings.logs')}</button>
          <button className="btn secondary" onClick={close}>{t('settings.close')}</button>
          <button className="btn" onClick={handleSave}>{t('settings.save')}</button>
        </div>
      </div>

      {showLogs && <LogViewer onClose={() => setShowLogs(false)} />}
    </div>
  )
}

function LogViewer({ onClose }: { onClose: () => void }) {
  const logs = loadLogs()
  const showStatus = useStore(s => s.showStatus)
  const t = useT()

  const handleCopy = () => {
    const text = logs.map(l => `[${l.ts}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    navigator.clipboard.writeText(text).then(() => showStatus(t('settings.logsCopied'), 2000))
  }

  const handleClear = () => {
    clearStoredLogs()
    showStatus(t('settings.logsCleared'), 2000)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0e0e0f', border: '1px solid #2e2e33', borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid #2e2e33' }}>
          <span style={{ fontSize: '0.85rem', color: '#c8a97e', fontWeight: 500 }}>{t('settings.logsTitle', { n: String(logs.length) })}</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopy} style={{ background: '#222226', border: '1px solid #2e2e33', color: '#7a7672', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}>{t('settings.copy')}</button>
            <button onClick={handleClear} style={{ background: '#222226', border: '1px solid #2e2e33', color: '#7a7672', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}>{t('settings.clear')}</button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7a7672', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {!logs.length && (
            <div style={{ textAlign: 'center', color: '#7a7672', padding: '2rem', fontSize: '0.82rem' }}>{t('settings.noLogs')}</div>
          )}
          {[...logs].reverse().map((log, i) => {
            const color = log.type === 'error' || log.type === 'onerror' ? '#c97070'
              : log.type === 'warn' ? '#c8956a'
              : log.type === 'promise' ? '#c97070'
              : '#7a7672'
            return (
              <div key={i} style={{
                fontFamily: 'monospace', fontSize: '0.72rem', lineHeight: 1.5, padding: '0.4rem 0.6rem',
                background: '#18181b', borderRadius: 4, borderLeft: `2px solid ${color}`,
              }}>
                <span style={{ color: '#5a5448' }}>{log.ts.slice(11, 19)}</span>{' '}
                <span style={{ color, textTransform: 'uppercase', fontSize: '0.65rem' }}>{log.type}</span>{' '}
                <span style={{ color: '#c8bfaa' }}>{log.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
