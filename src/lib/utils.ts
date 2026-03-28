export function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })
  return (
    d.toLocaleDateString('de', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })
  )
}

export function lastMsgPreview(messages: { type: string; content: string }[]): string {
  if (!messages.length) return 'No messages yet'
  const last = messages[messages.length - 1]
  if (last.type === 'image') return '🖼 Image'
  if (last.type === 'location') return '📍 Location'
  return last.content ? last.content.slice(0, 40) : ''
}
