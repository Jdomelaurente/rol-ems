// ─── Facility Types (Existing) ───────────────────────────────────────────────

export type Facility = {
  establishment: 'ROL-EMS Resort' | 'Rebar Sports Center'
  category: string
  title: string
  detail: string
  status: string
  image: string
}

export const facilities: Facility[] = [
  {
    establishment: 'ROL-EMS Resort',
    category: 'Stay',
    title: 'Cottage & Event',
    detail: 'Private cottage stay · whole-area and event reservations',
    status: 'Available now',
    image: '/sports-events/cottage.jpeg',
  },
  {
    establishment: 'ROL-EMS Resort',
    category: 'Play',
    title: 'Pickleball',
    detail: 'Pickleball court · open play queue active',
    status: 'Live queue active',
    image: '/sports-events/pickleball.jpeg',
  },
  {
    establishment: 'Rebar Sports Center',
    category: 'Play',
    title: 'Taekwondo',
    detail: 'Training floor for taekwondo sessions',
    status: 'Available now',
    image: '/sports-events/teakwondo.jpeg',
  },
  {
    establishment: 'Rebar Sports Center',
    category: 'Play',
    title: 'Badminton & Games',
    detail: 'Badminton courts · dart, chess, UNO & other card and board games',
    status: 'Available now',
    image: '/sports-events/badminton.jpeg',
  },
]

export type CottageType = {
  name: string
  detail: string
  price: string
  image: string
  capacity?: number
}

export const cottageOptions: CottageType[] = [
  { name: 'Kubo Cottage', detail: 'Beachside nipa-hut cottage', price: '₱1,800 / day', image: '/sports-events/cottage.jpeg', capacity: 6 },
  { name: 'Beach Cottage', detail: 'Beachside cottage rental · kubo style', price: '₱2,500 / day', image: '/sports-events/cottage.jpeg', capacity: 8 },
  { name: 'Family Cottage', detail: 'Larger cottage for families & groups', price: '₱3,500 / day', image: '/sports-events/cottage.jpeg', capacity: 12 },
]

export const eventVenues: CottageType[] = [
  { name: 'Half-Area Venue', detail: 'Half of the resort for smaller events', price: '₱12,000 / day', image: '/sports-events/cottage.jpeg', capacity: 50 },
  { name: 'Whole-Area Venue', detail: 'Whole resort / event area', price: '₱20,000 / day', image: '/sports-events/cottage.jpeg', capacity: 150 },
]

export type EventAddOn = {
  id: string
  name: string
  detail: string
  price: number
  unit: string
}

export const eventAddOns: EventAddOn[] = [
  { id: 'chairs', name: 'Folding chairs', detail: 'Stackable chairs for guests', price: 50, unit: 'each / day' },
  { id: 'tables', name: 'Long tables', detail: '8-ft banquet tables', price: 300, unit: 'each / day' },
  { id: 'deck-chairs', name: 'Deck chairs', detail: 'Lounge deck chairs', price: 120, unit: 'each / day' },
  { id: 'canopy', name: 'Canopy / tent', detail: 'Shade canopy for outdoor setups', price: 1500, unit: 'each / day' },
  { id: 'sound', name: 'Sound system', detail: 'Speakers + mic setup', price: 2500, unit: 'per event' },
  { id: 'gen-set', name: 'Generator', detail: 'Backup power generator', price: 2000, unit: 'per event' },
  { id: 'catering', name: 'Catering service', detail: 'Full package, quote on request', price: 0, unit: 'quote' },
]

export const cottageAddOns: EventAddOn[] = [
  { id: 'extra-bedding', name: 'Extra bedding', detail: 'Extra mattress + linens per guest', price: 100, unit: 'each / night' },
  { id: 'griller', name: 'Charcoal griller', detail: 'Barbecue set with charcoal', price: 300, unit: 'per stay' },
  { id: 'karaoke', name: 'Karaoke machine', detail: 'Videoke with speakers + mics', price: 500, unit: 'per stay' },
  { id: 'beach-tables', name: 'Table & chairs', detail: 'Outdoor table + 4 chairs', price: 250, unit: 'per stay' },
  { id: 'pocket-wifi', name: 'Pocket Wi-Fi', detail: 'Portable hotspot for the stay', price: 200, unit: 'per stay' },
]

export const gameRentals: EventAddOn[] = [
  { id: 'uno', name: 'UNO cards', detail: 'Classic colour-and-number family card game', price: 50, unit: 'per set' },
  { id: 'playing-cards', name: 'Playing cards', detail: 'Standard deck for poker, pusoy dos & co.', price: 30, unit: 'per deck' },
  { id: 'chess', name: 'Chess set', detail: 'Folding board + wooden pieces', price: 60, unit: 'per set' },
  { id: 'dart', name: 'Dart set', detail: 'Dartboard + set of darts', price: 100, unit: 'per set' },
  { id: 'board-games', name: 'Board games', detail: 'Scrabble, Monopoly, and more', price: 80, unit: 'per game' },
]

export const pickleballOptions: CottageType[] = [
  { name: 'Court 01', detail: 'Standard pickleball court', price: '₱350 / hour', image: '/sports-events/pickleball.jpg' },
  { name: 'Court 02', detail: 'Standard pickleball court', price: '₱350 / hour', image: '/sports-events/pickleball.jpg' },
  { name: 'Court 03', detail: 'Standard pickleball court', price: '₱350 / hour', image: '/sports-events/pickleball.jpg' },
]

