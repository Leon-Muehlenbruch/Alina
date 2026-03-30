import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Copy, Check, UserPlus, KeyRound } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { publishInviteCode, lookupInviteCode, resubscribeAll } from '../../lib/nostr'
import { INVITE_CODE_DURATION } from '../../lib/constants'

type View = 'invite' | 'join'
type LookupState = 'idle' | 'searching' | 'found' | 'not_found'

export function AddContactModal() {
  const setOpenModal = useStore(s => s.setOpenModal)
  const addContact = useStore(s => s.addContact)
  const showStatus = useStore(s => s.showStatus)
  const identity = useStore(s => s.identity)

  const [view, setView] = useState<View>('invite')

  // Invite
  const [inviteName, setInviteName] = useState('')
  const [code, setCode] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Join
  const [joinCode, setJoinCode] = useState('')
  const [inviterName, setInviterName] = useState('')   // pre-filled from relay event
  const [inviterPubkey, setInviterPubkey] = useState('')
  const [joinName, setJoinName] = useState('')         // editable by joiner
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [lookupDone, setLookupDone] = useState(false)

  const close = () => setOpenModal(null)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const startCountdown = () => {
    setRemaining(INVITE_CODE_DURATION)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setCode(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const generateCode = async () => {
    if (!identity || !inviteName.trim()) return
    setPublishing(true)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    try {
      await publishInviteCode(identity.privkey, identity.pubkey, identity.name, newCode)
      setCode(newCode)
      startCountdown()
    } catch {
      alert('Code konnte nicht erstellt werden.')
    } finally {
      setPublishing(false)
    }
  }

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-lookup once 6 digits are entered
  useEffect(() => {
    if (joinCode.length !== 6 || lookupDone) return
    setLookupState('searching')
    lookupInviteCode(joinCode).then(result => {
      setLookupDone(true)
      if (!result) {
        setLookupState('not_found')
      } else {
        setInviterName(result.name)
        setInviterPubkey(result.pubkey)
        setJoinName(result.name) // pre-fill with inviter's name
        setLookupState('found')
      }
    })
  }, [joinCode, lookupDone])

  const resetJoin = () => {
    setJoinCode('')
    setJoinName('')
    setInviterName('')
    setInviterPubkey('')
    setLookupState('idle')
    setLookupDone(false)
  }

  const handleConfirm = () => {
    if (lookupState !== 'found' || !joinName.trim() || !inviterPubkey) return
    addContact(inviterPubkey, joinName.trim())
    resubscribeAll()
    showStatus(`${joinName.trim()} hinzugefügt!`, 3000)
    close()
  }

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')

  // ── JOIN VIEW ──
  if (view === 'join') {
    return (
      <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
        <div className="modal">
          <button className="modal-back-btn" onClick={() => { setView('invite'); resetJoin() }}>
            <ArrowLeft size={15} /> Zurück
          </button>

          <div className="modal-title">Code eingeben</div>

          {/* Code input — always visible */}
          <div>
            <div className="setup-label">6-stelliger Code</div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123 456"
              maxLength={6}
              value={joinCode}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                setJoinCode(val)
                if (val.length < 6) { setLookupState('idle'); setLookupDone(false); setInviterName(''); setJoinName('') }
              }}
              style={{ letterSpacing: '0.5em', fontSize: '1.8rem', textAlign: 'center', fontFamily: 'monospace' }}
              autoFocus
              disabled={lookupState === 'searching'}
            />
          </div>

          {/* Searching indicator */}
          {lookupState === 'searching' && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              Suche läuft…
            </div>
          )}

          {/* Not found */}
          {lookupState === 'not_found' && (
            <div style={{ fontSize: '0.82rem', color: '#e07070', background: '#2a1818', border: '1px solid #5a2a2a', borderRadius: 8, padding: '0.7rem 0.9rem' }}>
              Code nicht gefunden oder abgelaufen. Bitte einen neuen Code anfordern.
            </div>
          )}

          {/* Found — show inviter info + name field */}
          {lookupState === 'found' && (
            <>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Einladung von
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)' }}>
                  {inviterName || 'Unbekannt'}
                </div>
              </div>

              <div>
                <div className="setup-label">Unter welchem Namen speichern?</div>
                <input
                  type="text"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  maxLength={30}
                  placeholder={inviterName}
                  autoFocus
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                  Du kannst den Namen jederzeit ändern.
                </div>
              </div>

              <button
                className="btn"
                style={{ width: '100%' }}
                onClick={handleConfirm}
                disabled={!joinName.trim()}
              >
                Hinzufügen
              </button>
            </>
          )}

          <button className="btn secondary" style={{ width: '100%' }} onClick={close}>Abbrechen</button>
        </div>
      </div>
    )
  }

  // ── INVITE VIEW ──
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">Jemanden einladen</div>
        <div className="modal-subtitle">
          Gib einen Namen ein, erstelle einen Code und schick ihn per WhatsApp oder SMS.
        </div>

        {!code ? (
          <>
            <div>
              <div className="setup-label">Wie soll dein Kontakt heißen?</div>
              <input
                type="text"
                placeholder="z.B. Oma, Leon, Mama …"
                maxLength={30}
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && inviteName.trim() && generateCode()}
                autoFocus
              />
            </div>

            <button
              className="btn"
              style={{ width: '100%' }}
              onClick={generateCode}
              disabled={publishing || !inviteName.trim()}
            >
              <UserPlus size={16} style={{ marginRight: '0.4rem' }} />
              {publishing ? 'Wird erstellt…' : 'Code erstellen'}
            </button>
          </>
        ) : (
          <>
            <div
              onClick={copyCode}
              title="Klicken zum Kopieren"
              style={{
                textAlign: 'center', cursor: 'pointer',
                background: 'var(--surface2)', border: '2px solid var(--accent)',
                borderRadius: 12, padding: '1.4rem 1rem', position: 'relative',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Code für {inviteName}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '2.8rem', letterSpacing: '0.45em', fontWeight: 700, color: 'var(--accent)' }}>
                {code}
              </div>
              <div style={{ fontSize: '0.75rem', color: copied ? 'var(--accent)' : 'var(--muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                {copied ? <><Check size={13} /> Kopiert!</> : <><Copy size={13} /> Tippen zum Kopieren</>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: remaining < 60 ? '#e07070' : 'var(--muted)' }}>
              <span>Gültig noch {m}:{s}</span>
              <button className="btn secondary small" onClick={generateCode} disabled={publishing}>
                Neu erstellen
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, background: 'var(--surface2)', borderRadius: 8, padding: '0.7rem 0.9rem' }}>
              Schick den Code an <strong style={{ color: 'var(--text)' }}>{inviteName}</strong>. Sobald der Code eingegeben wird, erscheint <strong style={{ color: 'var(--text)' }}>{inviteName}</strong> automatisch in deiner Kontaktliste.
            </div>
          </>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <KeyRound size={14} style={{ color: 'var(--muted)' }} />
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Code bekommen?</span>
          <button
            onClick={() => setView('join')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-body)', textDecoration: 'underline' }}
          >
            Hier eingeben
          </button>
        </div>

        <button className="btn secondary" style={{ width: '100%' }} onClick={close}>Schließen</button>
      </div>
    </div>
  )
}
