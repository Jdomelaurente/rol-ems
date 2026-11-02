export type BookingShape = {
  date: string
  nights?: number | null
}

export type StoredBooking = BookingShape & {
  status: string
  createdAt?: Date | string
}

export type DateRange = { start: Date; end: Date }

export const PENDING_HOLD_MS =
  (parseInt(process.env.PENDING_HOLD_MINUTES || '15', 10) || 15) * 60 * 1000

export const isActiveBooking = (b: StoredBooking, now: Date = new Date()): boolean => {
  if (b.status === 'confirmed' || b.status === 'completed') return true
  if (b.status !== 'pending') return false
  const createdAt = b.createdAt instanceof Date ? b.createdAt : b.createdAt ? new Date(b.createdAt) : now
  return now.getTime() - createdAt.getTime() < PENDING_HOLD_MS
}

export const toIso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const addDays = (d: Date, days: number) => {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

export const occupiedRange = (arrival: string, nights: number): DateRange => {
  const parts = arrival.split('-').map((n) => parseInt(n, 10))
  const start = new Date(parts[0], parts[1] - 1, parts[2])
  return { start, end: addDays(start, nights) }
}

export const bookingNights = (b: BookingShape): number =>
  b.nights && b.nights > 1 ? b.nights : 1

export const rangesOverlap = (a: DateRange, b: DateRange): boolean =>
  a.start < b.end && b.start < a.end

export const bookingsOverlap = (a: BookingShape, b: BookingShape): boolean =>
  rangesOverlap(occupiedRange(a.date, bookingNights(a)), occupiedRange(b.date, bookingNights(b)))

export const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0
  const clean = timeStr.trim().toUpperCase()
  const m = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/)
  if (!m) return 0
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = m[3]
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + min
}

export const formatMinutesToTime = (totalMin: number): string => {
  let normalized = Math.max(0, totalMin) % (24 * 60)
  let h = Math.floor(normalized / 60)
  const m = normalized % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${String(m).padStart(2, '0')} ${ap}`
}

export const calculateEndTime = (startTimeStr: string, durationHours: number = 1): string => {
  const startMin = parseTimeToMinutes(startTimeStr)
  const endMin = startMin + Math.round((durationHours || 1) * 60)
  return formatMinutesToTime(endMin)
}

export const getReservationCountdown = (
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  now: Date = new Date()
): { statusText: string; isCurrent: boolean; isUpcoming: boolean; isPast: boolean } => {
  if (!dateStr || !startTimeStr) {
    return { statusText: '', isCurrent: false, isUpcoming: false, isPast: false }
  }

  const todayIso = toIso(now)
  const startMin = parseTimeToMinutes(startTimeStr)
  const endMin = endTimeStr ? parseTimeToMinutes(endTimeStr) : startMin + 60
  const nowMin = now.getHours() * 60 + now.getMinutes()

  if (dateStr === todayIso) {
    if (nowMin >= startMin && nowMin < endMin) {
      const remaining = endMin - nowMin
      return {
        statusText: `Active · ends in ${remaining} min${remaining === 1 ? '' : 's'}`,
        isCurrent: true,
        isUpcoming: false,
        isPast: false,
      }
    } else if (nowMin < startMin) {
      const until = startMin - nowMin
      if (until < 60) {
        return {
          statusText: `Starts in ${until} min${until === 1 ? '' : 's'}`,
          isCurrent: false,
          isUpcoming: true,
          isPast: false,
        }
      }
      const hrs = Math.floor(until / 60)
      const mins = until % 60
      return {
        statusText: `Starts in ${hrs}h ${mins}m`,
        isCurrent: false,
        isUpcoming: true,
        isPast: false,
      }
    } else {
      return {
        statusText: 'Completed today',
        isCurrent: false,
        isUpcoming: false,
        isPast: true,
      }
    }
  } else {
    const targetDate = new Date(`${dateStr}T00:00:00`)
    const nowDate = new Date(`${todayIso}T00:00:00`)
    const diffDays = Math.round((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays > 0) {
      return {
        statusText: diffDays === 1 ? 'Scheduled for tomorrow' : `Scheduled in ${diffDays} days`,
        isCurrent: false,
        isUpcoming: true,
        isPast: false,
      }
    } else {
      return {
        statusText: 'Past reservation',
        isCurrent: false,
        isUpcoming: false,
        isPast: true,
      }
    }
  }
}

export const isCourtSlotOverlapping = (
  date1: string,
  startTime1: string,
  endTime1: string,
  date2: string,
  startTime2: string,
  endTime2: string
): boolean => {
  if (date1 !== date2) return false
  const s1 = parseTimeToMinutes(startTime1)
  const e1 = endTime1 ? parseTimeToMinutes(endTime1) : s1 + 60
  const s2 = parseTimeToMinutes(startTime2)
  const e2 = endTime2 ? parseTimeToMinutes(endTime2) : s2 + 60
  return s1 < e2 && s2 < e1
}