export const badmintonOptions: CottageType[] = [
  { name: 'Court 01', detail: 'Air-conditioned badminton court', price: '₱300 / hour', image: '/sports-events/badminton.jpeg' },
  { name: 'Court 02', detail: 'Air-conditioned badminton court', price: '₱300 / hour', image: '/sports-events/badminton.jpeg' },
]

export const taekwondoOptions: CottageType[] = [
  { name: 'Training Floor 01', detail: 'Taekwondo training floor', price: '₱250 / hour', image: '/sports-events/teakwondo.jpg' },
  { name: 'Training Floor 02', detail: 'Taekwondo training floor', price: '₱250 / hour', image: '/sports-events/teakwondo.jpg' },
]

export const pickleballAvailability: Record<string, string[]> = {
  '2026-08-27': ['11:00 AM', '3:00 PM'],
  '2026-08-28': ['9:00 AM', '1:00 PM', '6:00 PM'],
}

export const facilityFilters = ['All', 'ROL-EMS Resort', 'Rebar Sports Center'] as const

export const queues: Record<string, string[]> = {
  Pickleball: ['Court 02', 'M. Santos / J. Rivera', '11 — 8', '12 min'],
  Badminton: ['Court 01', 'A. Cruz / P. Lim', '19 — 17', '8 min'],
  'Ping-Pong': ['Table 01', 'K. Dela Cruz / R. Tan', '7 — 5', '5 min'],
}

export const queueOrder = Object.keys(queues)

// ─── Court Types ─────────────────────────────────────────────────────────────

export type CourtStatus = 'available' | 'reserved' | 'occupied' | 'open-play'

export type Court = {
  id: string
  name: string
  detail: string
  price: string
  status: CourtStatus
  currentReservation?: {
    name: string
    time: string
    endTime: string
  }
}

export type ScheduleSlot = {
  time: string
  status: 'available' | 'reserved' | 'occupied' | 'open-play'
  name?: string
  players?: number
}

// ─── Open Play Types ──────────────────────────────────────────────────────────

export type OpenPlaySession = {
  id: string
  court: string
  date: string
  dayOfWeek?: string
  startTime: string
  endTime: string
  players: string[]
  maxPlayers: number
  queue: string[]
  isRegistrationOpen: boolean
  isQueueOpen: boolean
  status: 'open' | 'full' | 'in-progress' | 'ended' | 'cancelled'
}

// ─── Paddle Rental Types ──────────────────────────────────────────────────────

export type PaddleType = 'Control' | 'Power' | 'All-Around' | 'Spin' | 'Precision'
export type PaddleStatus = 'Available' | 'Rented' | 'Reserved' | 'Unavailable' | 'Under Maintenance'
export type PaddleCondition = 'New' | 'Excellent' | 'Good' | 'Fair'

export type Paddle = {
  id: string
  name: string
  brand: string
  model: string
  type: PaddleType
  price: number
  availability: PaddleStatus
  quantityAvailable: number
  totalQuantity: number
  rentalDuration: string
  condition: PaddleCondition
  image?: string
  notes?: string
}

export type PaymentMethod =
  | 'Cash'
  | 'GCash'
  | 'Maya'
  | 'Bank Transfer'
  | 'Online Gateway'
  | 'Pay at Counter'

export type PaddleRental = {
  id: string
  paddleId: string
  paddleName: string
  renterName: string
  renterContact?: string
  attachedToType: 'Court Booking' | 'Open Play' | 'Tournament' | 'Standalone'
  attachedToId?: string
  courtOrSession?: string
  date: string
  time: string
  duration: string
  totalPrice: number
  paymentMethod: PaymentMethod
  paymentStatus: 'paid' | 'pending'
  status: 'Active' | 'Reserved' | 'Returned' | 'Cancelled'
  rentedAt: string
}

// ─── Tournament & Pair Types ──────────────────────────────────────────────────

export type TournamentStatus =
  | 'upcoming'
  | 'registration-open'
  | 'in-progress'
  | 'completed'

export type TournamentFormat = 'pairing' | 'team-event'

export type TournamentBracketFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'group-stage'

export type TournamentPair = {
  id: string
  tournamentId: string
  pairName?: string
  player1: string
  player2: string
  extraPlayers?: string[]
  seed?: number
  status: 'active' | 'eliminated' | 'champion'
}

export type Tournament = {
  id: string
  name: string
  type: string
  format: TournamentFormat
  bracketFormat?: TournamentBracketFormat
  date: string
  time: string
  location: string
  registrationFee: number
  maxTeams: number
  registeredTeams: number
  registrationDeadline: string
  status: TournamentStatus
  description: string
  bannerColor: string
  published: boolean
  pairs?: TournamentPair[]
  championPairId?: string
  championPairName?: string
  championPlayers?: string[]
}

export function getPairDisplayName(p?: { pairName?: string; player1?: string; player2?: string; team1?: string }): string {
  if (!p) return 'TBD'
  if (p.pairName && p.pairName.trim().length > 0) return p.pairName
  if (p.team1 && p.team1.trim().length > 0) return p.team1
  if (p.player1 && p.player2) return `${p.player1} & ${p.player2}`
  if (p.player1) return p.player1
  return 'TBD'
}

