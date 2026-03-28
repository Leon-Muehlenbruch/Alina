import { useState } from 'react'
import { useStore } from '../../store/useStore'

export function SetupScreen() {
  const createIdentity = useStore(s => s.createIdentity)
  const importIdentity = useStore(s => s.importIdentity)

  const [setupName, setSetupName] = useState('')
  const [importKey, setImportKey] = useState('')
  const [importName, setImportName] = useState('')

  const handleCreate = () => {
    if (!setupName.trim()) { alert('Please enter a name.'); return }
    createIdentity(setupName.trim())
  }

  const handleImport = () => {
    if (!importKey.trim() || !importName.trim()) {
      alert('Please fill in all fields.')
      return
    }
    try {
      importIdentity(importKey.trim(), importName.trim())
    } catch {
      alert('Invalid private key.')
    }
  }

  return (
    <div id="screen-setup" className="screen active">
      <div className="setup-inner">
        <div className="logo-block">
          <div className="logo-name">Alina</div>
          <div className="logo-tagline">Secure &middot; Decentralised &middot; Yours</div>
        </div>

        <div className="setup-card">
          <div>
            <div className="setup-label">Your name</div>
            <input
              type="text"
              placeholder="e.g. Kay"
              maxLength={30}
              value={setupName}
              onChange={e => setSetupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="warning-box">
            🔑 A key pair will be generated for you. Nobody but you knows your private key. Write it down — lose it and you lose your account.
          </div>
          <button className="btn" onClick={handleCreate}>Create new identity</button>
        </div>

        <div className="setup-divider">or import existing key</div>

        <div className="setup-card">
          <div>
            <div className="setup-label">Private key (nsec...)</div>
            <input
              type="text"
              placeholder="nsec1..."
              value={importKey}
              onChange={e => setImportKey(e.target.value)}
              style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}
            />
          </div>
          <div>
            <div className="setup-label">Your name</div>
            <input
              type="text"
              placeholder="e.g. Alina"
              maxLength={30}
              value={importName}
              onChange={e => setImportName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImport()}
            />
          </div>
          <button className="btn secondary" onClick={handleImport}>Import</button>
        </div>
      </div>
    </div>
  )
}
