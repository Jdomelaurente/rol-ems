'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { defaultSiteContent, sanitizeSiteContent, type SiteContent } from '@/lib/site-content'

interface SiteContentContextType {
  content: SiteContent
  loaded: boolean
  update: <K extends keyof SiteContent>(section: K, value: SiteContent[K]) => void
  resetContent: () => void
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined)

const SYNC_CHANNEL = 'rol-ems-site-content'

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent)
  const [loaded, setLoaded] = useState(false)
  const channelRef = useRef<BroadcastChannel | null>(null)
  const savingRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/site/state', { cache: 'no-store' })
      if (!res.ok) throw new Error(`Failed to fetch site content: ${res.status}`)
      const parsed = await res.json()
      setContent(sanitizeSiteContent(parsed))
    } catch (e) {
      console.error('Failed to load site content', e)
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
        await fetch('/api/site/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        })
        channelRef.current?.postMessage('refresh')
      } catch (e) {
        console.error('Failed to save site content', e)
      } finally {
        savingRef.current = false
      }
    }, 400)
  }, [loaded, content])

  const update = useCallback(<K extends keyof SiteContent>(section: K, value: SiteContent[K]) => {
    setContent((prev) => ({ ...prev, [section]: value }))
  }, [])

  const resetContent = useCallback(() => {
    setContent(defaultSiteContent)
  }, [])

  return (
    <SiteContentContext.Provider value={{ content, loaded, update, resetContent }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export const useSiteContent = () => {
  const context = useContext(SiteContentContext)
  if (!context) {
    throw new Error('useSiteContent must be used within a SiteContentProvider')
  }
  return context
}
