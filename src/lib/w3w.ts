import { W3W_KEY } from './constants'
import { saveLog } from './storage'

export async function getW3WWords(lat: number, lng: number): Promise<string> {
  if (!W3W_KEY || W3W_KEY === 'DEMO') {
    saveLog('w3w', 'what3words API key not configured — using coordinate fallback')
    // Fallback: return a readable coordinate string instead of failing
    return `${lat.toFixed(5)},${lng.toFixed(5)}`
  }
  const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=de&key=${W3W_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    saveLog('w3w-error', `what3words API returned ${res.status}`)
    throw new Error('w3w error')
  }
  const data = await res.json()
  return data.words
}
