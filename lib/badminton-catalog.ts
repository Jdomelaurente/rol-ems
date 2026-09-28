// ─── Badminton Catalog (dynamic, admin-managed) ────────────────────────────────

export type BadmintonCourt = {
  id: string
  name: string
  detail: string
  price: number
  active: boolean
}

export type GameRental = {
  id: string
  name: string
  detail: string
  price: number
  unit: string
  active: boolean
}

export type BadmintonCatalog = {
  courts: BadmintonCourt[]
  gameRentals: GameRental[]
}

export type BadmintonCatalogSectionKey = keyof BadmintonCatalog

export function peso(n: number): string {
  return `₱${n.toLocaleString('en-PH')}`
}

export function ratePrice(n: number, unit = 'hour'): string {
  return n > 0 ? `${peso(n)} / ${unit}` : 'Fee on request'
}

export const defaultBadmintonCatalog: BadmintonCatalog = {
  courts: [
    { id: 'court-01', name: 'Court 01', detail: 'Air-conditioned badminton court', price: 300, active: true },
    { id: 'court-02', name: 'Court 02', detail: 'Air-conditioned badminton court', price: 300, active: true },
  ],
  gameRentals: [
    { id: 'uno', name: 'UNO cards', detail: 'Classic colour-and-number family card game', price: 50, unit: 'per set', active: true },
    { id: 'playing-cards', name: 'Playing cards', detail: 'Standard deck for poker, pusoy dos & co.', price: 30, unit: 'per deck', active: true },
    { id: 'chess', name: 'Chess set', detail: 'Folding board + wooden pieces', price: 60, unit: 'per set', active: true },
    { id: 'dart', name: 'Dart set', detail: 'Dartboard + set of darts', price: 100, unit: 'per set', active: true },
    { id: 'board-games', name: 'Board games', detail: 'Scrabble, Monopoly, and more', price: 80, unit: 'per game', active: true },
  ],
}

export function sanitizeBadmintonCatalog(partial: Partial<BadmintonCatalog> | null | undefined): BadmintonCatalog {
  const source = partial && typeof partial === 'object' ? partial : {}
  const arr = <T,>(list: T[] | undefined, fallback: T[]): T[] => (Array.isArray(list) ? list : fallback)
  const courts = (list: BadmintonCourt[] | undefined, fallback: BadmintonCourt[]) =>
    arr(list, fallback).filter((o) => o && o.name)
  const gameRentals = (list: GameRental[] | undefined, fallback: GameRental[]) =>
    arr(list, fallback).filter((a) => a && a.name)
  return {
    courts: courts(source.courts, defaultBadmintonCatalog.courts),
    gameRentals: gameRentals(source.gameRentals, defaultBadmintonCatalog.gameRentals),
  }
}