export type RegisteredTeam = {
  id: string
  tournamentId: string
  teamName: string
  captain: string
  contact: string
  members: string[]
  paymentStatus: 'paid' | 'pending'
  registeredAt: string
}

// ─── Bracket Types ────────────────────────────────────────────────────────────

export type BracketRound = 'R1' | 'QF' | 'SF' | 'Final'

export type BracketMatch = {
  id: string
  tournamentId?: string
  round: BracketRound
  matchNumber: number
  team1: string
  team2: string
  team1Players?: string[]
  team2Players?: string[]
  score1?: number
  score2?: number
  winner?: string
  winnerPairId?: string
  court?: string
  date?: string
  time?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending' | 'eliminated'
  nextMatchId?: string
}

// ─── Reservation Types ────────────────────────────────────────────────────────

export type Reservation = {
  id: string
  bookingId: string
  customerName: string
  court: string
  date: string
  time: string
  duration: number
  players: number
  paymentMethod: PaymentMethod
  paymentStatus: 'paid' | 'pending' | 'cancelled'
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'in-progress'
  total: number
  paddleRentalId?: string
  paddleRentalName?: string
}

// ─── Initial Courts Data ──────────────────────────────────────────────────────

export const courts: Court[] = [
  {
    id: 'court-01',
    name: 'Court 1',
    detail: 'Standard outdoor pickleball court with premium non-slip surface',
    price: '₱350 / hour',
    status: 'available',
  },
  {
    id: 'court-02',
    name: 'Court 2',
    detail: 'Standard outdoor pickleball court with premium non-slip surface',
    price: '₱350 / hour',
    status: 'reserved',
    currentReservation: {
      name: 'Maria Santos',
      time: '8:00 AM',
      endTime: '10:00 AM',
    },
  },
  {
    id: 'court-03',
    name: 'Court 3',
    detail: 'Standard outdoor pickleball court with premium non-slip surface',
    price: '₱350 / hour',
    status: 'open-play',
  },
]

export const courtSchedule: Record<string, ScheduleSlot[]> = {
  'court-01': [
    { time: '7:00 AM', status: 'available' },
    { time: '8:00 AM', status: 'available' },
    { time: '9:00 AM', status: 'available' },
    { time: '10:00 AM', status: 'reserved', name: 'J. Rivera', players: 4 },
    { time: '11:00 AM', status: 'reserved', name: 'J. Rivera', players: 4 },
    { time: '12:00 PM', status: 'available' },
    { time: '1:00 PM', status: 'available' },
    { time: '2:00 PM', status: 'occupied', name: 'Walk-in', players: 2 },
    { time: '3:00 PM', status: 'available' },
    { time: '4:00 PM', status: 'available' },
    { time: '5:00 PM', status: 'available' },
    { time: '6:00 PM', status: 'available' },
    { time: '7:00 PM', status: 'available' },
    { time: '8:00 PM', status: 'available' },
  ],
  'court-02': [
    { time: '7:00 AM', status: 'available' },
    { time: '8:00 AM', status: 'reserved', name: 'M. Santos', players: 4 },
    { time: '9:00 AM', status: 'reserved', name: 'M. Santos', players: 4 },
    { time: '10:00 AM', status: 'available' },
    { time: '11:00 AM', status: 'available' },
    { time: '12:00 PM', status: 'reserved', name: 'P. Cruz', players: 4 },
    { time: '1:00 PM', status: 'reserved', name: 'P. Cruz', players: 4 },
    { time: '2:00 PM', status: 'available' },
    { time: '3:00 PM', status: 'available' },
    { time: '4:00 PM', status: 'available' },
    { time: '5:00 PM', status: 'available' },
    { time: '6:00 PM', status: 'available' },
    { time: '7:00 PM', status: 'available' },
    { time: '8:00 PM', status: 'available' },
  ],
  'court-03': [
    { time: '7:00 AM', status: 'available' },
    { time: '8:00 AM', status: 'available' },
    { time: '9:00 AM', status: 'available' },
    { time: '10:00 AM', status: 'available' },
    { time: '11:00 AM', status: 'available' },
    { time: '12:00 PM', status: 'available' },
    { time: '1:00 PM', status: 'available' },
    { time: '2:00 PM', status: 'available' },
    { time: '3:00 PM', status: 'available' },
    { time: '4:00 PM', status: 'available' },
    { time: '5:00 PM', status: 'available' },
    { time: '6:00 PM', status: 'available' },
    { time: '7:00 PM', status: 'open-play' },
    { time: '8:00 PM', status: 'open-play' },
  ],
}

// ─── Initial Open Play Data ───────────────────────────────────────────────────

