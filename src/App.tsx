import { useStore } from './store/useStore'
import { useNostrRelays } from './hooks/useNostrRelays'
import { SetupScreen } from './components/setup/SetupScreen'
import { Sidebar } from './components/sidebar/Sidebar'
import { ChatArea } from './components/chat/ChatArea'
import { AddContactModal } from './components/modals/AddContactModal'
import { AddRoomModal } from './components/modals/AddRoomModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatusBar } from './components/ui/StatusBar'

export function App() {
  const identity = useStore(s => s.identity)
  const openModal = useStore(s => s.openModal)
  const setOpenModal = useStore(s => s.setOpenModal)

  // Connect to Nostr relays when identity is available
  useNostrRelays()

  if (!identity) {
    return <SetupScreen />
  }

  return (
    <div id="screen-app" className="screen active">
      <Sidebar />
      <ChatArea />

      {openModal === 'add-contact' && <AddContactModal />}
      {openModal === 'add-room' && <AddRoomModal />}
      {openModal === 'settings' && <SettingsModal />}

      <StatusBar />
    </div>
  )
}
