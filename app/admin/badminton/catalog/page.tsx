'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  useBadmintonCatalog,
} from '@/context/BadmintonContext'
import {
  peso,
  ratePrice,
  defaultBadmintonCatalog,
  type BadmintonCatalogSectionKey,
  type BadmintonCourt,
  type GameRental,
} from '@/lib/badminton-catalog'
import {
  ArrowLeft, Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, X, Home, Gamepad2, Shield,
} from 'lucide-react'

type Tab = 'courts' | 'gameRentals'

const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'courts', label: 'Courts', icon: Shield },
  { key: 'gameRentals', label: 'Game Rentals', icon: Gamepad2 },
]

interface ModalState {
  tab: Tab
  editing: BadmintonCourt | GameRental | null
}

export default function AdminBadmintonCatalogPage() {
  const { catalog, setSection, resetCatalog, loaded } = useBadmintonCatalog()
  const [tab, setTab] = useState<Tab>('courts')
  const [modal, setModal] = useState<ModalState | null>(null)

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab')
    if (requested && requested in catalog) setTab(requested as Tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = catalog[tab]
  const isCourtTab = tab === 'courts'

  const openAdd = () => setModal({ tab, editing: null })
  const openEdit = (item: BadmintonCourt | GameRental) => setModal({ tab, editing: item })

  const toggleActive = (item: BadmintonCourt | GameRental) => {
    const activeTotal = list.filter((i) => i.active).length
    if (isCourtTab && item.active && activeTotal <= 1) {
      window.alert('At least one court must stay visible on the booking page.')
      return
    }
    setSection(tab, list.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)))
  }

  const removeItem = (item: BadmintonCourt | GameRental) => {
    if (isCourtTab && list.length <= 1) {
      window.alert('Add another court before deleting this one.')
      return
    }
    setSection(tab, list.filter((i) => i.id !== item.id))
  }

  const activeCount = list.filter((i) => i.active).length

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#1E5336] hover:underline mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Badminton</p>
          <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Court & Game Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B756B]">
            Manage badminton courts and table games available for booking. Changes go live immediately.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon }) => {
            const total = catalog[key].length
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                  tab === key
                    ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                    : 'border-[#222222]/20 bg-[#FDFBF7] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]'
                }`}
              >
                <Icon size={14} />
                {label}
                <span className={`px-1.5 py-0.5 text-[9px] ${tab === key ? 'bg-[#FDFBF7] text-[#1E5336]' : 'bg-[#F3F0EC] text-[#6B756B]'}`}>
                  {total}
                </span>
              </button>
            )
          })}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B756B]">
            <span className="border border-[#222222]/15 bg-[#FDFBF7] px-3 py-1.5">
              {list.length} total · <span className="font-bold text-[#1E5336]">{activeCount} visible</span>
            </span>
            {loaded && <span className="hidden sm:inline text-[#6B756B]/60">Saved to database</span>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset this catalog to the factory defaults? This overwrites your current prices.')) resetCatalog()
              }}
              className="flex items-center gap-2 border border-[#222222]/20 bg-[#FDFBF7] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]"
            >
              <RefreshCw size={13} /> Reset defaults
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27]"
            >
              <Plus size={14} /> Add {isCourtTab ? 'court' : 'game rental'}
            </button>
          </div>
        </div>

        {/* Items table */}
        <div className="border border-[#222222]/15 bg-[#FDFBF7] shadow-sm">
          {list.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="font-serif text-xl text-[#1E5336]">No items here yet</p>
              <p className="mt-2 text-sm text-[#6B756B]">Add one so guests can book it.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#222222]/10 bg-[#F3F0EC] text-[#6B756B] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">{isCourtTab ? 'Capacity' : 'Unit'}</th>
                    <th className="p-3">Visibility</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {list.map((item) => {
                    const price = isCourtTab ? ratePrice((item as BadmintonCourt).price) : (item as GameRental).price > 0
                      ? `${peso((item as GameRental).price)} / ${(item as GameRental).unit}`
                      : 'Quote on request'
                    const meta = isCourtTab
                      ? `Up to ${(item as BadmintonCourt).capacity} players`
                      : (item as GameRental).unit
                    return (
                      <tr key={item.id} className={item.active ? '' : 'bg-[#F3F0EC] text-[#6B756B]/70'}>
                        <td className="p-3 font-bold text-[#1E5336]">
                          {item.name}
                          {!item.active && <span className="ml-2 text-[9px] uppercase tracking-[0.12em] text-red-700">Hidden</span>}
                        </td>
                        <td className="p-3 max-w-[240px]">{item.detail}</td>
                        <td className="p-3 font-bold text-[#1E5336]">{price}</td>
                        <td className="p-3 text-[#6B756B]">{meta}</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleActive(item)}
                            className={`flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase tracking-[0.12em] font-bold transition ${
                              item.active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-[#222222]/10 text-[#6B756B] hover:bg-[#222222]/20'
                            }`}
                          >
                            {item.active ? <Eye size={11} /> : <EyeOff size={11} />}
                            {item.active ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              aria-label={`Edit ${item.name}`}
                              className="p-1.5 text-[#6B756B] transition hover:bg-[#1E5336]/10 hover:text-[#1E5336]"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete ${item.name}? This cannot be undone.`)) removeItem(item)
                              }}
                              aria-label={`Delete ${item.name}`}
                              className="p-1.5 text-[#6B756B] transition hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ItemModal
          tab={modal.tab}
          item={modal.editing}
          catalog={catalog}
          onClose={() => setModal(null)}
          onSave={(saved) => {
            const key = modal.tab
            if (key === 'courts') {
              const option = saved as BadmintonCourt
              const next: BadmintonCourt[] = modal.editing
                ? catalog[key].map((i) => (i.id === modal.editing!.id ? option : i))
                : [...catalog[key], option]
              setSection(key, next)
            } else {
              const addon = saved as GameRental
              const next: GameRental[] = modal.editing
                ? catalog[key].map((i) => (i.id === modal.editing!.id ? addon : i))
                : [...catalog[key], addon]
              setSection(key, next)
            }
            setModal(null)
          }}
        />
      )}
    </div>
  )
}

