import { RELAYS, INVITE_KIND, INVITE_CODE_DURATION, GIFT_WRAP_KIND, CHAT_MESSAGE_KIND, ROOM_PRESENCE_KIND } from './constants'
import { createSignedEvent, isValidEvent, encryptDM, decryptDM, hashInviteCode, createSeal, createGiftWrap, unwrapGiftWrap, unsealRumor } from './crypto'
import { saveLog } from './storage'
import type { Message } from '../store/useStore'

const BASE_RECONNECT_DELAY = 5000
const MAX_RECONNECT_DELAY = 120000
const relayfailures: Record<string, number> = {}

export interface RelayConnection {
  url: string
  ws: WebSocket
}

let relays: RelayConnection[] = []
let onMessageCallback: ((chatId: string, msg: Message) => void) | null = null

type InviteResult = { pubkey: string; name: string }
const pendingInviteLookups = new Map<string, (result: InviteResult | null) => void>()

let getStateCallback: (() => {
  privkey: Uint8Array | null
  pubkey: string | null
  contacts: Record<string, { pubkey: string; name: string }>
  rooms: Record<string, { name: string; hash: string; members: string[] }>
  addRoomMember: (hash: string, pubkey: string) => void
}) | null = null

export function setOnMessage(cb: typeof onMessageCallback): void {
  onMessageCallback = cb
}

export function setGetState(cb: typeof getStateCallback): void {
  getStateCallback = cb
}

export function getRelays(): RelayConnection[] {
  return relays
}

export function getRelayCount(): number {
  return relays.length
}

type RelayCountListener = (count: number) => void
let relayCountListener: RelayCountListener | null = null

export function setRelayCountListener(cb: RelayCountListener | null): void {
  relayCountListener = cb
}

function notifyRelayCount(): void {
  relayCountListener?.(relays.length)
}

function subscribeAll(ws: WebSocket): void {
  const state = getStateCallback?.()
  if (!state?.pubkey) return

  // Subscribe to DMs directed to me (NIP-04)
  const dmSub = JSON.stringify(['REQ', 'dm-sub', { kinds: [4], '#p': [state.pubkey], limit: 100 }])
  ws.send(dmSub)

  // Subscribe to Gift Wraps directed to me (NIP-17 encrypted room messages)
  const gwSub = JSON.stringify(['REQ', 'gw-sub', { kinds: [GIFT_WRAP_KIND], '#p': [state.pubkey], limit: 200 }])
  ws.send(gwSub)

  // Subscribe to room presence/join events (Kind 42 - non-sensitive, just pubkey announcements)
  const roomHashes = Object.values(state.rooms).map(r => r.hash)
  if (roomHashes.length) {
    const roomSub = JSON.stringify(['REQ', 'room-sub', { kinds: [ROOM_PRESENCE_KIND], '#e': roomHashes, limit: 200 }])
    ws.send(roomSub)
  }
}

function connectRelay(url: string): void {
  try {
    const ws = new WebSocket(url)
    ws.onopen = () => {
      relayfailures[url] = 0
      relays.push({ url, ws })
      notifyRelayCount()
      subscribeAll(ws)
      saveLog('relay', 'Connected to ' + url)
    }
    ws.onmessage = (e) => handleRelayMessage(e.data)
    ws.onerror = (e) => {
      saveLog('relay-error', 'WebSocket error on ' + url + ': ' + String(e))
    }
    ws.onclose = (e) => {
      relays = relays.filter(r => r.url !== url)
      notifyRelayCount()
      const failures = (relayfailures[url] || 0) + 1
      relayfailures[url] = failures
      const delay = Math.min(BASE_RECONNECT_DELAY * Math.pow(2, failures - 1), MAX_RECONNECT_DELAY)
      saveLog('relay', 'Disconnected from ' + url + ' (code ' + e.code + '), reconnect in ' + Math.round(delay / 1000) + 's')
      setTimeout(() => connectRelay(url), delay)
    }
  } catch (e) {
    saveLog('relay-error', 'Failed to connect to ' + url + ': ' + String(e))
  }
}

export function connectAllRelays(): void {
  RELAYS.forEach(url => connectRelay(url))
}

export function disconnectAllRelays(): void {
  relays.forEach(r => {
    try { r.ws.close() } catch (e) {
      saveLog('relay-error', 'Error closing ' + r.url + ': ' + String(e))
    }
  })
  relays = []
  notifyRelayCount()
}

export function publishToRelays(event: object): void {
  const msg = JSON.stringify(['EVENT', event])
  relays.forEach(r => {
    try { r.ws.send(msg) } catch (e) {
      saveLog('relay-error', 'Failed to publish to ' + r.url + ': ' + String(e))
    }
  })
}

