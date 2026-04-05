import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { connectAllRelays, disconnectAllRelays, setOnMessage, setGetState, setRelayCountListener, publishDM, publishRoomMessage, publishRoomPresence } from '../lib/nostr'
import { setFlushCallback, flushQueue } from '../lib/offlineQueue'
import type { Message, ActiveChat } from '../store/useStore'

export function useNostrRelays() {
  const identity = useStore(s => s.identity)
  const contacts = useStore(s => s.contacts)
  const rooms = useStore(s => s.rooms)
  const addMessage = useStore(s => s.addMessage)
  const incrementUnread = useStore(s => s.incrementUnread)
  const ensureContact = useStore(s => s.ensureContact)
  const addRoomMember = useStore(s => s.addRoomMember)
  const activeChat = useStore(s => s.activeChat)

  // Use a ref so the onMessage callback always sees the latest activeChat
  // without needing to re-register on every chat switch
  const setRelayCount = useStore(s => s.setRelayCount)

  const activeChatRef = useRef<ActiveChat | null>(activeChat)
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])
  useEffect(() => {
    if (!identity) return

    setGetState(() => ({
      privkey: identity.privkey,
      pubkey: identity.pubkey,
      contacts,
      rooms,
      addRoomMember,
    }))

    setRelayCountListener(setRelayCount)

    setOnMessage((chatId: string, msg: Message) => {
      if (chatId.startsWith('dm:')) {
        const pubkey = chatId.slice(3)
        ensureContact(pubkey, pubkey.slice(0, 8) + '...')
      }

      const added = addMessage(chatId, msg)
      if (added) {
        // Vibrate on incoming message
        if (navigator.vibrate) navigator.vibrate(200)

        if (activeChatRef.current?.chatId !== chatId) {
          incrementUnread(chatId)
        }
      }
    })

    // Wire up offline queue flush
    setFlushCallback(async (queued) => {
      if (!identity) return
      if (queued.chatType === 'dm') {        await publishDM(identity.privkey, identity.pubkey, queued.recipientOrRoomHash, queued.msgData)
      } else {
        await publishRoomMessage(identity.privkey, identity.pubkey, queued.recipientOrRoomHash, queued.msgData as { type: string; content: string; name: string })
      }
    })

    connectAllRelays()

    // Flush any queued offline messages after connecting
    setTimeout(() => flushQueue(), 3000)

    return () => {
      setRelayCountListener(null)
      setFlushCallback(null)
      disconnectAllRelays()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity?.pubkey])

  // Keep getState callback up to date when contacts/rooms change
  useEffect(() => {
    if (!identity) return
    setGetState(() => ({
      privkey: identity.privkey,
      pubkey: identity.pubkey,
      contacts,
      rooms,
      addRoomMember,
    }))
  }, [identity, contacts, rooms, addRoomMember])
}
