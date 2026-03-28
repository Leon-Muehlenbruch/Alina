import { W3W_KEY } from './constants'

export async function getW3WWords(lat: number, lng: number): Promise<string> {
  const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=de&key=${W3W_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('w3w error')
  const data = await res.json()
  return data.words
}