export function subscribeToRoom(roomHash: string): void {
  relays.forEach(r => {
    try {
      // Subscribe to presence events for this room
      const sub = JSON.stringify(['REQ', 'room-' + roomHash.slice(0, 8), { kinds: [ROOM_PRESENCE_KIND], '#e': [roomHash], limit: 100 }])
      r.ws.send(sub)
    } catch (e) {
      saveLog('relay-error', 'Failed to subscribe to room on ' + r.url + ': ' + String(e))
    }
  })
}

export function resubscribeAll(): void {
  relays.forEach(r => subscribeAll(r.ws))
}

async function handleRelayMessage(raw: string): Promise<void> {
  try {
    const data = JSON.parse(raw)

    if (data[0] === 'EVENT') {
      const subId = data[1] as string
      const event = data[2]

      // Handle invite lookup responses
      const inviteHandler = pendingInviteLookups.get(subId)
      if (inviteHandler && event.kind === INVITE_KIND) {
        pendingInviteLookups.delete(subId)
        relays.forEach(r => {
          try { r.ws.send(JSON.stringify(['CLOSE', subId])) } catch (e) {
            saveLog('relay-error', 'Failed to close invite sub on ' + r.url + ': ' + String(e))
          }
        })
        try {
          const parsed = JSON.parse(event.content)
          inviteHandler({ pubkey: event.pubkey, name: parsed.name || '' })
        } catch {
          inviteHandler(null)
        }
        return
      }

      if (event.kind === GIFT_WRAP_KIND) {
        // Gift wraps use ephemeral keys — don't verify event signature the normal way
        await handleGiftWrap(event)
        return
      }

      if (!isValidEvent(event)) return

      if (event.kind === 4) {
        await handleDM(event)
      } else if (event.kind === ROOM_PRESENCE_KIND) {
        handleRoomPresence(event)
      }
    }
  } catch (e) {
    saveLog('relay-error', 'Failed to handle relay message: ' + String(e))
  }
}

async function handleDM(event: { id?: string; pubkey: string; content: string; created_at: number }): Promise<void> {
  const state = getStateCallback?.()
  if (!state?.privkey || !state.pubkey) return

  const fromPubkey = event.pubkey
  if (fromPubkey === state.pubkey) return // own messages already stored

  const chatId = 'dm:' + fromPubkey

  try {
    const decrypted = await decryptDM(state.privkey, fromPubkey, event.content)
    const parsed = JSON.parse(decrypted)
    const now = Date.now()
    const ttl = parsed.ttl ? Number(parsed.ttl) : undefined
    const expiresAt = ttl ? now + ttl * 1000 : undefined
    // If already expired (clock drift), skip
    if (expiresAt && expiresAt <= now) return
    const msg: Message = {
      type: parsed.type || 'text',
      content: parsed.content,
      pubkey: fromPubkey,
      ts: event.created_at * 1000,
      eventId: event.id,
      ...(ttl ? { ttl, expiresAt } : {}),
    }
    onMessageCallback?.(chatId, msg)
  } catch (e) {
    saveLog('decrypt-error', 'Failed to decrypt DM from ' + fromPubkey.slice(0, 8) + '...: ' + String(e))
  }
}

/** Handle Kind 42 presence/join events — learn room members (no sensitive data) */
function handleRoomPresence(event: { id?: string; pubkey: string; content: string; created_at: number; tags: string[][] }): void {
  const state = getStateCallback?.()
  if (!state) return

  const roomHashTag = event.tags.find((t: string[]) => t[0] === 'e')
  if (!roomHashTag) return
  const roomHash = roomHashTag[1]
  if (!state.rooms[roomHash]) return

  const fromPubkey = event.pubkey
  if (fromPubkey === state.pubkey) return

  // Add this pubkey as a known room member
  state.addRoomMember(roomHash, fromPubkey)
  saveLog('room', 'Discovered member ' + fromPubkey.slice(0, 8) + '... in room ' + state.rooms[roomHash].name)
}

