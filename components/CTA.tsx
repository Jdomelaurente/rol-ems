'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSiteContent } from '@/context/SiteContentContext'
import { lines } from '@/lib/site-content'

export default function CTA() {
  const { content } = useSiteContent()
  const { cta } = content
  const headingLines = lines(cta.heading)

  return (
    <section data-reveal className="reveal w-full px-6 py-16 text-center sm:py-24 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">{cta.eyebrow}</p>
        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[0.95] tracking-[-0.055em] text-[#1E5336] sm:text-5xl md:text-8xl">
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h2>
        <a href={cta.buttonHref} className="mt-10 inline-flex items-center gap-3 border border-[#1E5336] px-6 py-4 text-[10px] uppercase tracking-[0.16em] text-[#1E5336]">
          {cta.buttonLabel} <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
  )
}
