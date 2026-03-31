import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  onImageClick: (src: string) => void
}

export function MessageList({ onImageClick }: MessageListProps) {
  const activeChat = useStore(s => s.activeChat)
  const messages = useStore(s => s.messages)
  const identity = useStore(s => s.identity)
  const contacts = useStore(s => s.contacts)
  const t = useT()
  const containerRef = useRef<HTMLDivElement>(null)

  const chatMessages = activeChat ? (messages[activeChat.chatId] || []) : []

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [chatMessages.length])

  if (!activeChat) return null

  return (
    <div className="chat-messages" ref={containerRef}>
      {chatMessages.length === 0 && (
        <div className="msg-system">{t('msg.start')}</div>
      )}
      {chatMessages.map((msg, i) => {
        const isMine = msg.pubkey === identity?.pubkey
        const senderName = !isMine && activeChat.type === 'room'
          ? (msg.name || contacts[msg.pubkey]?.name || msg.pubkey.slice(0, 8) + '...')
          : undefined

        return (
          <MessageBubble
            key={`${msg.ts}-${msg.pubkey}-${i}`}
            msg={msg}
            isMine={isMine}
            isRoom={activeChat.type === 'room'}
            senderName={senderName}
            onImageClick={onImageClick}
          />
        )
      })}
    </div>
  )
}
