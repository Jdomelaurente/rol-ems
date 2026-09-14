'use client'

import React, { useState } from 'react'
import { usePickleball } from '@/context/PickleballContext'
import { ShopCategory, ShopItem } from '@/lib/data'
import Navbar from '@/components/layout/Navbar'
import { Search } from 'lucide-react'

export default function ShopPage() {
  const { shopItems, buyShopItem } = usePickleball()

  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

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
      setCheckoutMessage(`Order Confirmed! ${result.message}`)
      setTimeout(() => {
        setActiveItem(null)
        setCheckoutMessage('')
        setCheckoutQty(1)
        setCustomerName('')
        setCustomerContact('')
      }, 2500)
    } else {
      setCheckoutMessage(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pt-[64px] pb-16">
      <Navbar />

      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Pro Shop</p>
          <h1 className="mt-2 font-serif text-4xl text-[#1E5336] sm:text-5xl">Pickleball Pro Shop</h1>
          <p className="mt-2 text-sm text-[#6B756B]">Paddle rentals, tournament balls, overgrips, edge guard tape, lead tape, and more.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 border border-[#222222]/10 bg-[#FDFBF7] p-5">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3.5 text-[#6B756B]" />
            <input
              type="text"
              placeholder="Search paddles, balls, overgrips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#222222]/20 bg-transparent pl-10 pr-4 py-3 text-xs outline-none focus:border-[#1E5336]"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#222222]/10 pt-4">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'rental', label: 'Paddle Rentals' },
              { id: 'grip', label: 'Overgrips & Tapes' },
              { id: 'balls', label: 'Balls' },
              { id: 'accessory', label: 'Maintenance' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`border px-3.5 py-1.5 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                  selectedCategory === cat.id
                    ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                    : 'border-[#222222]/20 bg-[#FDFBF7] text-[#6B756B] hover:border-[#222222]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const isLowStock = item.stock <= 5 && item.stock > 0
            const isOutOfStock = item.stock === 0

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-[#222222]/10 bg-[#FDFBF7] p-5 transition hover:border-[#1E5336]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                      Pickleball
                    </span>
                    {item.badge && (
                      <span className="border border-[#E1A728]/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#E1A728]">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-serif text-lg text-[#1E5336]">{item.name}</h3>
                  <p className="text-[11px] text-[#6B756B]">{item.brand}</p>
                  <p className="mt-2 text-xs leading-5 text-[#6B756B]">{item.description}</p>
                </div>

                <div className="mt-6 border-t border-[#222222]/10 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-serif text-2xl text-[#1E5336]">₱{item.price}</span>
                      <span className="block text-[10px] text-[#6B756B]">{item.isRental ? '/ session rental' : 'per unit'}</span>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="border border-[#222222]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#6B756B]">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="border border-[#E1A728]/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#E1A728]">
                          Low: {item.stock}
                        </span>
                      ) : (
                        <span className="border border-[#1E5336]/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-[#1E5336]">
                          In Stock ({item.stock})
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => setActiveItem(item)}
                    className={`mt-4 w-full py-2.5 text-[10px] uppercase tracking-[0.16em] font-bold transition ${
                      isOutOfStock
                        ? 'bg-[#222222]/10 text-[#6B756B] cursor-not-allowed'
                        : item.isRental
                        ? 'bg-[#E1A728] text-[#1E5336] hover:bg-[#c48e1a]'
                        : 'bg-[#1E5336] text-[#FDFBF7] hover:bg-[#153d27]'
                    }`}
                  >
                    {item.isRental ? 'Rent Paddle' : 'Buy Product'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md border border-[#222222]/10 bg-[#FDFBF7] p-6">
              <div className="flex items-center justify-between border-b border-[#222222]/10 pb-3">
                <h3 className="font-serif text-xl text-[#1E5336]">
                  {activeItem.isRental ? 'Paddle Rental Checkout' : 'Product Checkout'}
                </h3>
                <button onClick={() => setActiveItem(null)} className="p-1 text-[#6B756B] hover:text-black">✕</button>
              </div>

              {checkoutMessage && (
                <div className="my-3 border border-[#1E5336]/20 bg-[#F3F0EC] p-3 text-xs font-bold text-[#1E5336]">
                  {checkoutMessage}
                </div>
              )}

              <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-4 text-xs">
                <div className="border border-[#222222]/10 bg-[#F3F0EC] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#1E5336] font-bold">{activeItem.brand}</p>
                  <p className="font-serif text-lg text-[#1E5336]">{activeItem.name}</p>
                  <p className="mt-1 font-bold text-[#1E5336]">₱{activeItem.price} each</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Quantity</label>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutQty((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center border border-[#222222]/20 font-bold hover:border-[#1E5336]"
                    >
                      -
                    </button>
                    <span className="font-serif text-lg text-[#1E5336]">{checkoutQty}</span>
                    <button
                      type="button"
                      onClick={() => setCheckoutQty((q) => Math.min(activeItem.stock, q + 1))}
                      className="flex h-8 w-8 items-center justify-center border border-[#222222]/20 font-bold hover:border-[#1E5336]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Rivera"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B] font-bold">Payment Option</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-2 w-full border border-[#222222]/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
                  >
                    <option value="GCash">GCash E-Wallet</option>
                    <option value="Maya">Maya</option>
                    <option value="Pay at Counter">Pay at Counter</option>
                    <option value="Cash">Cash on Hand</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-[#222222]/10 pt-3">
                  <span className="font-bold text-[#6B756B]">Total Payable:</span>
                  <span className="font-serif text-2xl text-[#1E5336]">₱{activeItem.price * checkoutQty}</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1E5336] py-3 text-[10px] uppercase tracking-[0.16em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
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