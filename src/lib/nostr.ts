import { RELAYS, RECONNECT_DELAY } from './constants'
import { createSignedEvent, isValidEvent, encryptDM, decryptDM } from './crypto'
import type { Message } from '../store/useStore'

export interface RelayConnection {
  url: string
  ws: WebSocket
}

let relays: RelayConnection[] = []
let onMessageCallback: ((chatId: string, msg: Message) => void) | null = null
let getStateCallback: (() => {
  privkey: Uint8Array | null
  pubkey: string | null
  contacts: Record<string, { pubkey: string; name: string }>
  rooms: Record<string, { name: string; hash: string }>
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

function subscribeAll(ws: WebSocket): void {
  const state = getStateCallback?.()
  if (!state?.pubkey) return

  // Subscribe to DMs directed to me
  const dmSub = JSON.stringify(['REQ', 'dm-sub', { kinds: [4], '#p': [state.pubkey], limit: 100 }])
  ws.send(dmSub)

  // Subscribe to room messages for all joined rooms
  const roomHashes = Object.values(state.rooms).map(r => r.hash)
  if (roomHashes.length) {
    const roomSub = JSON.stringify(['REQ', 'room-sub', { kinds: [42], '#e': roomHashes, limit: 200 }])
    ws.send(roomSub)
  }
}

function connectRelay(url: string): void {
  try {
    const ws = new WebSocket(url)
    ws.onopen = () => {
      relays.push({ url, ws })
      subscribeAll(ws)
    }
    ws.onmessage = (e) => handleRelayMessage(e.data)
    ws.onerror = () => {}
    ws.onclose = () => {
      relays = relays.filter(r => r.url !== url)
      setTimeout(() => connectRelay(url), RECONNECT_DELAY)
    }
  } catch { /* ignore */ }
}

export function connectAllRelays(): void {
  RELAYS.forEach(url => connectRelay(url))
}

export function disconnectAllRelays(): void {
  relays.forEach(r => {
    try { r.ws.close() } catch { /* ignore */ }
  })
  relays = []
}

export function publishToRelays(event: object): void {
  const msg = JSON.stringify(['EVENT', event])
  relays.forEach(r => {
    try { r.ws.send(msg) } catch { /* ignore */ }
  })
}

export function subscribeToRoom(roomHash: string): void {
  relays.forEach(r => {
    try {
      const sub = JSON.stringify(['REQ', 'room-' + roomHash.slice(0, 8), { kinds: [42], '#e': [roomHash], limit: 100 }])
      r.ws.send(sub)
    } catch { /* ignore */ }
  })
}

export function resubscribeAll(): void {
  relays.forEach(r => subscribeAll(r.ws))
}

async function handleRelayMessage(raw: string): Promise<void> {
  try {
    const data = JSON.parse(raw)
    if (data[0] !== 'EVENT') return
    const event = data[2]
    if (!isValidEvent(event)) return

    if (event.kind === 4) {
      await handleDM(event)
    } else if (event.kind === 42) {
      handleRoomMsg(event)
    }
  } catch { /* ignore */ }
}

async function handleDM(event: { pubkey: string; content: string; created_at: number }): Promise<void> {
  const state = getStateCallback?.()
  if (!state?.privkey || !state.pubkey) return

  const fromPubkey = event.pubkey
  if (fromPubkey === state.pubkey) return // own messages already stored

  const chatId = 'dm:' + fromPubkey

  try {
    const decrypted = await decryptDM(state.privkey, fromPubkey, event.content)
    const parsed = JSON.parse(decrypted)
    const msg: Message = {
      type: parsed.type || 'text',
      content: parsed.content,
      pubkey: fromPubkey,
      ts: event.created_at * 1000,
    }
    onMessageCallback?.(chatId, msg)
  } catch { /* ignore */ }
}

function handleRoomMsg(event: { pubkey: string; content: string; created_at: number; tags: string[][] }): void {
  const state = getStateCallback?.()
  if (!state) return

  const roomHashTag = event.tags.find((t: string[]) => t[0] === 'e')
  if (!roomHashTag) return
  const roomHash = roomHashTag[1]
  const chatId = 'room:' + roomHash
  if (!state.rooms[roomHash]) return

  const fromPubkey = event.pubkey
  if (fromPubkey === state.pubkey) return

  try {
    const parsed = JSON.parse(event.content)
    const displayName = state.contacts[fromPubkey]?.name
      || parsed.name
      || fromPubkey.slice(0, 8) + '...'
    const msg: Message = {
      type: parsed.type || 'text',
      content: parsed.content,
      pubkey: fromPubkey,
      name: displayName,
      ts: event.created_at * 1000,
    }
    onMessageCallback?.(chatId, msg)
  } catch { /* ignore */ }
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

export async function publishRoomMessage(
  privkey: Uint8Array,
  myPubkey: string,
  roomHash: string,
  msgData: { type: string; content: string; name: string },
): Promise<void> {
  const payload = JSON.stringify(msgData)
  const event = createSignedEvent({
    kind: 42,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['e', roomHash, '', 'root']],
    content: payload,
    pubkey: myPubkey,
  }, privkey)
  publishToRelays(event)
}
