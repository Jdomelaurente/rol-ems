'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  useCottageCatalog,
} from '@/context/CottageContext'
import {
  peso,
  ratePrice,
  defaultCatalog,
  type CatalogSectionKey,
  type CatalogOption,
  type CatalogAddOn,
} from '@/lib/cottage-catalog'
import {
  ArrowLeft, Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, X, Home, CalendarRange, PackagePlus, PartyPopper,
} from 'lucide-react'

type Tab = 'cottages' | 'venues' | 'cottageAddOns' | 'eventAddOns'

const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'cottages', label: 'Cottages', icon: Home },
  { key: 'venues', label: 'Event Venues', icon: PartyPopper },
  { key: 'cottageAddOns', label: 'Cottage Add-ons', icon: PackagePlus },
  { key: 'eventAddOns', label: 'Event Add-ons', icon: CalendarRange },
]

interface ModalState {
  tab: Tab
  editing: CatalogOption | CatalogAddOn | null
}

export default function AdminCottageCatalogPage() {
  const { catalog, setSection, resetCatalog, loaded } = useCottageCatalog()
  const [tab, setTab] = useState<Tab>('cottages')
  const [modal, setModal] = useState<ModalState | null>(null)

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab')
    if (requested && requested in catalog) setTab(requested as Tab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const list = catalog[tab]
  const isOptionTab = tab === 'cottages' || tab === 'venues'

  const openAdd = () => setModal({ tab, editing: null })
  const openEdit = (item: CatalogOption | CatalogAddOn) => setModal({ tab, editing: item })

  const toggleActive = (item: CatalogOption | CatalogAddOn) => {
    const activeTotal = list.filter((i) => i.active).length
    if (isOptionTab && item.active && activeTotal <= 1) {
      window.alert('At least one option must stay visible on the booking page.')
      return
    }
    if (isOptionTab) {
      setSection(tab, catalog[tab].map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)))
    } else {
      setSection(tab, catalog[tab].map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)))
    }
  }

  const removeItem = (item: CatalogOption | CatalogAddOn) => {
    if (isOptionTab && list.length <= 1) {
      window.alert('Add another option before deleting this one.')
      return
    }
    if (isOptionTab) {
      setSection(tab, catalog[tab].filter((i) => i.id !== item.id))
    } else {
      setSection(tab, catalog[tab].filter((i) => i.id !== item.id))
    }
  }

  const activeCount = list.filter((i) => i.active).length

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]">
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Cottage & Event</p>
          <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Booking Catalog</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B756B]">
            Manage what guests can book at the resort — cottage &amp; venue options, their rates, and add-ons.
            Changes go live on the booking page immediately.
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
              <Plus size={14} /> Add {tab === 'cottages' ? 'cottage' : tab === 'venues' ? 'venue' : 'add-on'}
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
                    <th className="p-3">{tab === 'cottageAddOns' || tab === 'eventAddOns' ? 'Unit' : 'Capacity'}</th>
                    <th className="p-3">Visibility</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]/10">
                  {list.map((item) => {
                    const isOption = 'capacity' in item && !('unit' in item)
                    const price = isOption ? ratePrice((item as CatalogOption).price) : (item as CatalogAddOn).price > 0
                      ? `${peso((item as CatalogAddOn).price)} / ${(item as CatalogAddOn).unit}`
                      : 'Quote on request'
                    const meta = isOption
                      ? `Up to ${(item as CatalogOption).capacity} guests`
                      : (item as CatalogAddOn).unit
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
            if (key === 'cottages' || key === 'venues') {
              const option = saved as CatalogOption
              const next: CatalogOption[] = modal.editing
                ? catalog[key].map((i) => (i.id === modal.editing!.id ? option : i))
                : [...catalog[key], option]
              setSection(key, next)
            } else {
              const addon = saved as CatalogAddOn
              const next: CatalogAddOn[] = modal.editing
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
  item: CatalogOption | CatalogAddOn | null
  catalog: ReturnType<typeof useCottageCatalog>['catalog']
  onClose: () => void
  onSave: (item: CatalogOption | CatalogAddOn) => void
}) {
  const isOption = tab === 'cottages' || tab === 'venues'
  const [name, setName] = useState(item?.name ?? '')
  const [detail, setDetail] = useState(item?.detail ?? '')
  const [price, setPrice] = useState(String(item?.price ?? ''))
  const [capacity, setCapacity] = useState(String((item as CatalogOption | null)?.capacity ?? defaultCatalog.venues[0].capacity))
  const [unit, setUnit] = useState((item as CatalogAddOn | null)?.unit ?? '')
  const [active, setActive] = useState(item?.active ?? true)

  const priceNum = parseInt(price.replace(/[^\d]/g, ''), 10) || 0

  const submit = () => {
    if (!name.trim()) return
    const base = { name: name.trim(), detail: detail.trim(), price: priceNum, active }
    if (isOption) {
      onSave({ id: item?.id ?? `item-${Date.now().toString(36)}`, ...base, capacity: parseInt(capacity, 10) || 1 } as CatalogOption)
    } else {
      onSave({ id: item?.id ?? `item-${Date.now().toString(36)}`, ...base, unit: unit.trim() || 'per stay' } as CatalogAddOn)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#222222]/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#FDFBF7] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-[#1E5336]">
            {item ? 'Edit' : 'Add'} {isOption ? (tab === 'venues' ? 'venue' : 'cottage') : 'add-on'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-[#6B756B] hover:text-[#222222]">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">{isOption ? 'Name' : 'Add-on name'}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isOption ? 'e.g. Kubo Cottage' : 'e.g. Sound system'}
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
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Price (₱/day)</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 = on request"
                className="mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]"
              />
            </label>

            {isOption ? (
              <label className="block">
                <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Guest capacity</span>
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
                  placeholder="e.g. each / day"
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
            <p className="text-[11px] text-[#6B756B]">Price is 0 — guests will see &quot;Fee on request&quot; and pay at the venue.</p>
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