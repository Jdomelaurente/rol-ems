import { ArrowUpRight } from 'lucide-react'

export default function PoolHouse() {
  return (
    <section data-reveal className="reveal w-full px-6 py-16 sm:py-24 lg:px-10 lg:py-36">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_.9fr]">
        <div
          data-parallax
          className="parallax-media min-h-[320px] sm:min-h-[440px] lg:min-h-[540px] bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85')" }}
        />
        <div className="flex flex-col justify-between py-4">
          <div>
          <p className="mb-5 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Leisure</p>
          <h2 className="font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-5xl md:text-7xl">
            The long way<br />around.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-6 text-[#6B756B] sm:mt-8">Sun on the water, cold drinks close by, and not a single rush. This is the leisure side of ROL-EMS — the part that lets you breathe.</p>
          </div>
          <a href="#facilities" className="mt-10 inline-flex items-center gap-3 self-start border-b border-[#1E5336] pb-2 text-[10px] uppercase tracking-[0.16em] text-[#1E5336] sm:mt-16">
            See the pool house <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}
