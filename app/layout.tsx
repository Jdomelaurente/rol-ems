import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PickleballProvider } from '@/context/PickleballContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'ROL-EMS × REBAR | Where Sport, Leisure & Adventure Come Together',
  description: 'Play by the hour, relax by the water, and explore everything in between at ROL-EMS Resort and Rebar Sports Center — cottages, courts, open play, and more.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#FDFBF7]">
      <body className="antialiased">
        <PickleballProvider>
          {children}
        </PickleballProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
