import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bookingsOverlap, isActiveBooking } from '@/lib/booking-overlap'

const toMinutes = (timeLabel: string): number | null => {
  const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  const ap = (m[3] || '').toUpperCase()
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return h * 60 + min
}

const labelFromMinutes = (total: number): string => {
  let h = Math.floor(total / 60)
  const min = total % 60
  const ap = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${h}:${String(min).padStart(2, '0')} ${ap}`
}

export async function GET(req: NextRequest) {
  const facility = req.nextUrl.searchParams.get('facility')
  const date = req.nextUrl.searchParams.get('date')
  const nightsParam = req.nextUrl.searchParams.get('nights')

  if (!facility || !date) {
    return NextResponse.json({ times: [] })
  }

  const nights = nightsParam ? Math.max(1, parseInt(nightsParam, 10) || 1) : 1
  const wanted = { date, nights }

  try {
    const bookings = await prisma.booking.findMany({
      where: { facility, status: { in: ['pending', 'confirmed'] } },
      select: { date: true, time: true, hours: true, nights: true, status: true, createdAt: true },
    })

    const booked = bookings.filter((b) => isActiveBooking(b) && bookingsOverlap(wanted, b))

    const takenTimes = new Set<string>()
    for (const b of booked) {
      const startMin = toMinutes(b.time)
      const spanHours = b.hours && b.hours > 0 ? b.hours : 1
      if (startMin !== null) {
        for (let k = 0; k < spanHours; k++) {
          takenTimes.add(labelFromMinutes(startMin + k * 60))
        }
      } else {
        takenTimes.add(b.time)
      }
    }

    return NextResponse.json({ times: Array.from(takenTimes) })
  } catch (err) {
    console.error('Booked times error:', err)
    return NextResponse.json({ times: [] })
  }
}