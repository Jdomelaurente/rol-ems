'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import {
  defaultCatalog,
  sanitizeCatalog,
  type CottageCatalog,
  type CatalogSectionKey,
  type CatalogOption,
  type CatalogAddOn,
} from '@/lib/cottage-catalog'

interface CottageContextType {
  catalog: CottageCatalog
  loaded: boolean
  setSection: (key: CatalogSectionKey, items: CatalogOption[] | CatalogAddOn[]) => void
  resetCatalog: () => void
}

const CottageContext = createContext<CottageContextType | undefined>(undefined)

const SYNC_CHANNEL = 'rol-ems-cottage-catalog'

export const CottageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<CottageCatalog>(defaultCatalog)
  const [loaded, setLoaded] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const savingRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/cottage/state', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`)
      const parsed = await res.json()
      setCatalog(sanitizeCatalog(parsed))
    } catch (e) {
      console.error('Failed to load cottage catalog', e)
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
        await fetch('/api/cottage/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catalog),
        })
        channelRef.current?.postMessage('refresh')
      } catch (e) {
        console.error('Failed to save cottage catalog', e)
      } finally {
        savingRef.current = false
      }
    }, 400)
  }, [loaded, catalog])

  const setSection = useCallback((key: CatalogSectionKey, items: CatalogOption[] | CatalogAddOn[]) => {
    setCatalog((prev) => ({ ...prev, [key]: items }))
  }, [])

  const resetCatalog = useCallback(() => {
    setCatalog(defaultCatalog)
  }, [])

  return (
    <CottageContext.Provider value={{ catalog, loaded, setSection, resetCatalog }}>
      {children}
    </CottageContext.Provider>
  )
}

export const useCottageCatalog = () => {
  const context = useContext(CottageContext)
  if (!context) {
    throw new Error('useCottageCatalog must be used within a CottageProvider')
  }
  return context
}