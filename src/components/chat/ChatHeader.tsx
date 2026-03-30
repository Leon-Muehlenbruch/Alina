import { ArrowLeft, Copy, Lock } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { Avatar } from '../ui/Avatar'
import { encodeNpub } from '../../lib/crypto'

export function ChatHeader() {
  const activeChat = useStore(s => s.activeChat)
  const identity = useStore(s => s.identity)
  const showStatus = useStore(s => s.showStatus)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)

  if (!activeChat) return null

  const isGroup = activeChat.type === 'room'

  const copyPubkey = () => {
    if (!identity?.pubkey) return
    navigator.clipboard.writeText(encodeNpub(identity.pubkey))
      .then(() => showStatus('Public Key kopiert!', 2000))
      .catch(() => {})
  }

  return (
    <div className="chat-header">
      <button className="btn icon-btn mobile-back" onClick={() => setSidebarOpen(true)} title="Zurück">
        <ArrowLeft size={18} />
      </button>
      <Avatar name={activeChat.name} isGroup={isGroup} />
      <div className="chat-header-info">
        <div className="chat-header-name">{activeChat.name}</div>
        <div className="chat-header-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {!isGroup && <Lock size={11} />}
          {isGroup ? 'Gruppe · bis zu 10 Personen' : 'Ende-zu-Ende verschlüsselt'}
        </div>
      </div>
      <button className="btn icon-btn" onClick={copyPubkey} title="Public Key kopieren">
        <Copy size={16} />
      </button>
    </div>
  )
}
