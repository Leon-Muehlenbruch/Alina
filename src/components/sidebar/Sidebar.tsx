import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ContactList } from './ContactList'
import { RoomList } from './RoomList'

export function Sidebar() {
  const [tab, setTab] = useState<'contacts' | 'rooms'>('contacts')
  const setOpenModal = useStore(s => s.setOpenModal)
  const sidebarOpen = useStore(s => s.sidebarOpen)

  return (
    <div className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">Alina</span>
        <div className="sidebar-actions">
          <button className="btn icon-btn" title="Add contact" onClick={() => setOpenModal('add-contact')}>
            +
          </button>
          <button className="btn icon-btn" title="Group room" onClick={() => setOpenModal('add-room')}>
            ⊞
          </button>
          <button className="btn icon-btn" title="Settings" onClick={() => setOpenModal('settings')}>
            ⚙
          </button>
        </div>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`tab-btn${tab === 'contacts' ? ' active' : ''}`}
          onClick={() => setTab('contacts')}
        >
          Contacts
        </button>
        <button
          className={`tab-btn${tab === 'rooms' ? ' active' : ''}`}
          onClick={() => setTab('rooms')}
        >
          Rooms
        </button>
      </div>

      <div className="sidebar-list">
        {tab === 'contacts' ? <ContactList /> : <RoomList />}
      </div>
    </div>
  )
}