export const openPlaySessions: OpenPlaySession[] = [
  {
    id: 'op-001',
    court: 'Court 1',
    date: '2026-08-31',
    dayOfWeek: 'Monday',
    startTime: '5:00 PM',
    endTime: '8:00 PM',
    players: [
      'Maria Santos', 'Juan Rivera', 'Pedro Cruz', 'Ana Lopez',
      'Mike Tan', 'Lisa Mendoza', 'Carlo Delos Santos', 'Jenny Aquino',
    ],
    maxPlayers: 12,
    queue: ['Remy Bautista', 'Chris Garcia'],
    isRegistrationOpen: true,
    isQueueOpen: true,
    status: 'open',
  },
  {
    id: 'op-002',
    court: 'Court 2',
    date: '2026-08-31',
    dayOfWeek: 'Monday',
    startTime: '6:00 PM',
    endTime: '9:00 PM',
    players: [
      'Art Santiago', 'Bea Mendoza', 'Carl Dela Cruz', 'Dina Lim',
      'Ed Pascual', 'Faye Castro', 'Greg Torres', 'Hanna Reyes',
      'Ivan Ordonez', 'Julia Alcantara', 'Kevin Bonifacio', 'Laura Ramos',
    ],
    maxPlayers: 12,
    queue: ['Mark Sison', 'Nora Diaz', 'Oscar Velasco'],
    isRegistrationOpen: true,
    isQueueOpen: true,
    status: 'full',
  },
  {
    id: 'op-003',
    court: 'Court 3',
    date: '2026-09-01',
    dayOfWeek: 'Tuesday',
    startTime: '7:00 AM',
    endTime: '10:00 AM',
    players: ['Paolo Sy', 'Quirino Dizon', 'Rhea Santos'],
    maxPlayers: 12,
    queue: [],
    isRegistrationOpen: true,
    isQueueOpen: true,
    status: 'open',
  },
]

// ─── Initial Paddle Inventory Data ────────────────────────────────────────────

export const initialPaddles: Paddle[] = [
  {
    id: 'pad-001',
    name: 'Selkirk Vanguard Control',
    brand: 'Selkirk',
    model: 'Control Quad 16mm',
    type: 'Control',
    price: 150,
    availability: 'Available',
    quantityAvailable: 4,
    totalQuantity: 5,
    rentalDuration: '2 Hours / Session',
    condition: 'Excellent',
    notes: 'Premium carbon face designed for touch & dinking control',
  },
  {
    id: 'pad-002',
    name: 'Joola Perseus 3S',
    brand: 'Joola',
    model: 'Ben Johns Edition',
    type: 'Power',
    price: 150,
    availability: 'Available',
    quantityAvailable: 3,
    totalQuantity: 4,
    rentalDuration: '2 Hours / Session',
    condition: 'New',
    notes: 'Explosive pop for aggressive baseline drives & smashes',
  },
  {
    id: 'pad-003',
    name: 'CRBN 1X 16mm Hybrid',
    brand: 'CRBN',
    model: 'Raw Carbon Fiber 1X',
    type: 'Spin',
    price: 200,
    availability: 'Available',
    quantityAvailable: 2,
    totalQuantity: 3,
    rentalDuration: '2 Hours / Session',
    condition: 'Excellent',
    notes: 'Tacky friction surface for maximum topspin & slice',
  },
  {
    id: 'pad-004',
    name: 'Paddletek Bantam TKO-C',
    brand: 'Paddletek',
    model: 'TKO-C 14.3mm',
    type: 'All-Around',
    price: 180,
    availability: 'Rented',
    quantityAvailable: 0,
    totalQuantity: 2,
    rentalDuration: '2 Hours / Session',
    condition: 'Good',
    notes: 'Balanced sweet spot for all-around play styles',
  },
  {
    id: 'pad-005',
    name: 'Prokennex Kinetic Pro Speed',
    brand: 'Prokennex',
    model: 'Pro Speed v2',
    type: 'Precision',
    price: 200,
    availability: 'Under Maintenance',
    quantityAvailable: 0,
    totalQuantity: 1,
    rentalDuration: '2 Hours / Session',
    condition: 'Fair',
    notes: 'Vibration damping technology (Grip replacement scheduled)',
  },
]

export const initialPaddleRentals: PaddleRental[] = [
  {
    id: 'pdr-001',
    paddleId: 'pad-004',
    paddleName: 'Paddletek Bantam TKO-C',
    renterName: 'Maria Santos',
    renterContact: '0917-111-2233',
    attachedToType: 'Court Booking',
    attachedToId: 'PB-241801',
    courtOrSession: 'Court 2 (8:00 AM - 10:00 AM)',
    date: '2026-08-29',
    time: '8:00 AM',
    duration: '2 Hours',
    totalPrice: 180,
    paymentMethod: 'GCash',
    paymentStatus: 'paid',
    status: 'Active',
    rentedAt: '2026-08-29 07:45 AM',
  },
  {
    id: 'pdr-002',
    paddleId: 'pad-001',
    paddleName: 'Selkirk Vanguard Control',
    renterName: 'Juan Rivera',
    renterContact: '0918-222-3344',
    attachedToType: 'Open Play',
    attachedToId: 'op-001',
    courtOrSession: 'Court 1 Open Play (5:00 PM - 8:00 PM)',
    date: '2026-08-31',
    time: '5:00 PM',
    duration: 'Session',
    totalPrice: 150,
    paymentMethod: 'Pay at Counter',
    paymentStatus: 'pending',
    status: 'Reserved',
    rentedAt: '2026-08-29 09:30 AM',
  },
]

// ─── Initial Pairs & Tournaments Data ──────────────────────────────────────────

