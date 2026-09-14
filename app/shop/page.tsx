'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { ShopCategory, ShopItem } from '@/lib/data'
import {
  ShoppingBag,
  Disc,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sparkles,
  Tag,
  ShieldCheck,
  Search,
  Check,
  Package,
} from 'lucide-react'

export default function ShopPage() {
  const { shopItems, buyShopItem } = usePickleball()

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Checkout Modal State
  const [activeItem, setActiveItem] = useState<ShopItem | null>(null)
  const [checkoutQty, setCheckoutQty] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Cash' | 'Pay at Counter'>('GCash')
  const [checkoutMessage, setCheckoutMessage] = useState('')

  const filteredItems = shopItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeItem) return

    const result = buyShopItem(activeItem.id, checkoutQty)
    if (result.success) {
      setCheckoutMessage(`🎉 Order Confirmed! ${result.message}`)
      setTimeout(() => {
        setActiveItem(null)
        setCheckoutMessage('')
        setCheckoutQty(1)
        setCustomerName('')
        setCustomerContact('')
      }, 2500)
    } else {
      setCheckoutMessage(`❌ ${result.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] px-4 py-8 text-[#111827] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Banner */}
        <div className="mb-8 rounded-2xl bg-[#111827] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#E1A728]/15 blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E1A728]/40 bg-[#1F2937] px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E1A728]">
              <ShoppingBag size={14} /> Pickleball Pro Shop & Rental Station
            </span>
            <h1 className="mt-3 font-serif text-4xl font-extrabold sm:text-5xl">
              Gear Up for Peak Court Performance.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
              Pro Pickleball paddle rentals (Selkirk, Joola, CRBN), official Franklin X-40 & Dura Fast 40 tournament balls, overgrips, edge guard tape, lead tape, and carbon face erasers.
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mb-8 rounded-2xl border border-[#111827]/10 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search paddles, Franklin balls, overgrips, edge guard tape..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-[#F3F0EC]/60 pl-10 pr-4 py-2.5 text-xs font-medium focus:border-[#1E5336] focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'rental', label: 'Paddle Rentals' },
              { id: 'grip', label: 'Overgrips & Tapes' },
              { id: 'balls', label: 'Pickleball Balls (Franklin & Dura)' },
              { id: 'accessory', label: 'Paddle Maintenance' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#E1A728] text-[#111827] shadow font-extrabold'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isLowStock = item.stock <= 5 && item.stock > 0
            const isOutOfStock = item.stock === 0

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#111827]/10 bg-white p-5 shadow-sm transition hover:border-[#1E5336] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#1E5336]/10 px-2 py-0.5 text-[9px] font-extrabold uppercase text-[#1E5336]">
                      Pickleball
                    </span>
                    {item.badge && (
                      <span className="rounded bg-[#FDF6E7] px-2 py-0.5 text-[9px] font-bold uppercase text-[#C48E1A] border border-[#E1A728]/30">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-serif text-lg font-bold text-[#111827]">{item.name}</h3>
                  <p className="text-[11px] font-semibold text-gray-400">{item.brand}</p>
                  <p className="mt-2 text-xs text-[#6B756B] line-clamp-2 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-2xl font-bold text-[#1E5336]">₱{item.price}</span>
                      <span className="text-[10px] text-gray-400 block">{item.isRental ? '/ session rental' : 'per unit'}</span>
                    </div>

                    {/* Stock Status Indicator */}
                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                          Low Stock: {item.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                          In Stock ({item.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => setActiveItem(item)}
                    className={`mt-4 w-full rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                      isOutOfStock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : item.isRental
                        ? 'bg-[#E1A728] text-[#111827] hover:bg-[#c48e1a]'
                        : 'bg-[#1E5336] text-white hover:bg-[#153d27]'
                    }`}
                  >
                    {item.isRental ? 'Rent Paddle' : 'Buy Product'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Instant Checkout Drawer Modal */}
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-serif text-xl font-bold text-[#1E5336]">
                  {activeItem.isRental ? 'Paddle Rental Checkout' : 'Product Checkout'}
                </h3>
                <button
                  onClick={() => setActiveItem(null)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {checkoutMessage && (
                <div className="my-3 rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                  {checkoutMessage}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl bg-[#F3F0EC] p-4">
                  <span className="text-[10px] font-extrabold uppercase text-[#1E5336]">Pickleball • {activeItem.brand}</span>
                  <p className="font-serif text-lg font-bold text-[#111827]">{activeItem.name}</p>
                  <p className="mt-1 font-semibold text-[#1E5336]">₱{activeItem.price} each</p>
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Quantity</label>
                  <div className="mt-1 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutQty((q) => Math.max(1, q - 1))}
                      className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-serif text-lg font-bold">{checkoutQty}</span>
                    <button
                      type="button"
                      onClick={() => setCheckoutQty((q) => Math.min(activeItem.stock, q + 1))}
                      className="h-8 w-8 rounded-lg border border-gray-300 font-bold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Rivera"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#111827]">Payment Option</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-[#1E5336] focus:outline-none font-medium"
                  >
                    <option value="GCash">GCash E-Wallet</option>
                    <option value="Maya">Maya</option>
                    <option value="Pay at Counter">Pay at Counter</option>
                    <option value="Cash">Cash on Hand</option>
                  </select>
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <span className="font-bold text-gray-600">Total Payable:</span>
                  <span className="font-serif text-2xl font-bold text-[#1E5336]">
                    ₱{activeItem.price * checkoutQty}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#1E5336] py-3 font-bold uppercase tracking-wider text-white shadow hover:bg-[#153d27]"
                >
                  Confirm Order & Pay
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