/** Handle Kind 1059 Gift Wrap — unwrap, unseal, extract room message */
async function handleGiftWrap(event: { id?: string; pubkey: string; content: string; created_at: number; tags: string[][] }): Promise<void> {
  const state = getStateCallback?.()
  if (!state?.privkey || !state.pubkey) return

  try {
    // Step 1: Unwrap Gift Wrap → get Seal (Kind 13)
    const seal = unwrapGiftWrap(state.privkey, event)
    if (!seal) return

    const senderPubkey = seal.pubkey
    if (senderPubkey === state.pubkey) return // own messages already stored locally

    // Step 2: Unseal → get Rumor (Kind 14)
    const rumor = unsealRumor(state.privkey, seal)
    if (!rumor || rumor.kind !== CHAT_MESSAGE_KIND) return

    // Step 3: Extract room hash from rumor tags
    const roomHashTag = rumor.tags.find((t: string[]) => t[0] === 'e')
    if (!roomHashTag) return
    const roomHash = roomHashTag[1]
    if (!state.rooms[roomHash]) return

    // Learn this member
    state.addRoomMember(roomHash, senderPubkey)

    // Step 4: Parse message content
    const parsed = JSON.parse(rumor.content)
    const now = Date.now()
    const ttl = parsed.ttl ? Number(parsed.ttl) : undefined
    const expiresAt = ttl ? now + ttl * 1000 : undefined
    if (expiresAt && expiresAt <= now) return

    const displayName = state.contacts[senderPubkey]?.name
      || parsed.name
      || senderPubkey.slice(0, 8) + '...'

    const chatId = 'room:' + roomHash
    const msg: Message = {
      type: parsed.type || 'text',
      content: parsed.content,
      pubkey: senderPubkey,
      name: displayName,
      ts: rumor.created_at * 1000,
      eventId: event.id,
      ...(ttl ? { ttl, expiresAt } : {}),
    }
    onMessageCallback?.(chatId, msg)
  } catch (e) {
    saveLog('giftwrap-error', 'Failed to unwrap gift wrap: ' + String(e))
  }
}

export async function publishDM(
  privkey: Uint8Array,
  myPubkey: string,
  recipientPubkey: string,
  msgData: { type: string; content: string },
): Promise<void> {
  const payload = JSON.stringify(msgData)
  const encrypted = await encryptDM(privkey, recipientPubkey, payload)
  const event = createSignedEvent({
    kind: 4,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['p', recipientPubkey]],
    content: encrypted,
    pubkey: myPubkey,
  }, privkey)
  publishToRelays(event)
}

export async function publishInviteCode(
  privkey: Uint8Array,
  pubkey: string,
  name: string,
  code: string,
): Promise<void> {
  const codeHash = await hashInviteCode(code)
  const expiration = Math.floor(Date.now() / 1000) + INVITE_CODE_DURATION
  const event = createSignedEvent({
    kind: INVITE_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ['t', codeHash],
      ['expiration', expiration.toString()],
    ],
    content: JSON.stringify({ name }),
    pubkey,
  }, privkey)
  publishToRelays(event)
}

export async function lookupInviteCode(code: string): Promise<InviteResult | null> {
  const codeHash = await hashInviteCode(code)

  return new Promise((resolve) => {
    const subId = 'invite-' + Math.random().toString(36).slice(2, 10)
    let resolved = false

    const done = (result: InviteResult | null) => {
      if (resolved) return
      resolved = true
      pendingInviteLookups.delete(subId)
      resolve(result)
    }

    pendingInviteLookups.set(subId, done)
    setTimeout(() => done(null), 8000)

    const sub = JSON.stringify(['REQ', subId, {
      kinds: [INVITE_KIND],
      '#t': [codeHash],
      since: Math.floor(Date.now() / 1000) - INVITE_CODE_DURATION,
      limit: 5,
    }])

    if (relays.length === 0) {
      setTimeout(() => done(null), 100)
      return
    }

    relays.forEach(r => {
      try { r.ws.send(sub) } catch (e) {
        saveLog('relay-error', 'Failed to send invite lookup to ' + r.url + ': ' + String(e))
      }
    })
  })
}

export async function publishRoomMessage(
  privkey: Uint8Array,
  myPubkey: string,
  roomHash: string,
  msgData: { type: string; content: string; name: string },
): Promise<void> {
  const state = getStateCallback?.()
  const room = state?.rooms[roomHash]
  const members = room?.members ?? []

  // Build a Kind 14 rumor (unsigned chat message)
  const rumor = {
    kind: CHAT_MESSAGE_KIND,
    pubkey: myPubkey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['e', roomHash, '', 'root']],
    content: JSON.stringify(msgData),
  }

  // For each known room member (excluding self), create Seal → Gift Wrap
  for (const memberPubkey of members) {
    if (memberPubkey === myPubkey) continue
    try {
      const seal = createSeal(privkey, myPubkey, memberPubkey, rumor)
      const giftWrap = createGiftWrap(memberPubkey, seal)
      publishToRelays(giftWrap)
    } catch (e) {
      saveLog('giftwrap-error', 'Failed to wrap for ' + memberPubkey.slice(0, 8) + '...: ' + String(e))
    }
  }

  // Also publish a presence event so new members can discover us
  publishRoomPresence(privkey, myPubkey, roomHash, msgData.name)
}

/** Publish a Kind 42 presence event (non-sensitive join/activity announcement) */
export function publishRoomPresence(
  privkey: Uint8Array,
  myPubkey: string,
  roomHash: string,
  name: string,
): void {
  const event = createSignedEvent({
    kind: ROOM_PRESENCE_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['e', roomHash, '', 'root']],
    content: JSON.stringify({ name }),
    pubkey: myPubkey,
  }, privkey)
  publishToRelays(event)
}
