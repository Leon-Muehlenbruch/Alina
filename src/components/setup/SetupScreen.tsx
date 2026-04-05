import { useState, useEffect } from 'react'
import { KeyRound } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { lookupInviteCode, resubscribeAll } from '../../lib/nostr'
import type { Lang } from '../../lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

type LookupState = 'idle' | 'searching' | 'found' | 'not_found'

export function SetupScreen() {
  const createIdentity = useStore(s => s.createIdentity)
  const importIdentity = useStore(s => s.importIdentity)
  const addContact = useStore(s => s.addContact)
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const t = useT()

  const [setupName, setSetupName] = useState('')
  const [importKey, setImportKey] = useState('')
  const [importName, setImportName] = useState('')

  // Invite code flow
  const [showInvite, setShowInvite] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [inviterName, setInviterName] = useState('')
  const [inviterPubkey, setInviterPubkey] = useState('')
  const [myName, setMyName] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>('idle')
  const [lookupDone, setLookupDone] = useState(false)

  const handleCreate = () => {
    if (!setupName.trim()) { alert(t('setup.errorName')); return }
    createIdentity(setupName.trim())
  }

  const handleImport = () => {
    if (!importKey.trim() || !importName.trim()) {
      alert(t('setup.errorFields'))
      return
    }
    try {
      importIdentity(importKey.trim(), importName.trim())
    } catch {
      alert(t('setup.errorKey'))
    }
  }

  // Auto-lookup when 6 digits entered
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
        setMyName('')
        setLookupState('found')
      }
    })
  }, [joinCode, lookupDone])

  const handleJoin = () => {
    if (lookupState !== 'found' || !myName.trim() || !inviterPubkey) return
    // Create identity first, then add contact
    createIdentity(myName.trim())
    // addContact will run after identity is created (store is sync)
    setTimeout(() => {
      addContact(inviterPubkey, inviterName)
      resubscribeAll()
    }, 100)
  }

  const resetInvite = () => {
    setJoinCode('')
    setInviterName('')
    setInviterPubkey('')
    setMyName('')
    setLookupState('idle')
    setLookupDone(false)
  }

  return (
    <div id="screen-setup" className="screen active">
      <div className="setup-inner">
        <div className="logo-block">
          <img src="/logo-icon.svg" alt="Alina" className="setup-logo-img" />
          <div className="logo-name">alina</div>
          <div className="logo-tagline">{t('setup.tagline')}</div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem', justifyContent: 'center' }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  padding: '0.25rem 0.7rem',
                  borderRadius: 6,
                  border: `1px solid ${lang === l.code ? 'var(--accent)' : 'var(--border)'}`,
                  background: lang === l.code ? 'var(--accent)' : 'transparent',
                  color: lang === l.code ? '#1a1a1b' : 'var(--muted)',
                  fontWeight: lang === l.code ? 700 : 400,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── INVITE CODE SECTION ── */}
        {showInvite ? (
          <div className="setup-card" style={{ borderColor: 'var(--accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <KeyRound size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>{t('setup.enterCode')}</span>
            </div>

            <div>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t('setup.codePlaceholder')}
                maxLength={6}
                value={joinCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setJoinCode(val)
                  if (val.length < 6) { setLookupState('idle'); setLookupDone(false); setInviterName(''); setMyName('') }
                }}
                style={{ letterSpacing: '0.4em', fontSize: '1.6rem', textAlign: 'center', fontFamily: 'monospace' }}
                autoFocus
                disabled={lookupState === 'searching'}
              />
            </div>

            {lookupState === 'searching' && (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                {t('setup.searching')}
              </div>
            )}

            {lookupState === 'not_found' && (
              <div style={{ fontSize: '0.82rem', color: '#e07070', background: '#2a1818', border: '1px solid #5a2a2a', borderRadius: 8, padding: '0.7rem 0.9rem' }}>
                {t('setup.notFound')}
              </div>
            )}

            {lookupState === 'found' && (
              <>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '0.8rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {t('setup.inviteFrom')}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent)' }}>
                    {inviterName}
                  </div>
                </div>

                <div>
                  <div className="setup-label">{t('setup.yourName')}</div>
                  <input
                    type="text"
                    placeholder={t('setup.namePlaceholder')}
                    maxLength={30}
                    value={myName}
                    onChange={e => setMyName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && myName.trim() && handleJoin()}
                    autoFocus
                  />
                </div>

                <button className="btn" style={{ width: '100%' }} onClick={handleJoin} disabled={!myName.trim()}>
                  {t('setup.joinBtn')}
                </button>
              </>
            )}

            <button
              className="btn secondary"
              style={{ width: '100%', fontSize: '0.82rem' }}
              onClick={() => { setShowInvite(false); resetInvite() }}
            >
              {t('contact.back')}
            </button>
          </div>
        ) : (
          <>
            {/* ── INVITE CODE BUTTON ── */}
            <button
              className="btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '1rem',
                background: 'var(--accent)',
                color: '#1a1410',
                fontWeight: 600,
              }}
              onClick={() => setShowInvite(true)}
            >
              <KeyRound size={18} />
              {t('setup.haveCode')}
            </button>

            <div className="setup-divider" style={{ fontSize: '0.78rem' }}>{t('setup.orImport').replace('import existing key', 'create new account').replace('импортировать существующий ключ', 'создать новый аккаунт')}</div>

            {/* ── CREATE NEW ── */}
            <div className="setup-card">
              <div>
                <div className="setup-label">{t('setup.nameLabel')}</div>
                <input
                  type="text"
                  placeholder={t('setup.namePlaceholder')}
                  maxLength={30}
                  value={setupName}
                  onChange={e => setSetupName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="warning-box">{t('setup.keyWarning')}</div>
              <button className="btn" onClick={handleCreate}>{t('setup.createBtn')}</button>
            </div>

            <div className="setup-divider">{t('setup.orImport')}</div>

            <div className="setup-card">
              <div>
                <div className="setup-label">{t('setup.privkeyLabel')}</div>
                <input
                  type="text"
                  placeholder="nsec1..."
                  value={importKey}
                  onChange={e => setImportKey(e.target.value)}
                  style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <div className="setup-label">{t('setup.nameLabel')}</div>
                <input
                  type="text"
                  placeholder={t('setup.importNamePlaceholder')}
                  maxLength={30}
                  value={importName}
                  onChange={e => setImportName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleImport()}
                />
              </div>
              <button className="btn secondary" onClick={handleImport}>{t('setup.importBtn')}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
