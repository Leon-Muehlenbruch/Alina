import { useState, useEffect, useCallback, useRef } from 'react'
import { INVITE_CODE_DURATION } from '../lib/constants'

export function useInviteCode(pubkey: string, name: string) {
  const [code, setCode] = useState('—')
  const [remaining, setRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generate = useCallback(() => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    setCode(newCode)
    setRemaining(INVITE_CODE_DURATION)

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setCode('—')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')
  const timerText = remaining > 0
    ? `Gültig noch ${m}:${s}`
    : code === '—'
      ? 'Abgelaufen'
      : 'Gültig 10 Minuten'

  return { code, timerText, generate }
}
