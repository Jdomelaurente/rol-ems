'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePickleball } from '@/context/PickleballContext'
import { ListOrdered, Users2, Swords, Trophy } from 'lucide-react'

export type TournamentTabKey = 'queue' | 'pairs' | 'mini-matches' | 'tournaments'

interface TournamentTabsProps {
  currentTab?: TournamentTabKey
}

export default function TournamentTabs({ currentTab }: TournamentTabsProps) {
  const pathname = usePathname()
  const { aiQueuePlayers, miniMatches, tournaments } = usePickleball()

  const waitingCount = aiQueuePlayers.filter((p) => p.status === 'waiting' || !p.status).length
  const pairsCount = new Set(aiQueuePlayers.filter((p) => p.pairNumber).map((p) => p.pairNumber)).size
  const liveMatchesCount = miniMatches.filter((m) => m.status === 'live' || m.status === 'upcoming').length
  const activeTournamentsCount = tournaments.filter((t) => t.published).length

  const tabs = [
    {
      id: 'queue' as const,
      label: 'Pickle Queue',
      href: '/pickleball/tournament/queue',
      altHrefs: ['/pickleball/tournaments/queue'],
      icon: ListOrdered,
      count: aiQueuePlayers.length,
      badgeLabel: `${waitingCount} waiting`,
    },
    {
      id: 'pairs' as const,
      label: 'Pairs Management',
      href: '/pickleball/tournament/pairs',
      altHrefs: ['/pickleball/tournaments/pairs'],
      icon: Users2,
      count: pairsCount,
      badgeLabel: `${pairsCount} pairs`,
    },
    {
      id: 'mini-matches' as const,
      label: 'Mini Matches',
      href: '/pickleball/tournament/mini-matches',
      altHrefs: ['/pickleball/tournaments/mini-matches'],
      icon: Swords,
      count: miniMatches.length,
      badgeLabel: `${liveMatchesCount} active`,
    },
    {
      id: 'tournaments' as const,
      label: 'Tournament Management',
      href: '/pickleball/tournaments',
      altHrefs: ['/pickleball/tournament'],
      icon: Trophy,
      count: activeTournamentsCount,
      badgeLabel: `${activeTournamentsCount} events`,
    },
  ]

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (currentTab) return currentTab === tab.id
    if (pathname === tab.href) return true
    if (tab.altHrefs?.some((alt) => pathname === alt || pathname.startsWith(alt))) return true
    if (tab.id === 'tournaments' && (pathname === '/pickleball/tournaments' || pathname === '/pickleball/tournament')) return true
    return false
  }

  return (
    <div className="border-b border-[#222222]/10 bg-[#FDFBF7] shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between py-2 border-b border-[#222222]/5">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#1E5336] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5336]">
              Tournament & Match Hub
            </span>
          </div>
          <span className="text-[10px] text-[#6B756B] font-semibold">
            {aiQueuePlayers.length} in Queue · {liveMatchesCount} Live Matches
          </span>
        </div>

        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tournament Submenu">
          {tabs.map((tab) => {
            const active = isTabActive(tab)
            const Icon = tab.icon

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`group flex shrink-0 items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all rounded-md ${
                  active
                    ? 'bg-[#1E5336] text-[#FDFBF7] shadow-sm'
                    : 'text-[#6B756B] hover:bg-[#1E5336]/10 hover:text-[#1E5336]'
                }`}
              >
                <Icon size={15} className={active ? 'text-[#E1A728]' : 'text-[#6B756B] group-hover:text-[#1E5336]'} />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 text-[9px] rounded font-mono font-bold ${
                    active
                      ? 'bg-white/20 text-[#FDFBF7]'
                      : 'bg-[#222222]/10 text-[#6B756B] group-hover:bg-[#1E5336]/20 group-hover:text-[#1E5336]'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
