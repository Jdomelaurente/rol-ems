// ─── Cottage & Event Catalog (dynamic, admin-managed) ────────────────────────

export type CatalogOption = {
  id: string
  name: string
  detail: string
  price: number
  capacity: number
  active: boolean
}

export type CatalogAddOn = {
  id: string
  name: string
  detail: string
  price: number
  unit: string
  active: boolean
}

export type CottageCatalog = {
  cottages: CatalogOption[]
  venues: CatalogOption[]
  cottageAddOns: CatalogAddOn[]
  eventAddOns: CatalogAddOn[]
}

export type CatalogSectionKey = keyof CottageCatalog

export function peso(n: number): string {
  return `₱${n.toLocaleString('en-PH')}`
}

export function ratePrice(n: number, unit = 'day'): string {
  return n > 0 ? `${peso(n)} / ${unit}` : 'Fee on request'
}

export const defaultCatalog: CottageCatalog = {
  cottages: [
    { id: 'cottage-01', name: 'Kubo Cottage', detail: 'Beachside nipa-hut cottage', price: 1800, capacity: 6, active: true },
    { id: 'cottage-02', name: 'Beach Cottage', detail: 'Beachside cottage rental · kubo style', price: 2500, capacity: 8, active: true },
    { id: 'cottage-03', name: 'Family Cottage', detail: 'Larger cottage for families & groups', price: 3500, capacity: 12, active: true },
  ],
  venues: [
    { id: 'venue-01', name: 'Half-Area Venue', detail: 'Half of the resort for smaller events', price: 12000, capacity: 50, active: true },
    { id: 'venue-02', name: 'Whole-Area Venue', detail: 'Whole resort / event area', price: 20000, capacity: 150, active: true },
  ],
  cottageAddOns: [
    { id: 'extra-bedding', name: 'Extra bedding', detail: 'Extra mattress + linens per guest', price: 100, unit: 'each / night', active: true },
    { id: 'griller', name: 'Charcoal griller', detail: 'Barbecue set with charcoal', price: 300, unit: 'per stay', active: true },
    { id: 'karaoke', name: 'Karaoke machine', detail: 'Videoke with speakers + mics', price: 500, unit: 'per stay', active: true },
    { id: 'beach-tables', name: 'Table & chairs', detail: 'Outdoor table + 4 chairs', price: 250, unit: 'per stay', active: true },
    { id: 'pocket-wifi', name: 'Pocket Wi-Fi', detail: 'Portable hotspot for the stay', price: 200, unit: 'per stay', active: true },
  ],
  eventAddOns: [
    { id: 'chairs', name: 'Folding chairs', detail: 'Stackable chairs for guests', price: 50, unit: 'each / day', active: true },
    { id: 'tables', name: 'Long tables', detail: '8-ft banquet tables', price: 300, unit: 'each / day', active: true },
    { id: 'deck-chairs', name: 'Deck chairs', detail: 'Lounge deck chairs', price: 120, unit: 'each / day', active: true },
    { id: 'canopy', name: 'Canopy / tent', detail: 'Shade canopy for outdoor setups', price: 1500, unit: 'each / day', active: true },
    { id: 'sound', name: 'Sound system', detail: 'Speakers + mic setup', price: 2500, unit: 'per event', active: true },
    { id: 'gen-set', name: 'Generator', detail: 'Backup power generator', price: 2000, unit: 'per event', active: true },
    { id: 'catering', name: 'Catering service', detail: 'Full package, quote on request', price: 0, unit: 'quote', active: true },
  ],
}

export function sanitizeCatalog(partial: Partial<CottageCatalog> | null | undefined): CottageCatalog {
  const source = partial && typeof partial === 'object' ? partial : {}
  const arr = <T,>(list: T[] | undefined, fallback: T[]): T[] => (Array.isArray(list) ? list : fallback)
  const options = (list: CatalogOption[] | undefined, fallback: CatalogOption[]) =>
    arr(list, fallback).filter((o) => o && o.name)
  const addOns = (list: CatalogAddOn[] | undefined, fallback: CatalogAddOn[]) =>
    arr(list, fallback).filter((a) => a && a.name)
  return {
    cottages: options(source.cottages, defaultCatalog.cottages),
    venues: options(source.venues, defaultCatalog.venues),
    cottageAddOns: addOns(source.cottageAddOns, defaultCatalog.cottageAddOns),
    eventAddOns: addOns(source.eventAddOns, defaultCatalog.eventAddOns),
  }
}