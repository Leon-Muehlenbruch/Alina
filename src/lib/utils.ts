export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })

  if (sameDay) return time

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return `Gestern ${time}`

  const sameYear = d.getFullYear() === now.getFullYear()
  const date = sameYear
    ? d.toLocaleDateString('de', { day: '2-digit', month: 'short' })
    : d.toLocaleDateString('de', { day: '2-digit', month: 'short', year: 'numeric' })

  return `${date}, ${time}`
}

export function lastMsgPreview(messages: { type: string; content: string }[]): string {
  if (!messages.length) return 'Noch keine Nachrichten'
  const last = messages[messages.length - 1]
  if (last.type === 'image') return 'Bild'
  if (last.type === 'location') return 'Standort'
  return last.content ? last.content.slice(0, 40) : ''
}
