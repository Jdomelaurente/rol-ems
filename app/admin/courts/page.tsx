'use client'

import { useState } from 'react'
import Link from 'next/link'
import { courts as initialCourts, courtSchedule } from '@/lib/data'
import type { Court, CourtStatus } from '@/lib/data'
import { Volleyball, ArrowLeft, Plus, Edit2, Lock, Unlock, Users, Calendar, CheckCircle } from 'lucide-react'

export default function AdminCourtsPage() {
  const [courtsList, setCourtsList] = useState<Court[]>(initialCourts)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)
  const [statusSelect, setStatusSelect] = useState<CourtStatus>('available')

  const handleUpdateStatus = (courtId: string, newStatus: CourtStatus) => {
    setCourtsList((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, status: newStatus } : c))
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      {/* Subheader */}
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Courts</p>
              <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Admin Court Management</h1>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {courtsList.map((court) => {
            const schedule = courtSchedule[court.id] || []

            return (
              <div key={court.id} className="flex flex-col justify-between border border-[#222222]/15 bg-white p-6 shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-2xl font-bold text-[#1E5336]">{court.name}</h2>
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                      court.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                      court.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                      court.status === 'open-play' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {court.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#6B756B] mb-4">{court.detail}</p>
                  <p className="text-sm font-bold text-[#222222] mb-4">{court.price}</p>

                  <div className="space-y-2 border-t border-[#222222]/10 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B756B]">Quick Change Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'available')}
                        className={`rounded py-1.5 text-xs font-semibold border ${court.status === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Set Available
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'reserved')}
                        className={`rounded py-1.5 text-xs font-semibold border ${court.status === 'reserved' ? 'bg-amber-500 text-white border-amber-500' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Set Reserved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'open-play')}
                        className={`rounded py-1.5 text-xs font-semibold border ${court.status === 'open-play' ? 'bg-blue-600 text-white border-blue-600' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Assign Open Play
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(court.id, 'occupied')}
                        className={`rounded py-1.5 text-xs font-semibold border ${court.status === 'occupied' ? 'bg-red-600 text-white border-red-600' : 'border-[#222222]/20 text-[#6B756B] hover:bg-[#F3F0EC]'}`}
                      >
                        Block Court
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#222222]/10 pt-4">
                  <p className="text-[11px] font-semibold uppercase text-[#6B756B] mb-2">Today's Slots Overview</p>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 text-xs">
                    {schedule.map((s) => (
                      <div key={s.time} className="flex justify-between py-1 px-2 rounded bg-[#F3F0EC]/60">
                        <span className="font-medium text-[#222222]">{s.time}</span>
                        <span className="text-[#6B756B] capitalize">{s.status} {s.name ? `(${s.name})` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
