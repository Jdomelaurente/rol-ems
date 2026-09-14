'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { Paddle, PaddleType, PaymentMethod } from '@/lib/data'
import ConsentCheckbox from '@/components/legal/ConsentCheckbox'
import Navbar from '@/components/layout/Navbar'
import { Disc, ShieldCheck, Zap, Layers, Filter, CheckCircle2, Clock, CalendarCheck, Users, Trophy } from 'lucide-react'

export default function PaddleRentalPage() {
  const { paddles, openPlaySessions, rentPaddle } = usePickleball()
  const [selectedType, setSelectedType] = useState<string>('All')
  const [selectedPaddle, setSelectedPaddle] = useState<Paddle | null>(null)
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)

  const [renterName, setRenterName] = useState('')
  const [renterContact, setRenterContact] = useState('')
  const [attachedToType, setAttachedToType] = useState<'Court Booking' | 'Open Play' | 'Tournament' | 'Standalone'>('Open Play')
  const [attachedToId, setAttachedToId] = useState('')
  const [rentalDuration, setRentalDuration] = useState('2 Hours')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)

  const paddleTypes = ['All', 'Control', 'Power', 'All-Around', 'Spin', 'Precision']

  const filteredPaddles = paddles.filter((p) =>
    selectedType === 'All' ? true : p.type === selectedType
  )

  const handleOpenRentModal = (paddle: Paddle) => {
    setSelectedPaddle(paddle)
    setSuccessMessage(null)
    setConsent(false)
    setIsRentModalOpen(true)
  }

  const handleConfirmRental = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPaddle || !renterName.trim() || !consent) return

    const selectedSession = openPlaySessions.find((s) => s.id === attachedToId)
    const courtOrSessionStr =
      attachedToType === 'Open Play' && selectedSession
        ? `${selectedSession.court} Open Play (${selectedSession.startTime} - ${selectedSession.endTime})`
        : attachedToType === 'Court Booking'
        ? 'Attached to Court Booking'
        : attachedToType === 'Tournament'
        ? 'Attached to Tournament Match'
        : 'Standalone Paddle Rental'

    const rental = rentPaddle({
      paddleId: selectedPaddle.id,
      paddleName: selectedPaddle.name,
      renterName,
      renterContact,
      attachedToType,
      attachedToId: attachedToId || undefined,
      courtOrSession: courtOrSessionStr,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: rentalDuration,
      totalPrice: selectedPaddle.price,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pay at Counter' ? 'pending' : 'paid',
      status: paymentMethod === 'Pay at Counter' ? 'Reserved' : 'Active',
    })

    setSuccessMessage(
      `Rental confirmed! Reference #${rental.id}. You can collect your paddle at the front counter.`
    )
    setRenterName('')
    setRenterContact('')
  }

  const getStatusBadge = (status: Paddle['availability']) => {
    switch (status) {
      case 'Available':
        return 'border-[#1E5336]/30 bg-[#FDFBF7] text-[#1E5336]'
      case 'Rented':
        return 'border-[#E1A728]/50 bg-[#FDFBF7] text-[#E1A728]'
      case 'Reserved':
        return 'border-[#222222]/15 bg-[#FDFBF7] text-[#6B756B]'
      case 'Unavailable':
        return 'border-[#222222]/15 bg-[#FDFBF7] text-[#6B756B]'
      case 'Under Maintenance':
        return 'border-[#E1A728]/50 bg-[#FDFBF7] text-[#E1A728]'
      default:
        return 'border-[#222222]/15 bg-[#FDFBF7] text-[#6B756B]'
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pickleball Gear & Equipment</p>
              <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Paddle Rental Center</h1>
              <p className="mt-2 text-sm text-[#6B756B] max-w-2xl">
                Elevate your game with top-tier pickleball paddles from Selkirk, Joola, CRBN, and Paddletek.
                Rent a paddle for your Court Booking, Open Play session, or Tournament.
              </p>
            </div>
            <div className="flex items-center gap-3 border border-[#222222]/15 bg-[#FDFBF7] p-4">
              <Disc size={36} className="text-[#E1A728]" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#6B756B] font-bold">Rental Rates</p>
                <p className="font-serif text-2xl text-[#1E5336]">₱150 – ₱200 <span className="text-xs font-sans font-normal text-[#6B756B]">/ session</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#222222]/10 pb-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#1E5336]" />
            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#1E5336]">Filter by Type:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {paddleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                  selectedType === type
                    ? 'bg-[#1E5336] border-[#1E5336] text-[#FDFBF7]'
                    : 'bg-[#FDFBF7] border-[#222222]/15 text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 border border-[#222222]/15 bg-[#FDFBF7] p-6">
          <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
            <div>
              <h2 className="font-serif text-xl text-[#1E5336]">Paddle Rental Inventory Table</h2>
              <p className="mt-1 text-xs text-[#6B756B]">Real-time availability for booking & Open Play</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#1E5336] font-bold">
              {paddles.filter((p) => p.availability === 'Available').length} Available Now
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">
                <tr>
                  <th className="p-3">Paddle</th>
                  <th className="p-3">Brand & Model</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">Rental Price</th>
                  <th className="p-3 text-center">Availability</th>
                  <th className="p-3 text-center">Condition</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]/10">
                {filteredPaddles.map((paddle) => (
                  <tr key={paddle.id} className="transition hover:bg-[#F3F0EC]/50">
                    <td className="p-3 font-bold text-[#1E5336]">
                      <div className="flex items-center gap-2">
                        <Disc size={16} className="text-[#E1A728]" />
                        <span>{paddle.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-[#222222]">{paddle.brand} · {paddle.model}</td>
                    <td className="p-3">
                      <span className="border border-[#222222]/15 bg-[#F3F0EC] px-2 py-0.5 text-[10px] font-bold uppercase text-[#222222]">
                        {paddle.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#1E5336]">₱{paddle.price}</td>
                    <td className="p-3 text-center">
                      <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${getStatusBadge(paddle.availability)}`}>
                        {paddle.availability} ({paddle.quantityAvailable}/{paddle.totalQuantity})
                      </span>
                    </td>
                    <td className="p-3 text-center text-[#6B756B]">{paddle.condition}</td>
                    <td className="p-3 text-right">
                      <button
                        disabled={paddle.availability !== 'Available' || paddle.quantityAvailable <= 0}
                        onClick={() => handleOpenRentModal(paddle)}
                        className={`px-3 py-1 text-[10px] uppercase tracking-[0.12em] font-bold transition ${
                          paddle.availability === 'Available' && paddle.quantityAvailable > 0
                            ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153b26]'
                            : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                        }`}
                      >
                        {paddle.availability === 'Available' && paddle.quantityAvailable > 0 ? 'Rent Now' : 'Unavailable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="font-serif text-2xl text-[#1E5336] mb-4">Available Equipment Specifications</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPaddles.map((paddle) => (
            <div
              key={paddle.id}
              className="flex flex-col justify-between border border-[#222222]/15 bg-[#FDFBF7] p-6 transition hover:border-[#1E5336]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#E1A728]">
                    {paddle.brand}
                  </span>
                  <span className={`border px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold ${getStatusBadge(paddle.availability)}`}>
                    {paddle.availability}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-[#1E5336]">{paddle.name}</h3>
                <p className="mt-0.5 text-xs text-[#6B756B]">{paddle.model}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Paddle Type:</span>
                    <span className="font-bold text-[#1E5336]">{paddle.type}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Rental Price:</span>
                    <span className="font-mono font-bold text-[#1E5336]">₱{paddle.price}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Stock Available:</span>
                    <span className="font-bold text-[#222222]">{paddle.quantityAvailable} of {paddle.totalQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#222222]/5 pb-1">
                    <span className="text-[#6B756B]">Condition:</span>
                    <span className="font-bold text-[#1E5336]">{paddle.condition}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[#6B756B]">Duration:</span>
                    <span className="text-[#222222]">{paddle.rentalDuration}</span>
                  </div>
                </div>

                {paddle.notes && (
                  <p className="mt-3 border border-[#222222]/10 bg-[#F3F0EC] p-2.5 text-[11px] italic text-[#555]">
                    "{paddle.notes}"
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#222222]/10">
                <button
                  disabled={paddle.availability !== 'Available' || paddle.quantityAvailable <= 0}
                  onClick={() => handleOpenRentModal(paddle)}
                  className={`w-full py-2.5 text-[10px] uppercase tracking-[0.16em] font-bold transition ${
                    paddle.availability === 'Available' && paddle.quantityAvailable > 0
                      ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153b26]'
                      : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                  }`}
                >
                  {paddle.availability === 'Available' && paddle.quantityAvailable > 0
                    ? 'Rent This Paddle'
                    : 'Currently Rented / Reserved'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isRentModalOpen && selectedPaddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg border border-[#222222]/20 bg-[#FDFBF7] p-6">
            <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3 mb-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#E1A728]">Pickleball Equipment</p>
                <h3 className="font-serif text-2xl text-[#1E5336]">Reserve Paddle Rental</h3>
              </div>
              <button
                onClick={() => setIsRentModalOpen(false)}
                className="text-lg font-bold text-[#6B756B] hover:text-[#222222]"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="py-6 space-y-4 text-center">
                <CheckCircle2 size={48} className="mx-auto text-[#1E5336]" />
                <h4 className="font-serif text-xl text-[#1E5336]">Paddle Reserved Successfully!</h4>
                <p className="text-xs text-[#6B756B]">{successMessage}</p>
                <button
                  onClick={() => setIsRentModalOpen(false)}
                  className="mt-4 bg-[#1E5336] px-6 py-2 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7]"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmRental} className="space-y-4">
                <div className="border border-[#222222]/10 bg-[#F3F0EC] p-3 text-xs space-y-1">
                  <p className="font-bold text-[#1E5336]">{selectedPaddle.name} ({selectedPaddle.brand})</p>
                  <p className="text-[#6B756B]">Type: {selectedPaddle.type} · Rate: ₱{selectedPaddle.price}</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                    Renter Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    value={renterContact}
                    onChange={(e) => setRenterContact(e.target.value)}
                    placeholder="0917-XXX-XXXX"
                    className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                    Attach Rental To
                  </label>
                  <select
                    value={attachedToType}
                    onChange={(e) => setAttachedToType(e.target.value as any)}
                    className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                  >
                    <option value="Open Play">Open Play Session</option>
                    <option value="Court Booking">Court Reservation</option>
                    <option value="Tournament">Tournament Session</option>
                    <option value="Standalone">Standalone Rental</option>
                  </select>
                </div>

                {attachedToType === 'Open Play' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                      Select Open Play Session
                    </label>
                    <select
                      value={attachedToId}
                      onChange={(e) => setAttachedToId(e.target.value)}
                      className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="">-- Choose Session --</option>
                      {openPlaySessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.court} · {s.dayOfWeek} ({s.startTime} - {s.endTime})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                      Rental Duration
                    </label>
                    <select
                      value={rentalDuration}
                      onChange={(e) => setRentalDuration(e.target.value)}
                      className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="1 Hour">1 Hour</option>
                      <option value="2 Hours">2 Hours</option>
                      <option value="Open Play Session">Open Play Session</option>
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.16em] font-bold text-[#6B756B] mb-1">
                      Payment Option
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full border border-[#222222]/20 bg-transparent p-2.5 text-xs text-[#222222] focus:border-[#1E5336] outline-none"
                    >
                      <option value="GCash">GCash (Online)</option>
                      <option value="Maya">Maya (Online)</option>
                      <option value="Online Gateway">Credit/Debit Gateway</option>
                      <option value="Pay at Counter">Pay at Counter</option>
                    </select>
                  </div>
                </div>

                <ConsentCheckbox id="paddle-consent" agreed={consent} onChange={setConsent} />

                <div className="flex items-center justify-between border-t border-[#222222]/10 pt-4">
                  <div>
                    <p className="text-[10px] text-[#6B756B]">Total Rental Amount</p>
                    <p className="font-serif text-xl font-bold text-[#1E5336]">₱{selectedPaddle.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRentModalOpen(false)}
                      className="border border-[#222222]/20 px-4 py-2 text-[10px] uppercase tracking-[0.14em] font-bold text-[#6B756B]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!consent}
                      className={`px-5 py-2 text-[10px] uppercase tracking-[0.16em] font-bold ${
                        consent ? 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153b26]' : 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                      }`}
                    >
                      Confirm Rental
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}