function ItemModal({
  tab,
  item,
  catalog,
  onClose,
  onSave,
}: {
  tab: Tab
  item: BadmintonCourt | GameRental | null
  catalog: ReturnType<typeof useBadmintonCatalog>['catalog']
  onClose: () => void
  onSave: (item: BadmintonCourt | GameRental) => void
}) {
  const isCourt = tab === 'courts'
  const [name, setName] = useState(item?.name ?? '')
  const [detail, setDetail] = useState(item?.detail ?? '')
  const [price, setPrice] = useState(String(item?.price ?? ''))
  const [capacity, setCapacity] = useState(String((item as BadmintonCourt | null)?.capacity ?? 4))
  const [unit, setUnit] = useState((item as GameRental | null)?.unit ?? '')
  const [active, setActive] = useState(item?.active ?? true)

  const priceNum = parseInt(price.replace(/[^\d]/g, ''), 10) || 0

  const submit = () => {
    if (!name.trim()) return
    const base = { name: name.trim(), detail: detail.trim(), price: priceNum, active }
    if (isCourt) {
      onSave({ id: item?.id ?? `court-${Date.now().toString(36)}`, ...base, capacity: parseInt(capacity, 10) || 4 } as BadmintonCourt)
    } else {
      onSave({ id: item?.id ?? `game-${Date.now().toString(36)}`, ...base, unit: unit.trim() || 'per set' } as GameRental)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#FDFBF7] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#1E5336]">
            {item ? 'Edit' : 'Add'} {isCourt ? 'court' : 'game rental'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-[#6B756B] hover:text-[#222222]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">{isCourt ? 'Court name' : 'Game name'}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCourt ? 'e.g. Court 01' : 'e.g. UNO cards'}
              className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
            />
          </label>

          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Details</span>
            <input
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Short description guests will see"
              className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Price (₱/hr)</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 = on request"
                className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
              />
            </label>

            {isCourt ? (
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Player capacity</span>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Unit</span>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="e.g. per set / per deck"
                  className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 border border-[#222222]/15 bg-[#F3F0EC] px-3 py-2.5 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>Visible on the booking page</span>
          </label>

          {priceNum === 0 && (
            <p className="text-[11px] text-[#6B756B]">Price is 0 — guests will see "Fee on request" and pay at the venue.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="border border-[#222222]/20 px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#1E5336]">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="bg-[#1E5336] px-5 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] hover:bg-[#153d27] disabled:cursor-not-allowed disabled:bg-[#222222]/10 disabled:text-[#6B756B]"
          >
            {item ? 'Save changes' : 'Add to catalog'}
          </button>
        </div>
      </div>
    </div>
  )
}