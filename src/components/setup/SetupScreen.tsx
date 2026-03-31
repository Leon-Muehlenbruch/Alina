import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'

export function SetupScreen() {
  const createIdentity = useStore(s => s.createIdentity)
  const importIdentity = useStore(s => s.importIdentity)
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
