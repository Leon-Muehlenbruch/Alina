import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { hashRoomName } from '../../lib/crypto'
import { subscribeToRoom } from '../../lib/nostr'

export function AddRoomModal() {
  const setOpenModal = useStore(s => s.setOpenModal)
  const addRoom = useStore(s => s.addRoom)
  const setActiveChat = useStore(s => s.setActiveChat)
  const showStatus = useStore(s => s.showStatus)

  const [roomName, setRoomName] = useState('')

  const close = () => setOpenModal(null)

  const handleJoin = async () => {
    const name = roomName.trim()
    if (!name) { alert('Please enter a room name.'); return }

    const hash = await hashRoomName(name)
    addRoom(hash, name)
    subscribeToRoom(hash)
    close()
    setActiveChat({ type: 'room', id: hash, name, chatId: 'room:' + hash })
    showStatus(`Joined room "${name}"`, 2000)
  }

  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <div className="modal-title">Group room</div>
        <div className="modal-subtitle">
          Enter a room name. Everyone who knows the same name joins the same room — up to 10 people.
        </div>
        <div>
          <div className="setup-label">Room name</div>
          <input
            type="text"
            placeholder="e.g. family-smith"
            maxLength={50}
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
        </div>
        <div className="modal-actions">
          <button className="btn secondary" onClick={close}>Cancel</button>
          <button className="btn" onClick={handleJoin}>Join / Create</button>
        </div>
      </div>
    </div>
  )
}
