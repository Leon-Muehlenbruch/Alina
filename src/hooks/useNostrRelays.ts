import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { connectAllRelays, disconnectAllRelays, setOnMessage, setGetState } from '../lib/nostr'
import type { Message } from '../store/useStore'

export function useNostrRelays() {
  const identity = useStore(s => s.identity)
  const contacts = useStore(s => s.contacts)
  const rooms = useStore(s => s.rooms)
  const addMessage = useStore(s => s.addMessage)
  const incrementUnread = useStore(s => s.incrementUnread)
  const ensureContact = useStore(s => s.ensureContact)
  const activeChat = useStore(s => s.activeChat)

  useEffect(() => {
    if (!identity) return

    setGetState(() => ({
      privkey: identity.privkey,
      pubkey: identity.pubkey,
      contacts,
      rooms,
    }))

    setOnMessage((chatId: string, msg: Message) => {
      // Auto-add unknown DM contacts
      if (chatId.startsWith('dm:')) {
        const pubkey = chatId.slice(3)
        ensureContact(pubkey, pubkey.slice(0, 8) + '...')
      }

      const added = addMessage(chatId, msg)
      if (added && activeChat?.chatId !== chatId) {
        incrementUnread(chatId)
      }
    })

    connectAllRelays()

    return () => {
      disconnectAllRelays()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.pubkey])

  // Keep getState callback up to date
  useEffect(() => {
    if (!identity) return
    setGetState(() => ({
      privkey: identity.privkey,
      pubkey: identity.pubkey,
      contacts,
      rooms,
    }))
  }, [identity, contacts, rooms])
}
