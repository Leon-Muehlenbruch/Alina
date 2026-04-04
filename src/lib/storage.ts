import type { Contact, Room, Message, Identity } from '../store/useStore'

const KEYS = {
  identity: 'alina_identity',
  contacts: 'alina_contacts',
  rooms: 'alina_rooms',
  messages: 'alina_messages',
  unread: 'alina_unread',
  logs: 'alina_logs',
} as const

/** Safe localStorage.setItem with quota error handling */
function safeSave(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    // QuotaExceededError — log and warn user
    console.error(`localStorage quota exceeded for key "${key}":`, e)
    saveLog('storage-error', `Quota exceeded saving "${key}" (${Math.round(value.length / 1024)} KB)`)
    return false
  }
}

export function loadIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(KEYS.identity)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      privkey: new Uint8Array(data.privkey),
      pubkey: data.pubkey,
      name: data.name || 'Ich',
    }
  } catch (e) {
    console.error('Failed to load identity:', e)
    return null
  }
}
export function saveIdentity(identity: Identity): void {
  safeSave(KEYS.identity, JSON.stringify({
    privkey: Array.from(identity.privkey),
    pubkey: identity.pubkey,
    name: identity.name,
  }))
}

export function loadContacts(): Record<string, Contact> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.contacts) || '{}')
  } catch (e) {
    console.error('Failed to load contacts:', e)
    return {}
  }
}

export function saveContacts(contacts: Record<string, Contact>): void {
  safeSave(KEYS.contacts, JSON.stringify(contacts))
}

export function loadRooms(): Record<string, Room> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.rooms) || '{}')
  } catch (e) {
    console.error('Failed to load rooms:', e)
    return {}
  }
}
export function saveRooms(rooms: Record<string, Room>): void {
  safeSave(KEYS.rooms, JSON.stringify(rooms))
}

export function loadMessages(): Record<string, Message[]> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.messages) || '{}')
  } catch (e) {
    console.error('Failed to load messages:', e)
    return {}
  }
}

export function saveMessages(messages: Record<string, Message[]>): void {
  safeSave(KEYS.messages, JSON.stringify(messages))
}

export function loadUnread(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEYS.unread) || '{}')
  } catch (e) {
    console.error('Failed to load unread counts:', e)
    return {}
  }
}

export function saveUnread(unread: Record<string, number>): void {
  safeSave(KEYS.unread, JSON.stringify(unread))
}
export interface LogEntry {
  ts: string
  type: string
  message: string
}

const MAX_LOGS = 100

export function loadLogs(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.logs) || '[]')
  } catch {
    return []
  }
}

export function saveLog(type: string, message: string): void {
  try {
    const logs = loadLogs()
    logs.push({ ts: new Date().toISOString(), type, message: message.slice(0, 500) })
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS)
    localStorage.setItem(KEYS.logs, JSON.stringify(logs))
  } catch { /* ignore */ }
}

export function clearLogs(): void {
  localStorage.removeItem(KEYS.logs)
}

export function clearAll(): void {
  localStorage.clear()
}
