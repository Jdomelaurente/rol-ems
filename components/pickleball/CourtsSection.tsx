'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { courts } from '@/lib/data'
import type { Court, OpenPlaySession } from '@/lib/data'
import { usePickleball } from '@/context/PickleballContext'
import PickleballCourtIllustration from '@/components/pickleball/PickleballCourtIllustration'
import ManageBookingModal from '@/components/pickleball/ManageBookingModal'
import {
  toIso,
  parseTimeToMinutes,
  calculateEndTime,
  getReservationCountdown
} from '@/lib/booking-overlap'
import {
  Sparkles,
  Calendar,
  Clock,
  Wrench,
  Users,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

export const courtStatusConfig: Record<string, { label: string; badge: string; border: string }> = {
  available: {
    label: 'AVAILABLE',
    badge: 'bg-emerald-700 text-white shadow-xs',
    border: 'border-emerald-600/50 ring-2 ring-emerald-500/15',
  },
  reserved: {
    label: 'RESERVED',
    badge: 'bg-amber-600 text-white shadow-xs',
    border: 'border-amber-500/40 ring-1 ring-amber-500/15',
  },
  occupied: {
    label: 'OCCUPIED',
    badge: 'bg-rose-700 text-white shadow-xs',
    border: 'border-rose-600/40 ring-1 ring-rose-500/15',
  },
  maintenance: {
    label: 'MAINTENANCE',
    badge: 'bg-orange-600 text-white shadow-xs',
    border: 'border-orange-500/40 ring-1 ring-orange-500/15',
  },
  'open-play': {
    label: 'OPEN PLAY',
    badge: 'bg-blue-700 text-white shadow-xs',
    border: 'border-blue-600/40 ring-1 ring-blue-500/15',
  },
}

export interface CourtsSectionProps {
  onSelectCourt?: (court: Court) => void
  showBookRedirect?: boolean
  title?: string
  subtitle?: string
  onJoinOpenPlaySession?: (session: OpenPlaySession) => void
  activeCourtId?: string
}

export default function CourtsSection({
  onSelectCourt,
  showBookRedirect = false,
  title = 'Pickleball Courts',
  subtitle = 'Championship outdoor courts equipped with regulation markings, kitchen lines, and premium LED lighting.',
  onJoinOpenPlaySession,
  activeCourtId,
}: CourtsSectionProps) {
  const router = useRouter()
  const {
    reservations = [],
    openPlaySessions = [],
    courtOverrides = {},
    updateCourtOverrideStatus,
  } = usePickleball()

  const [viewScheduleId, setViewScheduleId] = useState<string | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [manageReference, setManageReference] = useState('')

  // Role-based staff / admin access detection
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')

  useEffect(() => {
    let mounted = true
    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data?.username) {
          setIsAdmin(true)
          setAdminUsername(data.username)
        }
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayIso = toIso(today)

  const handleBookCourt = (court: Court) => {
    if (onSelectCourt) {
      onSelectCourt(court)
    } else if (showBookRedirect) {
      router.push(`/pickleball/booking?court=${court.id}`)
    }
  }

  const handleOpenManageModal = (initialRef: string = '') => {
    setManageReference(initialRef)
    setIsManageModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222]/10 pb-4">
        <div>
          <h2 className="font-serif text-3xl tracking-[-0.04em] text-[#1E5336]">{title}</h2>
          <p className="text-xs text-[#6B756B] mt-1 max-w-xl">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B756B] bg-white px-3 py-1.5 rounded-none border border-[#222222]/10 shadow-xs">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Status ({todayIso})
          </div>

          {isAdmin && (
            <Link
              href="/admin/courts"
              className="flex items-center gap-1.5 rounded-none bg-[#1E5336] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#FDFBF7] hover:bg-[#153d27] transition shadow-xs"
            >
              <ShieldCheck size={13} className="text-[#E1A728]" />
              Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Staff banner if admin is authenticated */}
      {isAdmin && (
        <div className="rounded-none border border-[#1E5336]/30 bg-[#1E5336]/10 px-4 py-2.5 flex items-center justify-between text-xs text-[#1E5336]">
          <span className="flex items-center gap-2 font-bold">
            <ShieldCheck size={16} className="text-[#1E5336]" />
            Staff / Admin Mode Active (Logged in as {adminUsername}). You can apply real-time status overrides below.
          </span>
          <Link
            href="/admin/courts"
            className="underline hover:text-[#153d27] uppercase text-[10px] tracking-[0.14em]"
          >
            Open Full Admin Panel →
          </Link>
        </div>
      )}

      {/* 3 Courts Grid: Court 1, Court 2, Court 3 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courts.map((court) => {
          const courtNameClean = court.name.toLowerCase().trim()

          // Filter active reservations for this court
          const courtRes = reservations
            .filter((r) => {
              const rCourt = r.court.toLowerCase().trim()
              const matches =
                rCourt === courtNameClean ||
                rCourt.includes(courtNameClean) ||
                courtNameClean.includes(rCourt)
              return matches && r.bookingStatus !== 'cancelled'
            })
            .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))

          // Open Play session for this court & date
          const activeOpenPlay = openPlaySessions.find((s) => {
            const sCourt = s.court.toLowerCase().trim()
            return (
              (sCourt === courtNameClean || sCourt.includes(courtNameClean)) &&
              s.date === todayIso &&
              s.status !== 'cancelled'
            )
          })

          // Determine active vs upcoming
          const activeRes = courtRes.find((r) => {
            const startM = parseTimeToMinutes(r.time)
            const endM = startM + (r.duration || 1) * 60
            const nowM = now.getHours() * 60 + now.getMinutes()
            return r.date === todayIso && nowM >= startM && nowM < endM
          })

          const upcomingRes = courtRes.find((r) => {
            const startM = parseTimeToMinutes(r.time)
            const nowM = now.getHours() * 60 + now.getMinutes()
            return r.date > todayIso || (r.date === todayIso && startM > nowM)
          })

          const displayRes = activeRes || upcomingRes || courtRes[0]

          // Determine Effective Status
          const overrideStatus = courtOverrides[court.id]
          let effectiveStatus: 'available' | 'occupied' | 'reserved' | 'open-play' | 'maintenance' =
            overrideStatus ||
            (activeRes
              ? 'occupied'
              : activeOpenPlay
              ? 'open-play'
              : courtRes.some((r) => r.date === todayIso)
              ? 'reserved'
              : court.status === 'open-play'
              ? 'open-play'
              : 'available')

          const cfg = courtStatusConfig[effectiveStatus] || courtStatusConfig.available
          const endTimeStr = displayRes ? calculateEndTime(displayRes.time, displayRes.duration) : ''
          const countdownInfo = displayRes
            ? getReservationCountdown(displayRes.date, displayRes.time, endTimeStr, now)
            : null

          const isAvailable = effectiveStatus === 'available'
          const isSelected = activeCourtId === court.id

          return (
            <div
              key={court.id}
              className={`flex flex-col justify-between rounded-none border bg-[#FDFBF7] p-5 shadow-sm transition-all duration-300 hover:shadow-md ${
                cfg.border
              } ${isSelected ? 'ring-2 ring-[#1E5336]' : ''}`}
            >
              <div>
                {/* Court Header */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-2xl tracking-[-0.03em] text-[#1E5336]">{court.name}</h3>
                    <p className="text-[10px] text-[#6B756B] uppercase tracking-[0.14em] font-semibold">
                      Championship Surface · Regulation Net
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] font-bold rounded-none ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Realistic Pickleball Court Illustration */}
                <div className="my-3">
                  <PickleballCourtIllustration
                    courtName={court.name}
                    status={effectiveStatus}
                    currentBookingName={
                      activeOpenPlay
                        ? `Open Play (${activeOpenPlay.players.length} players)`
                        : displayRes?.customerName
                    }
                    scheduledTime={
                      activeOpenPlay
                        ? `${activeOpenPlay.startTime} – ${activeOpenPlay.endTime}`
                        : displayRes
                        ? `${displayRes.time} – ${endTimeStr}`
                        : undefined
                    }
                    playerNames={
                      activeOpenPlay
                        ? activeOpenPlay.players
                        : displayRes?.customerName
                        ? [displayRes.customerName]
                        : []
                    }
                  />
                </div>

                {/* Current Booking Info Block */}
                {activeOpenPlay ? (
                  <div className="rounded-none border border-blue-500/30 bg-blue-50/70 p-3 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-blue-900 border-b border-blue-200 pb-1">
                      <span>Open Play Session Active</span>
                      <span className="text-blue-700">
                        {activeOpenPlay.startTime} – {activeOpenPlay.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Scheduled Date:</span>
                      <span className="font-bold text-[#222222]">{activeOpenPlay.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Registered Players:</span>
                      <span className="font-bold text-[#1E5336]">
                        {activeOpenPlay.players.length} Players (Unlimited Slots)
                      </span>
                    </div>
                  </div>
                ) : displayRes ? (
                  <div className="rounded-none border border-[#1E5336]/20 bg-[#F3F0EC] p-3 text-xs space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[#1E5336] border-b border-[#222222]/10 pb-1">
                      <span>{activeRes ? 'Active Match in Progress' : 'Next Scheduled Booking'}</span>
                      {countdownInfo?.statusText && (
                        <span className="text-[10px] text-[#E1A728] font-bold">
                          {countdownInfo.statusText}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Reserved by:</span>
                      <span className="font-bold text-[#222222]">{displayRes.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Format / Players:</span>
                      <span className="font-bold text-[#222222]">
                        {displayRes.players ? `${displayRes.players} Players (${displayRes.players >= 4 ? 'Doubles' : 'Singles'})` : 'Confirmed Booking'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Scheduled Date:</span>
                      <span className="font-bold text-[#222222]">{displayRes.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756B]">Time Slot:</span>
                      <span className="font-bold text-[#1E5336]">
                        {displayRes.time} – {endTimeStr}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-none border border-dashed border-emerald-600/30 bg-emerald-50/50 p-3.5 text-center text-xs text-emerald-800 mb-4 flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-[#E1A728]" />
                    <span className="font-semibold">Court is currently open for instant booking.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Book Court, View Schedule, Manage Booking */}
              <div>
                <div className="border-t border-[#222222]/10 pt-4 space-y-2">
                  {/* Primary Button: Book Court */}
                  <button
                    type="button"
                    onClick={() => handleBookCourt(court)}
                    className={`w-full rounded-none py-2.5 text-[10px] uppercase tracking-[0.16em] transition shadow-xs flex items-center justify-center gap-2 ${
                      isAvailable
                        ? 'bg-[#1E5336] text-white hover:bg-[#153d27]'
                        : 'bg-[#E1A728] text-[#1E5336] hover:bg-[#c9921b]'
                    }`}
                  >
                    <Calendar size={14} />
                    <span>Book {court.name}</span>
                  </button>

                  {/* Secondary Actions: View Schedule & Manage Booking */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewScheduleId(viewScheduleId === court.id ? null : court.id)}
                      className="rounded-none border border-[#222222]/20 py-2 px-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336] transition bg-white flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Clock size={12} />
                      <span>{viewScheduleId === court.id ? 'Hide Schedule' : 'View Schedule'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenManageModal(displayRes?.bookingId || '')}
                      className="rounded-none border border-[#222222]/20 py-2 px-2 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336] transition bg-white flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Wrench size={12} />
                      <span>Manage Booking</span>
                    </button>
                  </div>

                  {/* Open Play Quick Join (if session is active on this court) */}
                  {activeOpenPlay && onJoinOpenPlaySession && (
                    <button
                      type="button"
                      onClick={() => onJoinOpenPlaySession(activeOpenPlay)}
                      className="w-full rounded-none bg-blue-700 py-2 text-[10px] uppercase tracking-[0.14em] text-white hover:bg-blue-800 transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Users size={13} />
                      <span>Join Open Play ({activeOpenPlay.players.length} Players)</span>
                    </button>
                  )}

                  {/* Staff / Administrator Quick Override Controls */}
                  {isAdmin && (
                    <div className="mt-3 pt-2.5 border-t border-[#222222]/10 flex items-center justify-between text-[10px] bg-[#1E5336]/5 p-2 rounded-none">
                      <span className="font-bold text-[#1E5336] flex items-center gap-1">
                        <ShieldCheck size={12} /> Staff Override:
                      </span>
                      <select
                        value={courtOverrides[court.id] || ''}
                        onChange={(e) =>
                          updateCourtOverrideStatus(court.id, (e.target.value as any) || undefined)
                        }
                        className="border border-[#222222]/20 bg-white rounded-none px-2 py-0.5 text-[10px] font-bold text-[#1E5336]"
                      >
                        <option value="">Auto Status</option>
                        <option value="available">Available</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Expandable Court Schedule Drawer */}
                {viewScheduleId === court.id && (
                  <div className="mt-4 rounded-none border border-[#222222]/15 bg-white p-3.5 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-[#222222]/10 pb-2 mb-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#1E5336]">
                        Schedule for {court.name}
                      </span>
                      <span className="text-[10px] text-[#6B756B]">₱350 / hr</span>
                    </div>

                    {courtRes.length > 0 ? (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto">
                        {courtRes.map((r) => {
                          const end = calculateEndTime(r.time, r.duration || 1)
                          return (
                            <div
                              key={r.id}
                              className="flex items-center justify-between rounded-none bg-[#F3F0EC] p-2 text-[11px]"
                            >
                              <div>
                                <span className="font-bold text-[#1E5336]">{r.date}</span>
                                <span className="ml-1 text-[#222222]">
                                  ({r.time}–{end})
                                </span>
                              </div>
                              <span className="font-medium text-[#6B756B]">{r.customerName}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#6B756B] py-2 text-center">
                        No upcoming bookings on record. All slots are open!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Booking Management Modal */}
      <ManageBookingModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false)
          setManageReference('')
        }}
        initialReference={manageReference}
      />
    </div>
  )
}
