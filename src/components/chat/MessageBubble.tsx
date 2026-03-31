import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import type { Message } from '../../store/useStore'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { formatTime } from '../../lib/utils'
import { translate, getLangName } from '../../lib/translate'

interface MessageBubbleProps {
  msg: Message
  isMine: boolean
  isRoom: boolean
  senderName?: string
  onImageClick: (src: string) => void
}

export function MessageBubble({ msg, isMine, isRoom, senderName, onImageClick }: MessageBubbleProps) {
  const lang = useStore(s => s.lang)
  const autoTranslate = useStore(s => s.autoTranslate)
  const setMessageTranslation = useStore(s => s.setMessageTranslation)
  const activeChat = useStore(s => s.activeChat)
  const t = useT()

  const [showOriginal, setShowOriginal] = useState(false)
  const [translating, setTranslating] = useState(false)

  // Trigger translation for incoming text messages
  useEffect(() => {
    if (
      !autoTranslate ||
      isMine ||
      msg.type !== 'text' ||
      !msg.content ||
      msg.translated ||
      !activeChat
    ) return

    setTranslating(true)
    translate(msg.content, lang).then(result => {
      setTranslating(false)
      // Only store if it's actually a different language
      if (result.from !== lang && result.text !== msg.content) {
        setMessageTranslation(activeChat.chatId, msg.ts, msg.pubkey, result.text, result.from)
      }
    }).catch(() => setTranslating(false))
  }, [autoTranslate, msg.content, msg.translated, lang]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayText = msg.type === 'text'
    ? (msg.translated && !showOriginal ? msg.translated : msg.content)
    : msg.content

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
        <div className="msg-bubble">{displayText}</div>
      )}

      {/* Translation meta row */}
      {msg.type === 'text' && !isMine && (
        <div className="msg-translate-row">
          {translating && (
            <span className="msg-translate-hint">{t('translate.translating')}</span>
          )}
          {msg.translated && msg.detectedLang && (
            <>
              <span className="msg-translate-hint">
                {t('translate.from', { lang: getLangName(msg.detectedLang) })}
              </span>
              <button
                className="msg-translate-toggle"
                onClick={() => setShowOriginal(p => !p)}
              >
                {showOriginal ? t('translate.showTranslation') : t('translate.showOriginal')}
              </button>
            </>
          )}
        </div>
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
