import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

interface AudioContextType {
  isMusicOn: boolean
  toggleMusic: () => void
  unlockAndStartMusic: () => void
}

const MusicContext = createContext<AudioContextType | null>(null)

const STORAGE_KEY = 'ddz_music_on'

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicOn, setIsMusicOn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === null ? true : saved === '1'
  })
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)

  const stopLoop = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const playTone = (ctx: AudioContext, freq: number, duration = 0.25) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.value = 0.0001
    osc.connect(gain)
    gain.connect(ctx.destination)
    const now = ctx.currentTime
    gain.gain.exponentialRampToValueAtTime(0.02, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.start(now)
    osc.stop(now + duration)
  }

  const startLoop = () => {
    if (!ctxRef.current) {
      ctxRef.current = new window.AudioContext()
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    stopLoop()
    const notes = [220, 261.63, 293.66, 329.63, 293.66, 261.63]
    let i = 0
    playTone(ctx, notes[0], 0.28)
    timerRef.current = window.setInterval(() => {
      playTone(ctx, notes[i % notes.length], 0.28)
      i += 1
    }, 380)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isMusicOn ? '1' : '0')
    if (isMusicOn) {
      startLoop()
    } else {
      stopLoop()
    }
    return () => stopLoop()
  }, [isMusicOn])

  const value = useMemo<AudioContextType>(() => ({
    isMusicOn,
    toggleMusic: () => setIsMusicOn(v => !v),
    unlockAndStartMusic: () => {
      if (!isMusicOn) return
      startLoop()
    }
  }), [isMusicOn])

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useAudio() {
  const ctx = useContext(MusicContext)
  if (!ctx) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return ctx
}
