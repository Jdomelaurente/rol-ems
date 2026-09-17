'use client'

import { useMemo } from 'react'
import ChartCanvas, { chartColors, chartLegend, chartTooltip, commonScale } from '@/components/admin/Chart'
import type { Paddle, Reservation } from '@/lib/data'

const iso = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function lastNDays(n: number): { label: string; date: string }[] {
  const out: { label: string; date: string }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), date: iso(d) })
  }
  return out
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col border border-[#222222]/15 bg-[#FDFBF7] p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-[#222222]/10 pb-3">
        <h2 className="font-serif text-lg text-[#1E5336]">{title}</h2>
        {note && <span className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">{note}</span>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function DashboardCharts({
  reservations,
  paddles,
}: {
  reservations: Reservation[]
  paddles: Paddle[]
}) {
  const trend = useMemo(() => {
    const days = lastNDays(30)
    const bookings = days.map((d) => reservations.filter((r) => r.date === d.date).length)
    const revenue = days.map((d) =>
      reservations.filter((r) => r.date === d.date && r.paymentStatus === 'paid').reduce((s, r) => s + r.total, 0)
    )
    return {
      labels: days.map((d) => d.label),
      bookings,
      revenue,
      hasData: reservations.length > 0,
    }
  }, [reservations])

  const payment = useMemo(() => {
    const paid = reservations.filter((r) => r.paymentStatus === 'paid').length
    const pending = reservations.filter((r) => r.paymentStatus === 'pending').length
    const cancelled = reservations.filter((r) => r.paymentStatus === 'cancelled').length
    return { paid, pending, cancelled, total: reservations.length }
  }, [reservations])

  const courts = useMemo(() => {
    const map = new Map<string, number>()
    reservations.forEach((r) => map.set(r.court, (map.get(r.court) || 0) + 1))
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
    return { labels: sorted.map(([c]) => c), counts: sorted.map(([, n]) => n) }
  }, [reservations])

  const paddleStatus = useMemo(() => {
    const order = ['Available', 'Rented', 'Reserved', 'Under Maintenance', 'Unavailable']
    const labels = order.filter((s) => paddles.some((p) => p.availability === s))
    const counts = labels.map((s) => paddles.filter((p) => p.availability === s).length)
    return { labels, counts }
  }, [paddles])

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: chartLegend, tooltip: chartTooltip },
    scales: {
      x: { ...commonScale, grid: { display: false } },
      y: { ...commonScale, position: 'left' as const, ticks: { ...commonScale.ticks, maxTicksLimit: 6 } },
      y1: { ...commonScale, position: 'right' as const, grid: { display: false }, ticks: { ...commonScale.ticks, maxTicksLimit: 4 } },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: { legend: chartLegend, tooltip: chartTooltip },
  }

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: chartTooltip },
    scales: {
      x: { ...commonScale, beginAtZero: true, ticks: { ...commonScale.ticks, precision: 0 } },
      y: { ...commonScale, grid: { display: false } },
    },
  }

  const trendData = {
    labels: trend.labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Revenue (₱)',
        data: trend.revenue,
        backgroundColor: chartColors.gold,
        borderRadius: 2,
        barPercentage: 0.55,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Bookings',
        data: trend.bookings,
        borderColor: chartColors.green,
        backgroundColor: 'rgba(30,83,54,0.08)',
        borderWidth: 2,
        pointRadius: 2,
        pointBackgroundColor: chartColors.green,
        tension: 0.35,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  }

  const paymentData = {
    labels: ['Paid', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [payment.paid, payment.pending, payment.cancelled],
        backgroundColor: [chartColors.emerald, chartColors.gold, chartColors.red],
        borderColor: chartColors.cream,
        borderWidth: 2,
      },
    ],
  }

  const courtData = {
    labels: courts.labels,
    datasets: [
      {
        data: courts.counts,
        backgroundColor: chartColors.green,
        borderRadius: 2,
        barPercentage: 0.6,
      },
    ],
  }

  const paddleData = {
    labels: paddleStatus.labels,
    datasets: [
      {
        data: paddleStatus.counts,
        backgroundColor: [
          chartColors.emerald,
          chartColors.gold,
          chartColors.green,
          chartColors.slate,
          chartColors.red,
        ],
        borderColor: chartColors.cream,
        borderWidth: 2,
      },
    ],
  }

  const isEmpty = reservations.length === 0

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ChartCard title="Bookings & Revenue" note="Last 30 days">
          <div className="h-72 lg:h-80">
            {isEmpty ? (
              <EmptyState text="No bookings yet — reservations will appear here." />
            ) : (
              <ChartCanvas type="bar" data={trendData as never} options={trendOptions as never} />
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Payments" note={`${payment.total} total`}>
        <div className="h-72 lg:h-80">
          {isEmpty ? (
            <EmptyState text="No payments recorded yet." />
          ) : payment.total === 0 ? (
            <EmptyState text="No reservations yet." />
          ) : null}
          {!isEmpty && payment.total > 0 && (
            <ChartCanvas type="doughnut" data={paymentData as never} options={doughnutOptions as never} />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Court Usage" note="By reservation">
        <div className="h-64 lg:h-72">
          {courts.labels.length === 0 ? (
            <EmptyState text="No court reservations yet." />
          ) : (
            <ChartCanvas type="bar" data={courtData as never} options={barOptions as never} />
          )}
        </div>
      </ChartCard>

      <ChartCard title="Paddles by Status" note={`${paddles.length} total`}>
        <div className="h-64 lg:h-72">
          {paddleStatus.labels.length === 0 ? (
            <EmptyState text="No paddles in inventory." />
          ) : (
            <ChartCanvas type="doughnut" data={paddleData as never} options={doughnutOptions as never} />
          )}
        </div>
      </ChartCard>

      <ChartCard title="At a glance" note="Quick reference">
        <div className="grid h-full grid-cols-2 gap-3">
          <MiniStat label="Courts" value="3" sub="all operational" />
          <MiniStat label="Paddles" value={`${paddles.length}`} sub="in inventory" />
          <MiniStat label="Paid reservations" value={`${payment.paid}`} sub="confirmed revenue" />
          <MiniStat label="Pending action" value={`${payment.pending}`} sub="needs verification" />
        </div>
      </ChartCard>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="max-w-[200px] text-center text-xs leading-5 text-[#6B756B]">{text}</p>
    </div>
  )
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-col justify-between border border-[#222222]/12 bg-[#F3F0EC]/50 p-4">
      <p className="text-[9px] uppercase tracking-[0.14em] text-[#6B756B]">{label}</p>
      <p className="mt-2 font-serif text-2xl text-[#1E5336]">{value}</p>
      <p className="mt-1 text-[10px] text-[#6B756B]">{sub}</p>
    </div>
  )
}