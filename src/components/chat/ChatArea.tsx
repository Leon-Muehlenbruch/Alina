import { useState, useEffect } from 'react'
import { MessageCirclePlus, Users, Menu, UserPlus, KeyRound, Hash, Download, ArrowRight } from 'lucide-react'
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

  const guideSteps = [
    { icon: <UserPlus size={18} />, title: t('chat.guide1Title'), desc: t('chat.guide1Desc') },
    { icon: <ArrowRight size={18} />, title: t('chat.guide2Title'), desc: t('chat.guide2Desc') },
    { icon: <Hash size={18} />, title: t('chat.guide3Title'), desc: t('chat.guide3Desc') },
    { icon: <KeyRound size={18} />, title: t('chat.guide4Title'), desc: t('chat.guide4Desc') },
    { icon: <Download size={18} />, title: t('chat.guide5Title'), desc: t('chat.guide5Desc') },
  ]

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
          <img src="/logo-icon.svg" alt="alina" style={{ width: 56, height: 56, marginBottom: '0.1rem', flexShrink: 0 }} />
          <div style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: '2.8rem', color: 'var(--border)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
            alina
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.2rem', fontWeight: 500 }}>
            {t('chat.tagline')}
          </p>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '0.8rem' }}>
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

          {/* Guide */}
          <div className="onboarding-guide">
            <div className="onboarding-title">{t('chat.guideTitle')}</div>
            {guideSteps.map((step, i) => (
              <div key={i} className="onboarding-step">
                <div className="onboarding-icon">{step.icon}</div>
                <div>
                  <div className="onboarding-step-title">{step.title}</div>
                  <div className="onboarding-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
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
