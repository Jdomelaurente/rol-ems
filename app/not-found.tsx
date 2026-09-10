import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F3F0EC] text-[#222222]">
      <header className="border-b border-[#222222]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <a href="/" className="font-serif text-lg tracking-[-0.05em] text-[#1E5336]">
            ROL-EMS <span className="font-sans text-xs tracking-[0.2em] text-[#E1A728]">×</span> REBAR
          </a>
          <a
            href="/"
            className="border-b border-[#1E5336] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5336]"
          >
            Back to home
          </a>
        </div>
      </header>

      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center lg:py-32">
        <Link
          href="/"
          className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]"
        >
        
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Error 404</p>
        <h1 className="mt-4 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-5xl md:text-6xl">
          This page could not be found.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-6 text-[#6B756B]">
          The page you are looking for may have been moved, renamed, or does not exist. Head back home to keep playing, relaxing, and exploring.
        </p>
        <Link
          href="/"
          className="mt-8 bg-[#1E5336] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#FDFBF7] transition hover:bg-[#153d27]"
        >
          Return home
        </Link>
      </section>
    </main>
  )
}