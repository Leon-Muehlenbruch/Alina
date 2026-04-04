export const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://nostr.mom',
  'wss://nostr.wine',
  'wss://purplepag.es',
  'wss://relay.primal.net',
  'wss://relay.nostr.bg',
] as const

export const EMOJIS = [
  '😊','😂','❤️','👍','🙏','😍','🎉','😢','😎','🔥',
  '💪','✨','🤔','👋','😅','🌹','💙','🫂','😄','🥰',
  '😭','🤣','💯','👏','🎶','🌍','✌️','😇','🤩','💌',
] as const

export const MAX_IMAGE_SIZE = 500 * 1024 // 500 KB
export const MAX_MESSAGES_PER_CHAT = 200
export const INVITE_CODE_DURATION = 600 // seconds
export const INVITE_KIND = 10420 // custom Nostr kind for invite codes
// RECONNECT_DELAY removed — now using exponential backoff in nostr.ts
