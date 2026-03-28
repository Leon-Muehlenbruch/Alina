import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useInviteCode } from '../../hooks/useInviteCode'
import { resubscribeAll } from '../../lib/nostr'

export function AddContactModal() {
  const setOpenModal = useStore(s => s.setOpenModal)
  const addContact = useStore(s => s.addContact)
  const showStatus = useStore(s => s.showStatus)
  const identity = useStore(s => s.identity)

  const [mode, setMode] = useState<'invite' | 'join'>('invite')
  const [nameInvite, setNameInvite] = useState('')
  const [nameJoin, setNameJoin] = useState('')
  const [recvCode, setRecvCode] = useState('')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [advPubkey, setAdvPubkey] = useState('')
  const [advName, setAdvName] = useState('')

  const { code, timerText, generate } = useInviteCode(identity?.pubkey ?? '', identity?.name ?? '')

  const close = () => setOpenModal(null)

  const handleAdd = () => {
    if (mode === 'join') {
      if (!recvCode || recvCode.length !== 6) { alert('Please enter the 6-digit code you received.'); return }
      if (!nameJoin.trim()) { alert('Please enter a name for this contact.'); return }
      showStatus('Code saved. When your contact messages you, they will appear here automatically.', 3000)
      close()
      return
    }

    // Invite mode
    if (!advPubkey) {
      if (!nameInvite.trim()) { alert('Please enter a name so you recognise your contact when they appear.'); return }
      showStatus('Waiting for your contact to enter the code. They will appear here automatically.', 4000)
      close()
      return
    }

    // Advanced: direct pubkey
    if (!advName.trim()) { alert('Please enter a name for this contact.'); return }
    try {
      addContact(advPubkey, advName.trim())
      resubscribeAll()
      showStatus(`${advName.trim()} added!`, 2000)
      close()
    } catch {
      alert('Invalid public key.')
    }
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">Add a contact</div>
        <div className="modal-subtitle">Choose how to connect — both of you need alina open.</div>

        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: '1rem' }}>
          <button
            onClick={() => { setMode('invite'); generate() }}
            style={{
              flex: 1, padding: '0.65rem', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer',
              background: mode === 'invite' ? 'var(--accent)' : 'var(--surface2)',
              color: mode === 'invite' ? '#1a1410' : 'var(--text)',
              fontWeight: mode === 'invite' ? 500 : 400,
            }}
          >
            I want to invite
          </button>
          <button
            onClick={() => setMode('join')}
            style={{
              flex: 1, padding: '0.65rem', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.82rem', cursor: 'pointer',
              background: mode === 'join' ? 'var(--accent)' : 'var(--surface2)',
              color: mode === 'join' ? '#1a1410' : 'var(--text)',
              fontWeight: mode === 'join' ? 500 : 400,
            }}
          >
            I got a code
          </button>
        </div>

        {mode === 'invite' ? (
          <div>
            <div className="warning-box" style={{ background: '#1a2018', borderColor: '#2e4a2a', color: '#8fba8a', marginBottom: '1rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
              You generate a code → send it via SMS or Signal → your contact enters it on the "I got a code" tab. Done.
            </div>
            <div className="setup-label">Step 1 — Your invite code</div>
            <div className="code-display">
              <div className="code-number">{code}</div>
              <div className="code-timer">{timerText}</div>
            </div>
            <button className="btn secondary small" style={{ marginTop: '0.6rem', width: '100%' }} onClick={generate}>
              Generate new code
            </button>
            <div className="setup-label" style={{ marginTop: '1rem' }}>Step 2 — Send this code to your contact</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.8rem' }}>
              Copy the number and send it via SMS, Signal, or say it out loud. Valid for 10 minutes, one use only.
            </div>
            <div className="setup-label">Step 3 — What do you want to call them?</div>
            <input type="text" placeholder="e.g. Alina" maxLength={30} value={nameInvite} onChange={e => setNameInvite(e.target.value)} />
          </div>
        ) : (
          <div>
            <div className="warning-box" style={{ background: '#1a2018', borderColor: '#2e4a2a', color: '#8fba8a', marginBottom: '1rem', fontSize: '0.82rem', lineHeight: 1.6 }}>
              Someone sent you a 6-digit code via SMS or Signal. Enter it here and they will appear in your contacts.
            </div>
            <div className="setup-label">Enter the code you received</div>
            <input
              type="text" placeholder="123456" maxLength={6} value={recvCode} onChange={e => setRecvCode(e.target.value)}
              style={{ letterSpacing: '0.4em', fontSize: '1.6rem', textAlign: 'center', fontFamily: 'monospace' }}
            />
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
              Codes expire after 10 minutes.
            </div>
            <div className="setup-label">What do you want to call them?</div>
            <input type="text" placeholder="e.g. Kay" maxLength={30} value={nameJoin} onChange={e => setNameJoin(e.target.value)} />
          </div>
        )}

        <details open={advancedOpen} onToggle={e => setAdvancedOpen((e.target as HTMLDetailsElement).open)} style={{ marginTop: '0.8rem' }}>
          <summary style={{ fontSize: '0.75rem', color: 'var(--muted)', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.3rem 0' }}>
            Advanced: add by public key
          </summary>
          <div style={{ marginTop: '0.8rem' }}>
            <div className="setup-label">Their public key (npub...)</div>
            <input type="text" placeholder="npub1..." value={advPubkey} onChange={e => setAdvPubkey(e.target.value)} style={{ fontSize: '0.78rem', fontFamily: 'monospace' }} />
            <div className="setup-label" style={{ marginTop: '0.6rem' }}>Name for this contact</div>
            <input type="text" placeholder="e.g. Alina" maxLength={30} value={advName} onChange={e => setAdvName(e.target.value)} />
          </div>
        </details>

        <div className="modal-actions">
          <button className="btn secondary" onClick={close}>Cancel</button>
          <button className="btn" onClick={handleAdd}>Add contact</button>
        </div>
      </div>
    </div>
  )
}
