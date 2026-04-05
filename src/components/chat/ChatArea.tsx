import { useState, useEffect } from 'react'
import { MessageCirclePlus, Users, Menu } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Lightbox } from '../ui/Lightbox'

export function ChatArea() {
  const activeChat = useStore(s => s.activeChat)
  const setOpenModal = useStore(s => s.setOpenModal)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)
  const t = useT()
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  // Auto-open sidebar when no chat is active (important for mobile)
  useEffect(() => {
    if (!activeChat) setSidebarOpen(true)
  }, [activeChat, setSidebarOpen])

  if (!activeChat) {
    return (
      <div className="chat-area">
        <div className="chat-empty-state">
          {/* Mobile: prominent button to open sidebar */}
          <button
            className="mobile-sidebar-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
            <span>{t('chat.openSidebar')}</span>
          </button>
          <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: '3.5rem', color: 'var(--border)', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            alina
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '0.3rem', fontWeight: 500 }}>
            {t('chat.tagline')}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--border)', marginBottom: '2rem' }}>
            {t('chat.noAccount')}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setOpenModal('add-contact')}
            >
              <MessageCirclePlus size={16} /> {t('chat.inviteSomeone')}
            </button>
            <button
              className="btn secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setOpenModal('add-room')}
            >
              <Users size={16} /> {t('chat.createGroup')}
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
