'use client'

import { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler, BarController, LineController, DoughnutController } from 'chart.js'
import type { ChartData, ChartType } from 'chart.js'

ChartJS.register(
  BarController,
  LineController,
  DoughnutController,
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
)

ChartJS.defaults.font.family = "'Inter', -apple-system, 'Segoe UI', sans-serif"
ChartJS.defaults.font.size = 11
ChartJS.defaults.color = '#6B756B'

export const chartColors = {
  green: '#1E5336',
  greenSoft: '#0f3a25',
  gold: '#E1A728',
  cream: '#FDFBF7',
  grey: '#6B756B',
  emerald: '#047857',
  amber: '#B45309',
  red: '#B91C1C',
  slate: '#334155',
}

export const chartTooltip = {
  backgroundColor: '#222222',
  titleColor: '#FDFBF7',
  bodyColor: '#FDFBF7',
  padding: 10,
  cornerRadius: 0,
  boxPadding: 4,
  titleFont: { family: 'Inter', size: 12, weight: 700 as const },
  bodyFont: { family: 'Inter', size: 11 },
} as const

export const chartLegend = {
  position: 'bottom' as const,
  labels: {
    usePointStyle: true,
    pointStyle: 'circle' as const,
    boxWidth: 7,
    boxHeight: 7,
    padding: 14,
    color: '#6B756B',
  },
}

const commonScale = {
  grid: { color: 'rgba(34,34,34,0.08)' },
  border: { display: false },
  ticks: { color: '#6B756B' },
}

export default function ChartCanvas({
  type,
  data,
  options,
}: {
  type: ChartType
  data: ChartData
  options?: Record<string, unknown>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartRef.current = new ChartJS(canvasRef.current, { type, data, options } as any)
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const c = chartRef.current
    if (!c) return
    c.data = data as never
    if (options) c.options = options as never
    c.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, options])

  return <canvas ref={canvasRef} />
}

export { commonScale }