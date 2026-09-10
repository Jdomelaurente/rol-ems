import Link from 'next/link'
import type { ReactNode } from 'react'

export type LegalSection = {
  heading: string
  body: ReactNode
}

type LegalPage = {
  title: string
  updated: string
  intro: ReactNode
  children: ReactNode
}

export default function LegalPage({ title, updated, intro, children }: LegalPage) {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-6 py-16 text-[#222222] sm:py-24 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#E1A728] transition hover:text-[#1E5336]"
        >
          ← Back to home
        </Link>
        <h1 className="mt-8 font-serif text-4xl leading-[0.95] tracking-[-0.05em] text-[#1E5336] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[#6B756B]">
          Last updated: {updated}
        </p>
        <div className="mt-6 text-sm leading-6 text-[#6B756B]">{intro}</div>
        <div className="mt-12 space-y-12 border-t border-[#222222]/10 pt-12">{children}</div>
      </div>
    </main>
  )
}

export function LegalHeading({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl leading-tight text-[#1E5336]">{children}</h2>
}

export function LegalBody({ children }: { children: ReactNode }) {
  return <div className="mt-4 space-y-4 text-sm leading-6 text-[#6B756B]">{children}</div>
}

export function LegalSectionBlock({
  heading,
  children,
}: {
  heading: ReactNode
  children: ReactNode
}) {
  return (
    <section>
      <LegalHeading>{heading}</LegalHeading>
      <LegalBody>{children}</LegalBody>
    </section>
  )
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}

export function LegalContact() {
  return (
    <LegalSectionBlock heading="Contact">
      <p>ROL-EMS REBAR Resort &amp; Sports Complex</p>
      <p>[Legal entity name] · [Registered owner]</p>
      <p>
        2GQC+QMF, Cuenca Ave St, Magallanes, Agusan del Norte, Philippines
      </p>
      <p>
        Email: <a className="text-[#1E5336] underline" href="mailto:hello@rolems.ph">hello@rolems.ph</a>
      </p>
      <p>[Contact number], if provided</p>
    </LegalSectionBlock>
  )
}