export const initialPairs: TournamentPair[] = [
  { id: 'pair-1', tournamentId: 'tourn-001', player1: 'Maria Santos', player2: 'Juan Rivera', seed: 1, status: 'active' },
  { id: 'pair-2', tournamentId: 'tourn-001', player1: 'Pedro Cruz', player2: 'Ana Lopez', seed: 2, status: 'active' },
  { id: 'pair-3', tournamentId: 'tourn-001', pairName: 'Smash Duo', player1: 'Mike Tan', player2: 'Lisa Mendoza', seed: 3, status: 'active' },
  { id: 'pair-4', tournamentId: 'tourn-001', player1: 'Carlo Delos Santos', player2: 'Jenny Aquino', seed: 4, status: 'active' },
  { id: 'pair-5', tournamentId: 'tourn-001', player1: 'Remy Bautista', player2: 'Chris Garcia', seed: 5, status: 'eliminated' },
  { id: 'pair-6', tournamentId: 'tourn-001', player1: 'Diane Hernandez', player2: 'Art Santiago', seed: 6, status: 'eliminated' },
  { id: 'pair-7', tournamentId: 'tourn-001', player1: 'Bea Mendoza', player2: 'Carl Dela Cruz', seed: 7, status: 'eliminated' },
  { id: 'pair-8', tournamentId: 'tourn-001', player1: 'Dina Lim', player2: 'Ed Pascual', seed: 8, status: 'eliminated' },
]

export const tournaments: Tournament[] = [
  {
    id: 'tourn-001',
    name: 'Pickleball Summer Smash 2026',
    type: 'Open Category',
    format: 'pairing',
    date: '2026-08-30',
    time: '8:00 AM',
    location: 'ROL-EMS Resort – Courts 1, 2 & 3',
    registrationFee: 500,
    maxTeams: 8,
    registeredTeams: 8,
    registrationDeadline: '2026-08-29',
    status: 'in-progress',
    description:
      'Pairing tournament (2 players per team). Quarterfinals through Finals with live score tracking and court assignments.',
    bannerColor: '#1E5336',
    published: true,
    pairs: initialPairs,
  },
  {
    id: 'tourn-002',
    name: 'ROL-EMS Club Championship',
    type: 'Team Event',
    format: 'team-event',
    date: '2026-09-15',
    time: '7:00 AM',
    location: 'ROL-EMS Resort – All Courts',
    registrationFee: 1200,
    maxTeams: 8,
    registeredTeams: 4,
    registrationDeadline: '2026-09-10',
    status: 'upcoming',
    description:
      'Club Team Event Tournament. Squads of 4-8 players compete in multi-match club ties.',
    bannerColor: '#E1A728',
    published: true,
  },
]

export const bracketMatches: BracketMatch[] = [
  {
    id: 'm1',
    tournamentId: 'tourn-001',
    round: 'QF',
    matchNumber: 1,
    team1: 'Maria Santos & Juan Rivera',
    team2: 'Pedro Cruz & Ana Lopez',
    team1Players: ['Maria Santos', 'Juan Rivera'],
    team2Players: ['Pedro Cruz', 'Ana Lopez'],
    score1: 11,
    score2: 7,
    winner: 'Maria Santos & Juan Rivera',
    winnerPairId: 'pair-1',
    court: 'Court 1',
    date: '2026-08-30',
    time: '8:00 AM',
    status: 'completed',
    nextMatchId: 'm5',
  },
  {
    id: 'm2',
    tournamentId: 'tourn-001',
    round: 'QF',
    matchNumber: 2,
    team1: 'Smash Duo',
    team2: 'Carlo Delos Santos & Jenny Aquino',
    team1Players: ['Mike Tan', 'Lisa Mendoza'],
    team2Players: ['Carlo Delos Santos', 'Jenny Aquino'],
    score1: 9,
    score2: 11,
    winner: 'Carlo Delos Santos & Jenny Aquino',
    winnerPairId: 'pair-4',
    court: 'Court 2',
    date: '2026-08-30',
    time: '8:00 AM',
    status: 'completed',
    nextMatchId: 'm5',
  },
  {
    id: 'm3',
    tournamentId: 'tourn-001',
    round: 'QF',
    matchNumber: 3,
    team1: 'Remy Bautista & Chris Garcia',
    team2: 'Diane Hernandez & Art Santiago',
    team1Players: ['Remy Bautista', 'Chris Garcia'],
    team2Players: ['Diane Hernandez', 'Art Santiago'],
    score1: 11,
    score2: 5,
    winner: 'Remy Bautista & Chris Garcia',
    winnerPairId: 'pair-5',
    court: 'Court 3',
    date: '2026-08-30',
    time: '9:00 AM',
    status: 'completed',
    nextMatchId: 'm6',
  },
  {
    id: 'm4',
    tournamentId: 'tourn-001',
    round: 'QF',
    matchNumber: 4,
    team1: 'Bea Mendoza & Carl Dela Cruz',
    team2: 'Dina Lim & Ed Pascual',
    team1Players: ['Bea Mendoza', 'Carl Dela Cruz'],
    team2Players: ['Dina Lim', 'Ed Pascual'],
    score1: 6,
    score2: 11,
    winner: 'Dina Lim & Ed Pascual',
    winnerPairId: 'pair-8',
    court: 'Court 1',
    date: '2026-08-30',
    time: '9:00 AM',
    status: 'completed',
    nextMatchId: 'm6',
  },
  {
    id: 'm5',
    tournamentId: 'tourn-001',
    round: 'SF',
    matchNumber: 5,
    team1: 'Maria Santos & Juan Rivera',
    team2: 'Carlo Delos Santos & Jenny Aquino',
    team1Players: ['Maria Santos', 'Juan Rivera'],
    team2Players: ['Carlo Delos Santos', 'Jenny Aquino'],
    court: 'Court 1',
    date: '2026-08-30',
    time: '10:30 AM',
    status: 'in-progress',
    nextMatchId: 'm7',
  },
  {
    id: 'm6',
    tournamentId: 'tourn-001',
    round: 'SF',
    matchNumber: 6,
    team1: 'Remy Bautista & Chris Garcia',
    team2: 'Dina Lim & Ed Pascual',
    team1Players: ['Remy Bautista', 'Chris Garcia'],
    team2Players: ['Dina Lim', 'Ed Pascual'],
    court: 'Court 2',
    date: '2026-08-30',
    time: '10:30 AM',
    status: 'scheduled',
    nextMatchId: 'm7',
  },
  {
    id: 'm7',
    tournamentId: 'tourn-001',
    round: 'Final',
    matchNumber: 7,
    team1: 'Winner SF1 (TBD)',
    team2: 'Winner SF2 (TBD)',
    court: 'Court 1',
    date: '2026-08-30',
    time: '2:00 PM',
    status: 'pending',
  },
]

