'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import {
  defaultBadmintonCatalog,
  sanitizeBadmintonCatalog,
  type BadmintonCatalog,
  type BadmintonCatalogSectionKey,
  type BadmintonCourt,
  type GameRental,
} from '@/lib/badminton-catalog'

interface BadmintonContextType {
  catalog: BadmintonCatalog
  loaded: boolean
  setSection: (key: BadmintonCatalogSectionKey, items: BadmintonCourt[] | GameRental[]) => void
  resetCatalog: () => void
}

const BadmintonContext = createContext<BadmintonContextType | undefined>(undefined)

const SYNC_CHANNEL = 'rol-ems-badminton-catalog'

export const BadmintonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<BadmintonCatalog>(defaultBadmintonCatalog)
  const [loaded, setLoaded] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const savingRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/badminton/state', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`)
      const parsed = await res.json()
      setCatalog(sanitizeBadmintonCatalog(parsed))
    } catch (e) {
      console.error('Failed to load badminton catalog', e)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(SYNC_CHANNEL) : null
    channelRef.current = channel

    const onFocus = () => {
      if (!savingRef.current) load()
    }

    if (channel) {
      channel.onmessage = (event: MessageEvent) => {
        if (event.data === 'refresh' && !savingRef.current) load()
      }
    }

    window.addEventListener('focus', onFocus)
    void load()

    return () => {
      window.removeEventListener('focus', onFocus)
      channel?.close()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [load])

  useEffect(() => {
    if (!loaded) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      savingRef.current = true
      try {
        await fetch('/api/badminton/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catalog),
        })
        channelRef.current?.postMessage('refresh')
      } catch (e) {
        console.error('Failed to save badminton catalog', e)
      } finally {
        savingRef.current = false
      }
    }, 400)
  }, [loaded, catalog])

  const setSection = useCallback((key: BadmintonCatalogSectionKey, items: BadmintonCourt[] | GameRental[]) => {
    setCatalog((prev) => ({ ...prev, [key]: items }))
  }, [])

  const resetCatalog = useCallback(() => {
    setCatalog(defaultBadmintonCatalog)
  }, [])

  return (
    <BadmintonContext.Provider value={{ catalog, loaded, setSection, resetCatalog }}>
      {children}
    </BadmintonContext.Provider>
  )
}

export const useBadmintonCatalog = () => {
  const context = useContext(BadmintonContext)
  if (!context) {
    throw new Error('useBadmintonCatalog must be used within a BadmintonProvider')
  }
  return context
}