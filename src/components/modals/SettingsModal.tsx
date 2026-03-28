import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { encodeNpub, encodeNsec } from '../../lib/crypto'
import { loadLogs, clearLogs as clearStoredLogs } from '../../lib/storage'

export function SettingsModal() {
  const identity = useStore(s => s.identity)
  const updateName = useStore(s => s.updateName)
  const logout = useStore(s => s.logout)
  const setOpenModal = useStore(s => s.setOpenModal)
  const showStatus = useStore(s => s.showStatus)

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
    if (!confirm('Sign out? Make sure you have written down your private key.')) return
    logout()
    close()
  }

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => showStatus(msg, 2000)).catch(() => {})
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">Settings</div>
        <div>
          <div className="setup-label">Your name</div>
          <input type="text" maxLength={30} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <div className="setup-label">Your public key</div>
          <div className="key-display" onClick={() => copyToClipboard(npub, 'Public key copied')}>
            {npub}
          </div>
        </div>
        <div>
          <div className="setup-label">Your private key — never share this!</div>
          <div className="key-display" onClick={() => copyToClipboard(nsec, 'Private key copied!')}>
            {nsec}
          </div>
        </div>
        <div className="warning-box">
          ⚠ Write down your private key and keep it safe. It is your identity. Anyone who has it can be you.
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textAlign: 'center', paddingTop: '0.5rem', letterSpacing: '0.05em' }}>
          © 2025 Kay (__archon) Muehlenbruch · MIT License
        </div>
        <div className="modal-actions" style={{ flexWrap: 'wrap', gap: '0.4rem' }}>
          <button className="btn danger small" onClick={handleLogout}>Sign out</button>
          <button className="btn secondary small" onClick={() => setShowLogs(true)} title="View error logs">🪲 Logs</button>
          <button className="btn secondary" onClick={close}>Close</button>
          <button className="btn" onClick={handleSave}>Save</button>
        </div>
      </div>

      {showLogs && <LogViewer onClose={() => setShowLogs(false)} />}
    </div>
  )
}

function LogViewer({ onClose }: { onClose: () => void }) {
  const logs = loadLogs()
  const showStatus = useStore(s => s.showStatus)

  const handleCopy = () => {
    const text = logs.map(l => `[${l.ts}] [${l.type.toUpperCase()}] ${l.message}`).join('\n')
    navigator.clipboard.writeText(text).then(() => showStatus('Logs copied!', 2000))
  }

  const handleClear = () => {
    clearStoredLogs()
    showStatus('Logs cleared.', 2000)
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0e0e0f', border: '1px solid #2e2e33', borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderBottom: '1px solid #2e2e33' }}>
          <span style={{ fontSize: '0.85rem', color: '#c8a97e', fontWeight: 500 }}>Debug Logs ({logs.length})</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopy} style={{ background: '#222226', border: '1px solid #2e2e33', color: '#7a7672', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}>Copy</button>
            <button onClick={handleClear} style={{ background: '#222226', border: '1px solid #2e2e33', color: '#7a7672', borderRadius: 6, padding: '0.3rem 0.7rem', fontSize: '0.75rem', cursor: 'pointer' }}>Clear</button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7a7672', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {!logs.length && (
            <div style={{ textAlign: 'center', color: '#7a7672', padding: '2rem', fontSize: '0.82rem' }}>No logs recorded.</div>
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
