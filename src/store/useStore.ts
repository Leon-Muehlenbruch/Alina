import { create } from 'zustand'
import * as storage from '../lib/storage'
import { createKeyPair, pubkeyFromPrivkey, decodeNsec, decodeNpub } from '../lib/crypto'
import { MAX_MESSAGES_PER_CHAT } from '../lib/constants'
import type { Lang } from '../lib/i18n'

export interface Identity {
  privkey: Uint8Array
  pubkey: string
  name: string
}

export interface Contact {
  pubkey: string
  name: string
}

export interface Room {
  name: string
  hash: string
}

export interface Message {
  type: 'text' | 'image' | 'location'
  content: string
  pubkey: string
  name?: string
  ts: number
  eventId?: string
  translated?: string
  detectedLang?: string
  ttl?: number        // time-to-live in seconds (e.g. 30, 300, 3600)
  expiresAt?: number  // absolute timestamp (ms) when the message should vanish
}

export interface ActiveChat {
  type: 'dm' | 'room'
  id: string
  name: string
  chatId: string
}

interface AppState {
  // Identity
  identity: Identity | null
  createIdentity: (name: string) => void
  importIdentity: (nsec: string, name: string) => void
  updateName: (name: string) => void
  logout: () => void

  // Contacts
  contacts: Record<string, Contact>
  addContact: (pubkey: string, name: string) => void
  ensureContact: (pubkey: string, name: string) => void
  renameContact: (pubkey: string, name: string) => void
  deleteContact: (pubkey: string) => void

  // Rooms
  rooms: Record<string, Room>
  addRoom: (hash: string, name: string) => void

  // Messages
  messages: Record<string, Message[]>
  addMessage: (chatId: string, msg: Message) => boolean // returns false if duplicate

  // Active chat
  activeChat: ActiveChat | null
  setActiveChat: (chat: ActiveChat | null) => void

  // Unread
  unread: Record<string, number>
  clearUnread: (chatId: string) => void
  incrementUnread: (chatId: string) => void

  // Relay status
  relayCount: number
  setRelayCount: (n: number) => void

  // Language
  lang: Lang
  setLang: (lang: Lang) => void

  // Ephemeral messages
  removeExpiredMessages: () => void

  // Auto-translate
  autoTranslate: boolean
  setAutoTranslate: (v: boolean) => void
  setMessageTranslation: (chatId: string, ts: number, pubkey: string, translated: string, detectedLang: string) => void

  // UI
  openModal: string | null
  setOpenModal: (id: string | null) => void
  statusMessage: string | null
  statusTimeout: ReturnType<typeof setTimeout> | null
  showStatus: (msg: string, duration?: number) => void
  hideStatus: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Identity
  identity: storage.loadIdentity(),

  createIdentity: (name) => {
    const { privkey, pubkey } = createKeyPair()
    const identity: Identity = { privkey, pubkey, name }
    storage.saveIdentity(identity)
    set({ identity })
  },

  importIdentity: (nsec, name) => {
    const privkey = decodeNsec(nsec)
    const pubkey = pubkeyFromPrivkey(privkey)
    const identity: Identity = { privkey, pubkey, name }
    // Load existing data (may have been used before)
    const contacts = storage.loadContacts()
    const rooms = storage.loadRooms()
    const messages = storage.loadMessages()
    const unread = storage.loadUnread()
    storage.saveIdentity(identity)
    set({ identity, contacts, rooms, messages, unread })
  },

  updateName: (name) => {
    const { identity } = get()
    if (!identity) return
    const updated = { ...identity, name }
    storage.saveIdentity(updated)
    set({ identity: updated })
  },

  logout: () => {
    storage.clearAll()
    set({
      identity: null,
      contacts: {},
      rooms: {},
      messages: {},
      unread: {},
      activeChat: null,
    })
  },

  // Contacts
  contacts: storage.loadContacts(),

  addContact: (pubkey, name) => {
    const { contacts } = get()
    let hexPubkey = pubkey
    if (pubkey.startsWith('npub')) {
      hexPubkey = decodeNpub(pubkey)
    }
    const updated = { ...contacts, [hexPubkey]: { pubkey: hexPubkey, name } }
    storage.saveContacts(updated)
    set({ contacts: updated })
  },

  ensureContact: (pubkey, name) => {
    const { contacts } = get()
    if (contacts[pubkey]) return
    const updated = { ...contacts, [pubkey]: { pubkey, name } }
    storage.saveContacts(updated)
    set({ contacts: updated })
  },

  renameContact: (pubkey, name) => {
    const { contacts } = get()
    if (!contacts[pubkey]) return
    const updated = { ...contacts, [pubkey]: { ...contacts[pubkey], name } }
    storage.saveContacts(updated)
    set({ contacts: updated })
  },

