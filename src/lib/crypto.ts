import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  verifyEvent,
  nip04,
  nip19,
} from 'nostr-tools'
import type { UnsignedEvent, VerifiedEvent } from 'nostr-tools'

export { nip19 }

export function createKeyPair(): { privkey: Uint8Array; pubkey: string } {
  const privkey = generateSecretKey()
  const pubkey = getPublicKey(privkey)
  return { privkey, pubkey }
}

export function pubkeyFromPrivkey(privkey: Uint8Array): string {
  return getPublicKey(privkey)
}

export function decodeNsec(nsec: string): Uint8Array {
  const decoded = nip19.decode(nsec)
  if (decoded.type !== 'nsec') throw new Error('Not an nsec key')
  return decoded.data as Uint8Array
}

export function encodeNpub(pubkey: string): string {
  return nip19.npubEncode(pubkey)
}

export function decodeNpub(npub: string): string {
  const decoded = nip19.decode(npub)
  if (decoded.type !== 'npub') throw new Error('Not an npub key')
  return decoded.data as string
}

export function encodeNsec(privkey: Uint8Array): string {
  return nip19.nsecEncode(privkey)
}

export async function encryptDM(
  privkey: Uint8Array,
  recipientPubkey: string,
  plaintext: string,
): Promise<string> {
  return nip04.encrypt(privkey, recipientPubkey, plaintext)
}

export async function decryptDM(
  privkey: Uint8Array,
  senderPubkey: string,
  ciphertext: string,
): Promise<string> {
  return nip04.decrypt(privkey, senderPubkey, ciphertext)
}

export function createSignedEvent(
  event: UnsignedEvent,
  privkey: Uint8Array,
): VerifiedEvent {
  return finalizeEvent(event, privkey) as VerifiedEvent
}

export function isValidEvent(event: unknown): boolean {
  return verifyEvent(event as VerifiedEvent)
}

export async function hashRoomName(name: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode('alina-room-v1:' + name.toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hashInviteCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode('alina-invite-v1:' + code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
