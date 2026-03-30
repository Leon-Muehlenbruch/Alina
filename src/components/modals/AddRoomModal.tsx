import { useState } from 'react'
import { Copy, Check, Users } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { hashRoomName } from '../../lib/crypto'
import { subscribeToRoom } from '../../lib/nostr'

type View = 'create' | 'share'

export function AddRoomModal() {
  const setOpenModal = useStore(s => s.setOpenModal)
  const addRoom = useStore(s => s.addRoom)
  const setActiveChat = useStore(s => s.setActiveChat)
  const showStatus = useStore(s => s.showStatus)

  const [view, setView] = useState<View>('create')
  const [roomName, setRoomName] = useState('')
  const [copied, setCopied] = useState(false)

  const close = () => setOpenModal(null)

  const handleCreate = async () => {
    const name = roomName.trim()
    if (!name) return
    const hash = await hashRoomName(name)
    addRoom(hash, name)
    subscribeToRoom(hash)
    setActiveChat({ type: 'room', id: hash, name, chatId: 'room:' + hash })
    setView('share')
  }

  const copyName = () => {
    navigator.clipboard.writeText(roomName.trim()).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDone = () => {
    showStatus(`Gruppe „${roomName.trim()}" erstellt`, 2000)
    close()
  }

  if (view === 'share') {
    return (
      <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
        <div className="modal">
          <div className="modal-title">Leute einladen</div>
          <div className="modal-subtitle">
            Schick den Gruppenname an alle, die du einladen möchtest. Wer denselben Namen eingibt, landet automatisch im gleichen Gespräch.
          </div>

          <div
            onClick={copyName}
            title="Klicken zum Kopieren"
            style={{
              textAlign: 'center', cursor: 'pointer',
              background: 'var(--surface2)', border: '2px solid var(--accent)',
              borderRadius: 12, padding: '1.2rem 1rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Gruppenname
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>
              {roomName.trim()}
            </div>
            <div style={{ fontSize: '0.75rem', color: copied ? 'var(--accent)' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              {copied ? <><Check size={13} /> Kopiert!</> : <><Copy size={13} /> Tippen zum Kopieren</>}
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, background: 'var(--surface2)', borderRadius: 8, padding: '0.7rem 0.9rem' }}>
            Die andere Person öffnet Alina, tippt auf <strong style={{ color: 'var(--text)' }}>Gruppe</strong> und gibt denselben Gruppenname ein — fertig.
          </div>

          <button className="btn" style={{ width: '100%' }} onClick={handleDone}>
            <Users size={16} style={{ marginRight: '0.4rem' }} />
            Fertig
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">Gruppe erstellen</div>
        <div className="modal-subtitle">
          Alle die denselben Gruppenname eingeben, landen automatisch im gleichen Gespräch.
        </div>

        <div>
          <div className="setup-label">Gruppenname</div>
          <input
            type="text"
            placeholder="z.B. Familie, Freunde, Arbeit …"
            maxLength={50}
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && roomName.trim() && handleCreate()}
            autoFocus
          />
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Tipp: Je einzigartiger der Name, desto sicherer ist die Gruppe.
          </div>
        </div>

        <button
          className="btn"
          style={{ width: '100%' }}
          onClick={handleCreate}
          disabled={!roomName.trim()}
        >
          Gruppe erstellen
        </button>

        <button className="btn secondary" style={{ width: '100%' }} onClick={close}>
          Abbrechen
        </button>
      </div>
    </div>
  )
}
