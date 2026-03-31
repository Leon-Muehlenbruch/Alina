import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import type { Lang } from '../../lib/i18n'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
]

export function SetupScreen() {
  const createIdentity = useStore(s => s.createIdentity)
  const importIdentity = useStore(s => s.importIdentity)
  const lang = useStore(s => s.lang)
  const setLang = useStore(s => s.setLang)
  const t = useT()

  const [setupName, setSetupName] = useState('')
  const [importKey, setImportKey] = useState('')
  const [importName, setImportName] = useState('')

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

  return (
    <div id="screen-setup" className="screen active">
      <div className="setup-inner">
        <div className="logo-block">
          <div className="logo-name">Alina</div>
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
      </div>
    </div>
  )
}