  deleteContact: (pubkey) => {
    const { contacts, messages, unread, activeChat } = get()
    const updatedContacts = { ...contacts }
    delete updatedContacts[pubkey]
    storage.saveContacts(updatedContacts)

    const chatId = 'dm:' + pubkey
    const updatedMessages = { ...messages }
    delete updatedMessages[chatId]
    storage.saveMessages(updatedMessages)

    const updatedUnread = { ...unread }
    delete updatedUnread[chatId]
    storage.saveUnread(updatedUnread)

    set({
      contacts: updatedContacts,
      messages: updatedMessages,
      unread: updatedUnread,
      activeChat: activeChat?.chatId === chatId ? null : activeChat,
    })
  },

  // Rooms
  rooms: storage.loadRooms(),

  addRoom: (hash, name) => {
    const { rooms } = get()
    const updated = { ...rooms, [hash]: { name, hash } }
    storage.saveRooms(updated)
    set({ rooms: updated })
  },

  // Messages
  messages: storage.loadMessages(),

  addMessage: (chatId, msg) => {
    const { messages } = get()
    const existing = messages[chatId] || []
    // Deduplicate — prefer eventId (unique), fall back to ts+pubkey for local messages
    const dup = msg.eventId
      ? existing.find(m => m.eventId === msg.eventId)
      : existing.find(m => m.ts === msg.ts && m.pubkey === msg.pubkey)
    if (dup) return false

    let updated = [...existing, msg]
    if (updated.length > MAX_MESSAGES_PER_CHAT) {
      updated = updated.slice(-MAX_MESSAGES_PER_CHAT)
    }
    const newMessages = { ...messages, [chatId]: updated }
    storage.saveMessages(newMessages)
    set({ messages: newMessages })
    return true
  },

  // Active chat
  activeChat: null,

  setActiveChat: (chat) => {
    set({ activeChat: chat })
    if (chat) {
      get().clearUnread(chat.chatId)
    }
  },

  // Unread
  unread: storage.loadUnread(),

  clearUnread: (chatId) => {
    const { unread } = get()
    if (!unread[chatId]) return
    const updated = { ...unread, [chatId]: 0 }
    storage.saveUnread(updated)
    set({ unread: updated })
  },

  incrementUnread: (chatId) => {
    const { unread } = get()
    const updated = { ...unread, [chatId]: (unread[chatId] || 0) + 1 }
    storage.saveUnread(updated)
    set({ unread: updated })
  },

  // Relay status
  relayCount: 0,
  setRelayCount: (n) => set({ relayCount: n }),

  // Ephemeral messages — remove all expired messages across all chats
  removeExpiredMessages: () => {
    const { messages } = get()
    const now = Date.now()
    let changed = false
    const updated: Record<string, Message[]> = {}

    for (const [chatId, msgs] of Object.entries(messages)) {
      const filtered = msgs.filter(m => !m.expiresAt || m.expiresAt > now)
      if (filtered.length !== msgs.length) changed = true
      updated[chatId] = filtered
    }

    if (changed) {
      storage.saveMessages(updated)
      set({ messages: updated })
    }
  },

  // Language
  lang: (localStorage.getItem('alina-lang') as Lang) || 'en',
  setLang: (lang) => { localStorage.setItem('alina-lang', lang); set({ lang }) },

  // Auto-translate
  autoTranslate: localStorage.getItem('alina-autotranslate') === 'true',
  setAutoTranslate: (v) => { localStorage.setItem('alina-autotranslate', String(v)); set({ autoTranslate: v }) },
  setMessageTranslation: (chatId, ts, pubkey, translated, detectedLang) => {
    const { messages } = get()
    const msgs = messages[chatId]
    if (!msgs) return
    const idx = msgs.findIndex(m => m.ts === ts && m.pubkey === pubkey)
    if (idx === -1) return
    const updated = [...msgs]
    updated[idx] = { ...updated[idx], translated, detectedLang }
    const newMessages = { ...messages, [chatId]: updated }
    storage.saveMessages(newMessages)
    set({ messages: newMessages })
  },

  // UI
  openModal: null,
  setOpenModal: (id) => set({ openModal: id }),

  statusMessage: null,
  statusTimeout: null,

  showStatus: (msg, duration) => {
    const { statusTimeout } = get()
    if (statusTimeout) clearTimeout(statusTimeout)
    if (duration) {
      const timeout = setTimeout(() => {
        set({ statusMessage: null, statusTimeout: null })
      }, duration)
      set({ statusMessage: msg, statusTimeout: timeout })
    } else {
      set({ statusMessage: msg, statusTimeout: null })
    }
  },

  hideStatus: () => {
    const { statusTimeout } = get()
    if (statusTimeout) clearTimeout(statusTimeout)
    set({ statusMessage: null, statusTimeout: null })
  },

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