// ─── Reservations Data ────────────────────────────────────────────────────────

export const reservations: Reservation[] = [
  { id: '1', bookingId: 'PB-241801', customerName: 'Maria Santos', court: 'Court 2', date: '2026-08-29', time: '8:00 AM', duration: 2, players: 4, paymentMethod: 'GCash', paymentStatus: 'paid', bookingStatus: 'confirmed', total: 700, paddleRentalId: 'pdr-001', paddleRentalName: 'Paddletek Bantam TKO-C' },
  { id: '2', bookingId: 'PB-241802', customerName: 'Juan Rivera', court: 'Court 1', date: '2026-08-29', time: '10:00 AM', duration: 1, players: 2, paymentMethod: 'Pay at Counter', paymentStatus: 'pending', bookingStatus: 'pending', total: 350 },
  { id: '3', bookingId: 'PB-241803', customerName: 'Pedro Cruz', court: 'Court 2', date: '2026-08-29', time: '12:00 PM', duration: 2, players: 4, paymentMethod: 'Maya', paymentStatus: 'paid', bookingStatus: 'confirmed', total: 700 },
  { id: '4', bookingId: 'PB-241804', customerName: 'Ana Lopez', court: 'Court 3', date: '2026-08-30', time: '7:00 AM', duration: 1, players: 2, paymentMethod: 'Cash', paymentStatus: 'paid', bookingStatus: 'confirmed', total: 350 },
  { id: '5', bookingId: 'PB-241805', customerName: 'Michael Tan', court: 'Court 1', date: '2026-08-30', time: '2:00 PM', duration: 3, players: 6, paymentMethod: 'Online Gateway', paymentStatus: 'pending', bookingStatus: 'pending', total: 1050 },
  { id: '6', bookingId: 'PB-241806', customerName: 'Lisa Mendoza', court: 'Court 3', date: '2026-08-31', time: '9:00 AM', duration: 2, players: 4, paymentMethod: 'GCash', paymentStatus: 'paid', bookingStatus: 'confirmed', total: 700 },
]

// ─── New Feature Types (from Rol-ems-pickleball) ──────────────────────────────

export type SportType = 'Pickleball' | 'Badminton' | 'Ping-Pong'

// ─── Coaching Types ───────────────────────────────────────────────────────────

export type TrainingPackage = {
  id: string
  name: string
  sessionsCount: number
  price: number
  description: string
  badge?: string
}

export type Coach = {
  id: string
  name: string
  sport: SportType
  title: string
  avatar: string
  bio: string
  rating: number
  hourlyRate: number
  experienceYears: number
  availableDays: string[]
  timeSlots: string[]
  packages: TrainingPackage[]
}

