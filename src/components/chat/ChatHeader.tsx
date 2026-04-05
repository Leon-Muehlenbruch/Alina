import { ArrowLeft, Copy, Lock } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useT } from '../../hooks/useT'
import { Avatar } from '../ui/Avatar'
import { encodeNpub } from '../../lib/crypto'

export function ChatHeader() {
  const activeChat = useStore(s => s.activeChat)
  const identity = useStore(s => s.identity)
  const contacts = useStore(s => s.contacts)
  const showStatus = useStore(s => s.showStatus)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)
  const t = useT()

  if (!activeChat) return null

  const isGroup = activeChat.type === 'room'
  // Resolve display name from contacts store (in case name was updated after chat was opened)
  const displayName = !isGroup && activeChat.id && contacts[activeChat.id]?.name
    ? contacts[activeChat.id].name
    : activeChat.name

  const copyPubkey = () => {
    if (!identity?.pubkey) return
    navigator.clipboard.writeText(encodeNpub(identity.pubkey))
      .then(() => showStatus(t('header.pubkeyCopied'), 2000))
      .catch(() => {})
  }

  return (
    <div className="chat-header">
      <button className="btn icon-btn mobile-back" onClick={() => setSidebarOpen(true)} title={t('header.back')}>
        <ArrowLeft size={18} />
      </button>
      <Avatar name={displayName} isGroup={isGroup} />
      <div className="chat-header-info">
        <div className="chat-header-name">{displayName}</div>
        <div className="chat-header-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {!isGroup && <Lock size={11} />}
          {isGroup ? t('header.groupSubtitle') : t('header.encrypted')}
        </div>
      </div>
      <button className="btn icon-btn" onClick={copyPubkey} title={t('header.copyPubkey')}>
        <Copy size={16} />
      </button>
    </div>
  )
}
