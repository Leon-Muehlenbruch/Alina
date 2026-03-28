import { useStore } from '../../store/useStore'
import { Avatar } from '../ui/Avatar'
import { lastMsgPreview } from '../../lib/utils'

export function RoomList() {
  const rooms = useStore(s => s.rooms)
  const messages = useStore(s => s.messages)
  const unread = useStore(s => s.unread)
  const activeChat = useStore(s => s.activeChat)
  const setActiveChat = useStore(s => s.setActiveChat)
  const setSidebarOpen = useStore(s => s.setSidebarOpen)

  const items = Object.values(rooms)

  const handleClick = (r: { hash: string; name: string }) => {
    const chatId = 'room:' + r.hash
    setActiveChat({ type: 'room', id: r.hash, name: r.name, chatId })
    setSidebarOpen(false)
  }

  if (!items.length) {
    return (
      <div className="sidebar-empty">
        No rooms yet.<br />Tap ⊞ to create or join a room.
      </div>
    )
  }

  return (
    <>
      {items.map(r => {
        const chatId = 'room:' + r.hash
        const isActive = activeChat?.chatId === chatId
        const ub = unread[chatId] || 0
        const msgs = messages[chatId] || []

        return (
          <div
            key={r.hash}
            className={`room-item${isActive ? ' active' : ''}`}
            onClick={() => handleClick(r)}
          >
            <Avatar name={r.name} isGroup />
            <div className="contact-info">
              <div className="contact-name">{r.name}</div>
              <div className="contact-sub">{lastMsgPreview(msgs)}</div>
            </div>
            {ub > 0 && <div className="unread-badge">{ub}</div>}
          </div>
        )
      })}
    </>
  )
}
