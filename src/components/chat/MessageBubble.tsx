import { MapPin } from 'lucide-react'
import type { Message } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { useStore } from '../../store/useStore'
import { formatTime } from '../../lib/utils'

interface MessageBubbleProps {
  msg: Message
  isMine: boolean
  isRoom: boolean
  senderName?: string
  onImageClick: (src: string) => void
}

export function MessageBubble({ msg, isMine, isRoom, senderName, onImageClick }: MessageBubbleProps) {
  const lang = useStore(s => s.lang)
  const t = useT()

  return (
    <div className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
      {!isMine && isRoom && senderName && (
        <div className="msg-sender">{senderName}</div>
      )}

      {msg.type === 'image' ? (
        <div className="msg-bubble image-msg">
          <img
            src={msg.content}
            alt="Bild"
            onClick={() => onImageClick(msg.content)}
            style={{ maxWidth: 260, maxHeight: 260, borderRadius: 10, display: 'block', cursor: 'pointer' }}
          />
        </div>
      ) : msg.type === 'location' ? (
        <LocationBubble content={msg.content} isMine={isMine} openMapLabel={t('msg.openMap')} />
      ) : (
        <div className="msg-bubble">{msg.content}</div>
      )}

      <div className="msg-time">{formatTime(msg.ts, lang)}</div>
    </div>
  )
}

function LocationBubble({ content, isMine, openMapLabel }: { content: string; isMine: boolean; openMapLabel: string }) {
  try {
    const data = JSON.parse(content)
    return (
      <div className="msg-bubble location-msg">
        <MapPin size={18} style={{ flexShrink: 0 }} />
        <div>
          <div className="location-words">{data.words}</div>
          <a
            className={`location-link${isMine ? ' mine' : ''}`}
            href={`https://what3words.com/${data.words}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {openMapLabel}
          </a>
        </div>
      </div>
    )
  } catch {
    return <div className="msg-bubble">{content}</div>
  }
}
