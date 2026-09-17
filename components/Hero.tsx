'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSiteContent } from '@/context/SiteContentContext'
import { lines } from '@/lib/site-content'

export default function Hero() {
  const { content } = useSiteContent()
  const { hero } = content
  const headingLines = lines(hero.heading)

  return (
    <section id="top" className="relative w-full min-h-[560px] overflow-hidden bg-[#1E5336] text-[#FDFBF7] sm:min-h-[640px] md:min-h-[720px] lg:min-h-[820px]">
      <div
        className="absolute inset-[-4%] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(18,44,30,.88),rgba(18,44,30,.28)),linear-gradient(0deg,rgba(18,44,30,.72),transparent 60%),url('${hero.image}')`,
        }}
      />
      <div className="relative mx-auto flex max-w-[1440px] min-h-[560px] flex-col justify-between px-4 py-6 sm:min-h-[640px] sm:px-6 sm:py-8 md:min-h-[720px] md:px-10 md:py-10 lg:min-h-[820px] lg:px-16 lg:py-14">
        <div className="flex justify-between text-[8px] uppercase tracking-[0.22em] text-[#FDFBF7]/80 sm:text-[10px]">
          <span>{hero.eyebrowLeft}</span>
          <span className="hidden sm:block">{hero.eyebrowRight}</span>
        </div>
        <div className="max-w-3xl">
          <h1 className="max-w-2xl font-serif text-4xl leading-[0.9] tracking-[-0.065em] sm:text-6xl md:text-8xl lg:text-[9.5rem]">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-sm text-xs leading-5 text-[#FDFBF7]/85 sm:mt-8 sm:text-sm sm:leading-6 md:text-base">
            {hero.subtext}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3">
            <a href={hero.primaryCtaHref} className="border border-[#FDFBF7]/70 px-5 py-3 text-[10px] uppercase tracking-[0.16em] hover:border-[#E1A728] hover:bg-[#E1A728] hover:text-[#1E5336] sm:text-[11px]">
              {hero.primaryCtaLabel} <ArrowUpRight size={15} className="ml-2 inline" />
            </a>
            <a href={hero.secondaryCtaHref} className="px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7]/80 hover:text-[#E1A728] sm:text-[11px]">
              {hero.secondaryCtaLabel} <ArrowUpRight size={15} className="ml-2 inline" />
            </a>
          </div>
        </div>
        <div id="escape" className="flex flex-col gap-3 border-t border-[#FDFBF7]/30 pt-4 text-[9px] uppercase tracking-[0.16em] sm:flex-row sm:justify-between sm:gap-5 sm:text-[10px]">
          <span className="text-[#E1A728]">{hero.footerLeft}</span>
          <span className="text-[#FDFBF7]/75">{hero.footerRight}</span>
        </div>
      </div>
    </section>
  )
}
