import { useState, useRef, useCallback } from 'react'
import { ImagePlus, MapPin, Send } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { publishDM, publishRoomMessage, getRelayCount } from '../../lib/nostr'
import { getW3WWords } from '../../lib/w3w'
import { MAX_IMAGE_SIZE } from '../../lib/constants'
import { enqueue, isOnline } from '../../lib/offlineQueue'
import { EmojiPicker } from './EmojiPicker'

export function ChatInput() {
  const activeChat = useStore(s => s.activeChat)
  const identity = useStore(s => s.identity)
  const addMessage = useStore(s => s.addMessage)
  const showStatus = useStore(s => s.showStatus)
  const hideStatus = useStore(s => s.hideStatus)
  const t = useT()

  const [text, setText] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px' }
  }, [])
  const publishMessage = async (msgData: { type: string; content: string }) => {
    if (!activeChat || !identity) return
    const localMsg = { type: msgData.type as 'text' | 'image' | 'location', content: msgData.content, pubkey: identity.pubkey, ts: Date.now() }
    addMessage(activeChat.chatId, localMsg)

    // If offline or no relays connected, queue for later
    if (!isOnline() || getRelayCount() === 0) {
      enqueue({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        chatType: activeChat.type,
        chatId: activeChat.chatId,
        recipientOrRoomHash: activeChat.id,
        msgData: activeChat.type === 'room' ? { ...msgData, name: identity.name } : msgData,
        timestamp: Date.now(),
      })
      showStatus(t('input.queuedOffline'), 3000)
      return
    }

    try {
      if (activeChat.type === 'dm') {
        await publishDM(identity.privkey, identity.pubkey, activeChat.id, msgData)
      } else {
        await publishRoomMessage(identity.privkey, identity.pubkey, activeChat.id, { ...msgData, name: identity.name })
      }
    } catch (e) { console.warn('Publish failed:', e) }
  }
  const handleSend = async () => {
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await publishMessage({ type: 'text', content })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) { alert(t('input.imageTooLarge')); return }
    const reader = new FileReader()
    reader.onload = async (ev) => { await publishMessage({ type: 'image', content: ev.target?.result as string }) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleLocation = () => {
    if (!navigator.geolocation) { alert(t('input.locationUnavailable')); return }
    showStatus(t('input.locating'))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        hideStatus()
        try {          const words = await getW3WWords(pos.coords.latitude, pos.coords.longitude)
          await publishMessage({ type: 'location', content: JSON.stringify({ words, lat: pos.coords.latitude, lng: pos.coords.longitude }) })
        } catch { alert(t('input.w3wUnavailable')) }
      },
      () => { hideStatus(); alert(t('input.locationDenied')) },
    )
  }

  if (!activeChat) return null

  return (
    <div className="chat-input-bar" onClick={() => setEmojiOpen(false)}>
      <EmojiPicker open={emojiOpen} onSelect={emoji => { setText(prev => prev + emoji); textareaRef.current?.focus() }} onClose={() => setEmojiOpen(false)} />

      <button className="attach-btn" onClick={() => fileInputRef.current?.click()} title={t('input.sendImage')}>
        <ImagePlus size={18} />
      </button>
      <button className="loc-btn" onClick={handleLocation} title={t('input.sendLocation')}>
        <MapPin size={18} />
      </button>

      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          id="msg-input"
          rows={1}
          placeholder={t('input.placeholder')}
          value={text}
          onChange={e => { setText(e.target.value); autoResize() }}
          onKeyDown={handleKeyDown}        />
        <button className="emoji-btn" onClick={e => { e.stopPropagation(); setEmojiOpen(!emojiOpen) }}>
          😊
        </button>
      </div>

      <button className="send-btn" onClick={handleSend}>
        <Send size={16} />
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
    </div>
  )
}
