import { saveLog } from './storage'

export interface QueuedMessage {
  id: string
  chatType: 'dm' | 'room'
  chatId: string
  recipientOrRoomHash: string
  msgData: { type: string; content: string; name?: string }
  timestamp: number
}

const QUEUE_KEY = 'alina_offline_queue'

function loadQueue(): QueuedMessage[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveQueue(queue: QueuedMessage[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch (e) {
    saveLog('storage-error', `Failed to save offline queue: ${String(e)}`)
  }
}
export function enqueue(msg: QueuedMessage): void {
  const queue = loadQueue()
  queue.push(msg)
  saveQueue(queue)
  saveLog('offline-queue', `Queued message for ${msg.chatId}`)
}

export function dequeue(id: string): void {
  const queue = loadQueue().filter(m => m.id !== id)
  saveQueue(queue)
}

export function getQueuedMessages(): QueuedMessage[] {
  return loadQueue()
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY)
}

export function isOnline(): boolean {
  return navigator.onLine
}

let flushCallback: ((msg: QueuedMessage) => Promise<void>) | null = null

export function setFlushCallback(cb: typeof flushCallback): void {
  flushCallback = cb
}
export async function flushQueue(): Promise<void> {
  if (!flushCallback) return
  const queue = getQueuedMessages()
  if (queue.length === 0) return

  saveLog('offline-queue', `Flushing ${queue.length} queued message(s)`)
  for (const msg of queue) {
    try {
      await flushCallback(msg)
      dequeue(msg.id)
    } catch (e) {
      saveLog('offline-queue', `Failed to flush message ${msg.id}: ${String(e)}`)
      break // Stop on first failure, will retry later
    }
  }
}

// Listen for online events and flush
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    saveLog('network', 'Back online — flushing offline queue')
    flushQueue()
  })
}
