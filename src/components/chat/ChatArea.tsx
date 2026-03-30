import { useState } from 'react'
import { MessageCirclePlus, Users } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Lightbox } from '../ui/Lightbox'

export function ChatArea() {
  const activeChat = useStore(s => s.activeChat)
  const setOpenModal = useStore(s => s.setOpenModal)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (!activeChat) {
    return (
      <div className="chat-area">
        <div className="chat-empty-state">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--border)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Alina
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '0.3rem', fontWeight: 500 }}>
            Sicher. Dezentral. Deins.
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--border)', marginBottom: '2rem' }}>
            Keine Werbung. Kein Server. Kein Konto nötig.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setOpenModal('add-contact')}
            >
              <MessageCirclePlus size={16} /> Jemanden einladen
            </button>
            <button
              className="btn secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setOpenModal('add-room')}
            >
              <Users size={16} /> Gruppe erstellen
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      <div id="chat-view" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <ChatHeader />
        <MessageList onImageClick={setLightboxSrc} />
        <ChatInput />
      </div>
      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