export type CoachingBooking = {
  id: string
  coachId: string
  coachName: string
  playerName: string
  playerContact: string
  sport: SportType
  date: string
  time: string
  packageName: string
  totalPrice: number
  status: 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

export type PlayerProgress = {
  playerName: string
  sport: SportType
  skillScores: {
    serve: number
    dinkVolley: number
    smashPower: number
    footworkAgility: number
    tactics: number
  }
  feedbackHistory: {
    date: string
    coachName: string
    notes: string
    focusArea: string
  }[]
}

export const initialCoaches: Coach[] = [
  {
    id: 'coach-01',
    name: 'Coach Mark Rivera',
    sport: 'Pickleball',
    title: 'Head Coach · IPTPA Certified',
    avatar: 'MR',
    bio: 'Former national-level paddle athlete with 10+ years of coaching. Specializes in 3rd shot drops, kitchen-line dinking, and aggressive speed-up counters.',
    rating: 4.9,
    hourlyRate: 500,
    experienceYears: 10,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    timeSlots: ['7:00 AM', '9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
    packages: [
      { id: 'pkg-01-1', name: 'Beginner Foundation', sessionsCount: 4, price: 1800, description: 'Grip, stance, serving, and basic rally skills.' },
      { id: 'pkg-01-2', name: 'Intermediate Control', sessionsCount: 6, price: 2800, description: 'Dinking, resets, and 3rd shot strategies.' },
      { id: 'pkg-01-3', name: 'Advanced Match Play', sessionsCount: 8, price: 4000, description: 'Tournament tactics, stacking, and speed-ups.' },
    ],
  },
  {
    id: 'coach-02',
    name: 'Coach Elena Vance',
    sport: 'Pickleball',
    title: 'Specialist Coach · PPR Certified',
    avatar: 'EV',
    bio: 'Former tennis pro turned pickleball specialist. Known for razor-sharp volley technique, serve placement, and footwork fundamentals.',
    rating: 4.8,
    hourlyRate: 450,
    experienceYears: 8,
    availableDays: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
    timeSlots: ['6:00 AM', '8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
    packages: [
      { id: 'pkg-02-1', name: 'Quick Start', sessionsCount: 3, price: 1200, description: 'Fast-track fundamentals for new players.' },
      { id: 'pkg-02-2', name: 'Doubles Dynamics', sessionsCount: 5, price: 2200, description: 'Communication, positioning, and poaching.' },
    ],
  },
  {
    id: 'coach-03',
    name: 'Coach Diego Ramos',
    sport: 'Pickleball',
    title: 'Fitness & Agility Coach',
    avatar: 'DR',
    bio: 'Certified sports-conditioning coach focusing on court movement, recovery, and injury prevention for pickleball athletes.',
    rating: 4.7,
    hourlyRate: 400,
    experienceYears: 6,
    availableDays: ['Monday', 'Tuesday', 'Friday'],
    timeSlots: ['7:00 AM', '8:00 AM', '6:00 PM', '7:00 PM'],
    packages: [
      { id: 'pkg-03-1', name: 'Movement Masterclass', sessionsCount: 4, price: 1500, description: 'Agility drills, split-steps, and recovery.' },
    ],
  },
]

export const initialCoachingBookings: CoachingBooking[] = []

export const initialPlayerProgress: PlayerProgress[] = [
  {
    playerName: 'Maria Santos',
    sport: 'Pickleball',
    skillScores: { serve: 4.2, dinkVolley: 4.5, smashPower: 3.8, footworkAgility: 4.0, tactics: 3.6 },
    feedbackHistory: [
      { date: '2026-08-25', coachName: 'Coach Mark Rivera', notes: 'Great improvement on 3rd shot drop depth. Keep the paddle up at the kitchen line.', focusArea: 'Dinking & Reset Control' },
      { date: '2026-08-10', coachName: 'Coach Elena Vance', notes: 'Serve placement much better. Work on split-step timing on returns.', focusArea: 'Serve & Return' },
    ],
  },
  {
    playerName: 'Juan Rivera',
    sport: 'Pickleball',
    skillScores: { serve: 3.9, dinkVolley: 3.5, smashPower: 4.3, footworkAgility: 3.6, tactics: 3.2 },
    feedbackHistory: [
      { date: '2026-08-22', coachName: 'Coach Diego Ramos', notes: 'Footwork improved after agility drills. Focus on controlled speed-ups.', focusArea: 'Movement & Agility' },
    ],
  },
]

// ─── Rebar Sports Shop Types ──────────────────────────────────────────────────

export type ShopCategory = 'rental' | 'grip' | 'shuttlecock' | 'balls' | 'accessory'

export type ShopItem = {
  id: string
  name: string
  sport: SportType | 'All'
  category: ShopCategory
  price: number
  stock: number
  brand: string
  description: string
  badge?: string
  isRental?: boolean
}

export const initialShopItems: ShopItem[] = [
  { id: 'shp-001', name: 'Selkirk Vanguard Control', sport: 'Pickleball', category: 'rental', price: 150, stock: 5, brand: 'Selkirk', description: 'Premium carbon face rental paddle built for touch & dinking control.', badge: 'Rental', isRental: true },
  { id: 'shp-002', name: 'Joola Perseus 3S', sport: 'Pickleball', category: 'rental', price: 200, stock: 4, brand: 'Joola', description: 'Ben Johns Edition · explosive pop for drives & smashes.', badge: 'Pro', isRental: true },
  { id: 'shp-003', name: 'CRBN 1X 16mm Hybrid', sport: 'Pickleball', category: 'rental', price: 200, stock: 3, brand: 'CRBN', description: 'Raw carbon fiber surface for maximum topspin & slice.', isRental: true },
  { id: 'shp-004', name: 'Franklin X-40 Outdoor Balls', sport: 'Pickleball', category: 'balls', price: 120, stock: 48, brand: 'Franklin', description: 'Official tournament ball · USA Pickleball approved. Sold per piece.' },
  { id: 'shp-005', name: 'Dura Fast 40 Outdoor Balls', sport: 'Pickleball', category: 'balls', price: 130, stock: 30, brand: 'Dura', description: 'Crack-proof outdoor ball with 40-drilled holes for consistent flight.' },
  { id: 'shp-006', name: 'Tourna Mega Tac Overgrip', sport: 'Pickleball', category: 'grip', price: 250, stock: 20, brand: 'Tourna', description: 'Ultra-tacky overgrip for maximum sweat absorption. 3-pack.' },
  { id: 'shp-007', name: 'Edge Guard Tape Roll', sport: 'Pickleball', category: 'grip', price: 180, stock: 15, brand: 'Gearbox', description: 'Protects paddle edges from pops and cracks during play.' },
  { id: 'shp-008', name: 'Lead Tape Kit', sport: 'Pickleball', category: 'accessory', price: 150, stock: 12, brand: 'Carbon', description: 'Customize paddle weight & balance. 1/4" lead tape roll.' },
]

// ─── AI Open Play Queue Types ─────────────────────────────────────────────────

export type AIQueuePlayer = {
  id: string
  name: string
  sport: SportType
  wins: number
  losses: number
  points?: number
  gamesPlayed: number
  waitTimeMinutes: number
  sitOutCount: number
  fixedPartner?: string
  photo?: string
  paymentMethod?: 'Pay at Counter' | 'GCash' | 'Maya'
  pairNumber?: number
  partnerName?: string
  status: 'waiting' | 'in-match' | 'resting'
}

export type MiniMatch = {
  id: string
  sport: SportType
  court: string
  player1: string
  player2: string
  player3?: string
  player4?: string
  score1: number
  score2: number
  status: 'upcoming' | 'live' | 'completed'
  time: string
}

export const initialAIQueuePlayers: AIQueuePlayer[] = []
export const initialMiniMatches: MiniMatch[] = []

// ─── Open Play Stats & Leaderboard Types ───────────────────────────────────────

export type PlayerStat = {
  id: string
  name: string
  sport: SportType
  wins: number
  losses: number
  winRate: number
  pointDiff: number
  streak: number
  rating: number
  rank: number
  recentMatches: { opponent: string; score: string; result: 'W' | 'L' }[]
}

export const initialPlayerStats: PlayerStat[] = []

// ─── Club & Registered Teams ─────────────────────────────────────────────────

export type ClubTeam = {
  id: string
  name: string
  sport: SportType
  captain: string
  contact: string
  logoBadge: string
  squadMembers: string[]
  maxSlots: number
  wins: number
  losses: number
  status: 'registered' | 'pending' | 'full'
}

export const initialClubTeams: ClubTeam[] = []

// ─── Roulette Random Pairing Types ────────────────────────────────────────────

export type RouletteSpinResult = {
  id: string
  timestamp: string
  playerA: string
  playerB: string
  bracketPlacement: string
  sport: SportType
  courtAssigned: string
}

export const initialRouletteResults: RouletteSpinResult[] = []

// ─── Live Match & Scoring Link Types ──────────────────────────────────────────

export type LiveMatchScore = {
  id: string
  sport: SportType
  tournamentId?: string
  matchTitle: string
  court: string
  team1Name: string
  team2Name: string
  team1Players: string[]
  team2Players: string[]
  score1: number
  score2: number
  set1Score1: number
  set1Score2: number
  set2Score1: number
  set2Score2: number
  currentSet: number
  currentServer: 1 | 2
  serverName: string
  status: 'warmup' | 'live' | 'completed' | 'paused'
  umpireName: string
  shareablePlayerLink: string
  shareableUmpireLink: string
  pointHistory: { team: 1 | 2; text: string; time: string }[]
}

export const initialLiveMatches: LiveMatchScore[] = [
  {
    id: 'live-1',
    sport: 'Pickleball',
    matchTitle: 'Summer Smash 2026 — Semifinal 1',
    court: 'Court 1 (Before)',
    team1Name: 'Santos & Rivera',
    team2Name: 'Delos Santos & Aquino',
    team1Players: ['Maria Santos', 'Juan Rivera'],
    team2Players: ['Carlo Delos Santos', 'Jenny Aquino'],
    score1: 4,
    score2: 2,
    set1Score1: 11,
    set1Score2: 9,
    set2Score1: 4,
    set2Score2: 2,
    currentSet: 2,
    currentServer: 1,
    serverName: 'Maria Santos',
    status: 'live',
    umpireName: 'Coach Mark Rivera',
    shareablePlayerLink: '/score/live-1',
    shareableUmpireLink: '/umpire/live-1',
    pointHistory: [
      { team: 1, text: 'Santos & Rivera score update (4 - 2)', time: '10:41 AM' },
      { team: 2, text: 'Delos Santos & Aquino score update (3 - 2)', time: '10:38 AM' },
      { team: 1, text: 'Santos & Rivera score update (3 - 1)', time: '10:35 AM' },
    ],
  },
  {
    id: 'live-2',
    sport: 'Pickleball',
    matchTitle: 'Summer Smash 2026 — Semifinal 2',
    court: 'Court 2 (Patience)',
    team1Name: 'Bautista & Garcia',
    team2Name: 'Lim & Pascual',
    team1Players: ['Remy Bautista', 'Chris Garcia'],
    team2Players: ['Dina Lim', 'Ed Pascual'],
    score1: 1,
    score2: 7,
    set1Score1: 2,
    set1Score2: 11,
    set2Score1: 1,
    set2Score2: 7,
    currentSet: 2,
    currentServer: 2,
    serverName: 'Dina Lim',
    status: 'live',
    umpireName: 'Coach Elena Vance',
    shareablePlayerLink: '/score/live-2',
    shareableUmpireLink: '/umpire/live-2',
    pointHistory: [
      { team: 2, text: 'Lim & Pascual score update (1 - 7)', time: '10:40 AM' },
      { team: 1, text: 'Bautista & Garcia score update (1 - 5)', time: '10:37 AM' },
    ],
  },
]
