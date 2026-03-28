import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ChatHeader } from './ChatHeader'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Lightbox } from '../ui/Lightbox'

export function ChatArea() {
  const activeChat = useStore(s => s.activeChat)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  if (!activeChat) {
    return (
      <div className="chat-area">
        <div className="chat-empty-state">
          <div className="big-logo">Alina</div>
          <p>Select a contact or room</p>
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
