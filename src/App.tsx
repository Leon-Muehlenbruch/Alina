import { useEffect, useState, useCallback } from 'react'
import { useStore } from './store/useStore'
import { useNostrRelays } from './hooks/useNostrRelays'
import { useEphemeralCleanup } from './hooks/useEphemeralCleanup'
import { SetupScreen } from './components/setup/SetupScreen'
import { Sidebar } from './components/sidebar/Sidebar'
import { ChatArea } from './components/chat/ChatArea'
import { AddContactModal } from './components/modals/AddContactModal'
import { AddRoomModal } from './components/modals/AddRoomModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { StatusBar } from './components/ui/StatusBar'
import { AppSplash } from './components/ui/AppSplash'

export function App() {
  const identity = useStore(s => s.identity)
  const openModal = useStore(s => s.openModal)
  const setOpenModal = useStore(s => s.setOpenModal)
  const [showSplash, setShowSplash] = useState(true)

  useNostrRelays()
  useEphemeralCleanup()

  // Apply brand colour to pwa-install dialog
  useEffect(() => {
    const el = document.querySelector('pwa-install') as any
    if (el) el.styles = { '--tint-color': '#c8a97e' }
  }, [])

  const hideSplash = useCallback(() => setShowSplash(false), [])

  if (showSplash) {
    return <AppSplash onDone={hideSplash} />
  }

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
