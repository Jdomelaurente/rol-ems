'use client'

import React from 'react'
import { Sparkles, Users } from 'lucide-react'

interface PickleballCourtIllustrationProps {
  courtName: string
  status: 'available' | 'occupied' | 'reserved' | 'open-play' | 'maintenance'
  currentBookingName?: string
  scheduledTime?: string
  playerNames?: string[]
}

export default function PickleballCourtIllustration({
  courtName,
  status,
  currentBookingName,
  scheduledTime,
  playerNames = [],
}: PickleballCourtIllustrationProps) {
  const isAvailable = status === 'available'
  const isOccupied = status === 'occupied'
  const isReserved = status === 'reserved'
  const isOpenPlay = status === 'open-play'

  // Colors based on pickleball championship courts
  const apronColor = isAvailable ? '#0E2E1E' : isOccupied ? '#2E1114' : isReserved ? '#261F0E' : '#101B2B'
  const serviceCourtColor = isAvailable ? '#1D4B36' : isOccupied ? '#3B181E' : isReserved ? '#3A2E16' : '#1C314E'
  const kitchenColor = isAvailable ? '#153D2A' : isOccupied ? '#2D1217' : isReserved ? '#2C220E' : '#14253B'
  const lineColor = '#FFFFFF'

  // Derived players to show on court
  const displayPlayers =
    playerNames.length > 0
      ? playerNames.slice(0, 4)
      : currentBookingName
      ? currentBookingName.includes('&')
        ? currentBookingName.split('&').map((s) => s.trim())
        : [currentBookingName]
      : []

  return (
    <div className="relative w-full aspect-[200/320] max-h-[300px] overflow-hidden rounded-none shadow-inner select-none transition-all duration-300 group">
      <svg
        viewBox="0 0 200 440"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Net Mesh Pattern */}
          <pattern id={`net-mesh-${courtName.replace(/\s+/g, '')}`} width="6" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
            <line x1="0" y1="4" x2="6" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>

          {/* Pickleball holes pattern */}
          <radialGradient id="ballGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="60%" stopColor="#E1A728" />
            <stop offset="100%" stopColor="#B37D0B" />
          </radialGradient>
        </defs>

        {/* 1. Out-of-bounds Apron */}
        <rect x="0" y="0" width="200" height="440" rx="8" fill={apronColor} />

        {/* 2. Full Playing Area (20ft x 44ft = 160 x 400) */}
        {/* Top Service Courts (y: 20 to 150) */}
        <rect x="20" y="20" width="160" height="130" fill={serviceCourtColor} />
        {/* The Kitchen / Non-Volley Zone (y: 150 to 290) */}
        <rect x="20" y="150" width="160" height="140" fill={kitchenColor} />
        {/* Bottom Service Courts (y: 290 to 420) */}
        <rect x="20" y="290" width="160" height="130" fill={serviceCourtColor} />

        {/* 3. Court Lines (Crisp Regulation White) */}
        {/* Outer Boundary (Sidelines & Baselines) */}
        <rect
          x="20"
          y="20"
          width="160"
          height="400"
          fill="none"
          stroke={lineColor}
          strokeWidth="3"
        />

        {/* Top Kitchen Line (Non-Volley Line: 7ft from net) */}
        <line x1="20" y1="150" x2="180" y2="150" stroke={lineColor} strokeWidth="3" />

        {/* Bottom Kitchen Line (Non-Volley Line: 7ft from net) */}
        <line x1="20" y1="290" x2="180" y2="290" stroke={lineColor} strokeWidth="3" />

        {/* Top Centerline (divides left & right service court) */}
        <line x1="100" y1="20" x2="100" y2="150" stroke={lineColor} strokeWidth="2.5" />

        {/* Bottom Centerline (divides left & right service court) */}
        <line x1="100" y1="290" x2="100" y2="420" stroke={lineColor} strokeWidth="2.5" />

        {/* 4. Subtle Court Markings / Watermarks */}
        <text
          x="60"
          y="85"
          fill="#FFFFFF"
          fillOpacity="0.15"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
        >
          LEFT COURT
        </text>
        <text
          x="140"
          y="85"
          fill="#FFFFFF"
          fillOpacity="0.15"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
        >
          RIGHT COURT
        </text>

        <text
          x="100"
          y="185"
          fill="#FFFFFF"
          fillOpacity="0.25"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="3"
        >
          KITCHEN · NVZ
        </text>
        <text
          x="100"
          y="255"
          fill="#FFFFFF"
          fillOpacity="0.25"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="3"
        >
          7 FT ZONE
        </text>

        <text
          x="60"
          y="360"
          fill="#FFFFFF"
          fillOpacity="0.15"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
        >
          RIGHT COURT
        </text>
        <text
          x="140"
          y="360"
          fill="#FFFFFF"
          fillOpacity="0.15"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
        >
          LEFT COURT
        </text>

        {/* 5. Center Net with Mesh & Hardware Posts */}
        {/* Net mesh band */}
        <rect
          x="14"
          y="216"
          width="172"
          height="8"
          fill={`url(#net-mesh-${courtName.replace(/\s+/g, '')})`}
        />
        {/* Net top white cable/tape */}
        <line x1="14" y1="220" x2="186" y2="220" stroke="#FFFFFF" strokeWidth="3" />
        <line x1="14" y1="218" x2="186" y2="218" stroke="#D1D5DB" strokeWidth="1" />
        {/* Net posts */}
        <circle cx="14" cy="220" r="4.5" fill="#111827" stroke="#E5E7EB" strokeWidth="1" />
        <circle cx="186" cy="220" r="4.5" fill="#111827" stroke="#E5E7EB" strokeWidth="1" />
        {/* Center Net Strap (White) */}
        <rect x="98" y="214" width="4" height="12" rx="1" fill="#FFFFFF" stroke="#9CA3AF" strokeWidth="0.5" />

        {/* 6. Dynamic State Indicators on Court */}
        {/* AVAILABLE: Pristine Court with glowing center ball */}
        {isAvailable && (
          <g className="animate-pulse">
            {/* Center court pickleball */}
            <circle cx="100" cy="220" r="9" fill="url(#ballGrad)" stroke="#B37D0B" strokeWidth="1" />
            {/* Pickleball holes */}
            <circle cx="97" cy="217" r="1.2" fill="#8C6105" />
            <circle cx="103" cy="217" r="1.2" fill="#8C6105" />
            <circle cx="95" cy="221" r="1.2" fill="#8C6105" />
            <circle cx="100" cy="221" r="1.2" fill="#8C6105" />
            <circle cx="105" cy="221" r="1.2" fill="#8C6105" />
            <circle cx="97" cy="225" r="1.2" fill="#8C6105" />
            <circle cx="103" cy="225" r="1.2" fill="#8C6105" />
          </g>
        )}

        {/* OCCUPIED / LIVE MATCH: Players positioned on the court */}
        {isOccupied && (
          <g>
            {/* Top Team Players (Kitchen Line Dinking Position) */}
            <g>
              <circle cx="65" cy="135" r="11" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <text x="65" y="139" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                {displayPlayers[0]?.charAt(0) || 'P1'}
              </text>
            </g>
            <g>
              <circle cx="135" cy="135" r="11" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
              <text x="135" y="139" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                {displayPlayers[1]?.charAt(0) || 'P2'}
              </text>
            </g>

            {/* Bottom Team Players (Kitchen Line / Baseline Position) */}
            <g>
              <circle cx="65" cy="305" r="11" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <text x="65" y="309" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                {displayPlayers[2]?.charAt(0) || 'P3'}
              </text>
            </g>
            <g>
              <circle cx="135" cy="305" r="11" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <text x="135" y="309" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
                {displayPlayers[3]?.charAt(0) || 'P4'}
              </text>
            </g>

            {/* In-play pickleball near kitchen */}
            <circle cx="85" cy="195" r="5" fill="url(#ballGrad)" stroke="#B37D0B" strokeWidth="0.8" />
          </g>
        )}

        {/* RESERVED: Players on deck / warm-up */}
        {isReserved && (
          <g>
            <g>
              <circle cx="65" cy="70" r="10" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="65" y="74" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                {displayPlayers[0]?.charAt(0) || 'R1'}
              </text>
            </g>
            <g>
              <circle cx="135" cy="70" r="10" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x="135" y="74" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">
                {displayPlayers[1]?.charAt(0) || 'R2'}
              </text>
            </g>
          </g>
        )}

        {/* OPEN PLAY: Social rotation icon */}
        {isOpenPlay && (
          <g>
            <circle cx="60" cy="110" r="9" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="140" cy="110" r="9" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="60" cy="330" r="9" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="140" cy="330" r="9" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}
      </svg>

      {/* Floating Status Glass Badge Over Court */}
      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white drop-shadow-md bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-none">
          {courtName}
        </span>

        {isAvailable && (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#A7F3D0] bg-[#064E3B]/80 backdrop-blur-xs px-2 py-0.5 rounded-none border border-[#10B981]/40 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-ping" />
            Open Now
          </span>
        )}

        {isOccupied && (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#FECDD3] bg-[#881337]/90 backdrop-blur-xs px-2 py-0.5 rounded-none border border-[#F43F5E]/40 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
            Live In Play
          </span>
        )}

        {isReserved && (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#FEF08A] bg-[#713F12]/85 backdrop-blur-xs px-2 py-0.5 rounded-none border border-[#EAB308]/40 shadow-xs">
            Reserved
          </span>
        )}

        {isOpenPlay && (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.12em] font-bold text-[#BFDBFE] bg-[#1E3A8A]/85 backdrop-blur-xs px-2 py-0.5 rounded-none border border-[#3B82F6]/40 shadow-xs">
            Open Play
          </span>
        )}
      </div>

      {/* Bottom Court Center Info Overlay */}
      <div className="absolute bottom-2 inset-x-2 pointer-events-none">
        {isAvailable ? (
          <div className="text-center bg-black/40 backdrop-blur-xs py-1 px-2 rounded-none border border-white/10">
            <p className="text-[10px] font-bold text-white tracking-[0.1em]">Ready for Play</p>
            <p className="text-[8px] text-[#A7F3D0]">₱350 / hour · Instant Booking</p>
          </div>
        ) : (
          <div className="text-center bg-black/60 backdrop-blur-xs py-1 px-2 rounded-none border border-white/10">
            <p className="text-[10px] font-bold text-white truncate">
              {currentBookingName || 'Active Session'}
            </p>
            {scheduledTime && (
              <p className="text-[8px] text-[#FEF08A]">{scheduledTime}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
