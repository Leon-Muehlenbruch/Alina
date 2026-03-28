import { useStore } from '../../store/useStore'
import { Avatar } from '../ui/Avatar'
import { lastMsgPreview } from '../../lib/utils'

export function ContactList() {
  const contacts = useStore(s => s.contacts)
  const messages = useStore(s => s.messages)
  const unread = useStore(s => s.unread)
  const activeChat = useStore(s => s.activeChat)
  const setActiveChat = useStore(s => s.setActiveChat)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)

  const items = Object.values(contacts)

  const handleClick = (c: { pubkey: string; name: string }) => {
    const chatId = 'dm:' + c.pubkey
    setActiveChat({ type: 'dm', id: c.pubkey, name: c.name, chatId })
    setSidebarOpen(false)
  }

  if (!items.length) {
    return (
      <div className="sidebar-empty">
        No contacts yet.<br />Tap + to add someone.
      </div>
    )
  }

  return (
    <>
      {items.map(c => {
        const chatId = 'dm:' + c.pubkey
        const isActive = activeChat?.chatId === chatId
        const ub = unread[chatId] || 0
        const msgs = messages[chatId] || []

        return (
          <div
            key={c.pubkey}
            className={`contact-item${isActive ? ' active' : ''}`}
            onClick={() => handleClick(c)}
          >
            <Avatar name={c.name} />
            <div className="contact-info">
              <div className="contact-name">{c.name}</div>
              <div className="contact-sub">{lastMsgPreview(msgs)}</div>
            </div>
            {ub > 0 && <div className="unread-badge">{ub}</div>}
          </div>
        )
      })}
    </>
  )
}
