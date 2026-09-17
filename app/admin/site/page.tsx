'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSiteContent } from '@/context/SiteContentContext'
import type { Facility } from '@/lib/data'
import {
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Home,
  Waves,
  Megaphone,
  Mail,
  LayoutGrid,
} from 'lucide-react'

type Tab = 'hero' | 'poolHouse' | 'cta' | 'footer' | 'facilities'

const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'hero', label: 'Hero', icon: Home },
  { key: 'poolHouse', label: 'Pool House', icon: Waves },
  { key: 'cta', label: 'CTA', icon: Megaphone },
  { key: 'footer', label: 'Footer & Contact', icon: Mail },
  { key: 'facilities', label: 'Facilities', icon: LayoutGrid },
]

const inputClass =
  'mt-1.5 w-full border border-[#222222]/20 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[#1E5336]'

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  textarea?: boolean
  hint?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {hint && <span className="mt-1.5 block text-[10px] text-[#6B756B]/70">{hint}</span>}
    </label>
  )
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <Field label={label} value={value} onChange={onChange} placeholder="/Hero-image.jpg or https://…" />
      {value && (
        <div
          className="mt-2 h-36 w-full border border-[#222222]/15 bg-cover bg-center"
          style={{ backgroundImage: `url(${value})` }}
        />
      )}
    </div>
  )
}

export default function AdminSiteContentPage() {
  const { content, update, resetContent, loaded } = useSiteContent()
  const [tab, setTab] = useState<Tab>('hero')

  const setHero = (patch: Partial<typeof content.hero>) => update('hero', { ...content.hero, ...patch })
  const setPoolHouse = (patch: Partial<typeof content.poolHouse>) =>
    update('poolHouse', { ...content.poolHouse, ...patch })
  const setCta = (patch: Partial<typeof content.cta>) => update('cta', { ...content.cta, ...patch })
  const setFooter = (patch: Partial<typeof content.footer>) =>
    update('footer', { ...content.footer, ...patch })

  const setFacility = (index: number, patch: Partial<Facility>) =>
    update(
      'facilities',
      content.facilities.map((f, i) => (i === index ? { ...f, ...patch } : f))
    )
  const addFacility = () =>
    update('facilities', [
      ...content.facilities,
      {
        establishment: 'ROL-EMS Resort',
        category: 'Play',
        title: 'New facility',
        detail: 'Short description of this facility',
        status: 'Available now',
        image: '/sports-events/cottage.jpeg',
      },
    ])
  const removeFacility = (index: number) =>
    update(
      'facilities',
      content.facilities.filter((_, i) => i !== index)
    )

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] pb-16">
      <section className="bg-[#FDFBF7] border-b border-[#222222]/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#6B756B] hover:text-[#1E5336]"
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#E1A728]">Other</p>
          <h1 className="mt-1 font-serif text-4xl text-[#1E5336]">Site Content</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B756B]">
            Edit the images and messages shown on the public home page. Changes save automatically.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold transition ${
                tab === key
                  ? 'border-[#1E5336] bg-[#1E5336] text-[#FDFBF7]'
                  : 'border-[#222222]/20 bg-[#FDFBF7] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#6B756B]">
            <span className="border border-[#222222]/15 bg-[#FDFBF7] px-3 py-1.5">Home page content</span>
            {loaded && <span className="hidden sm:inline text-[#6B756B]/60">Saved to database</span>}
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset all images and messages to the original defaults?')) resetContent()
            }}
            className="flex items-center gap-2 border border-[#222222]/20 bg-[#FDFBF7] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] hover:border-[#1E5336] hover:text-[#1E5336]"
          >
            <RefreshCw size={13} /> Reset defaults
          </button>
        </div>

        <div className="border border-[#222222]/15 bg-[#FDFBF7] p-6 shadow-sm">
          {tab === 'hero' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <ImageField label="Background image" value={content.hero.image} onChange={(image) => setHero({ image })} />
              </div>
              <Field label="Top-left label" value={content.hero.eyebrowLeft} onChange={(eyebrowLeft) => setHero({ eyebrowLeft })} />
              <Field label="Top-right label" value={content.hero.eyebrowRight} onChange={(eyebrowRight) => setHero({ eyebrowRight })} />
              <div className="lg:col-span-2">
                <Field
                  label="Headline"
                  value={content.hero.heading}
                  onChange={(heading) => setHero({ heading })}
                  textarea
                  hint="Each new line becomes a line break on the page."
                />
              </div>
              <div className="lg:col-span-2">
                <Field label="Sub-text" value={content.hero.subtext} onChange={(subtext) => setHero({ subtext })} textarea />
              </div>
              <Field label="Primary button label" value={content.hero.primaryCtaLabel} onChange={(primaryCtaLabel) => setHero({ primaryCtaLabel })} />
              <Field label="Primary button link" value={content.hero.primaryCtaHref} onChange={(primaryCtaHref) => setHero({ primaryCtaHref })} />
              <Field label="Secondary button label" value={content.hero.secondaryCtaLabel} onChange={(secondaryCtaLabel) => setHero({ secondaryCtaLabel })} />
              <Field label="Secondary button link" value={content.hero.secondaryCtaHref} onChange={(secondaryCtaHref) => setHero({ secondaryCtaHref })} />
              <Field label="Bottom-left tagline" value={content.hero.footerLeft} onChange={(footerLeft) => setHero({ footerLeft })} />
              <Field label="Bottom-right tagline" value={content.hero.footerRight} onChange={(footerRight) => setHero({ footerRight })} />
            </div>
          )}

          {tab === 'poolHouse' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <ImageField label="Image" value={content.poolHouse.image} onChange={(image) => setPoolHouse({ image })} />
              </div>
              <Field label="Eyebrow" value={content.poolHouse.eyebrow} onChange={(eyebrow) => setPoolHouse({ eyebrow })} />
              <Field label="Link label" value={content.poolHouse.linkLabel} onChange={(linkLabel) => setPoolHouse({ linkLabel })} />
              <div className="lg:col-span-2">
                <Field label="Heading" value={content.poolHouse.heading} onChange={(heading) => setPoolHouse({ heading })} textarea hint="Each new line becomes a line break." />
              </div>
              <div className="lg:col-span-2">
                <Field label="Paragraph" value={content.poolHouse.paragraph} onChange={(paragraph) => setPoolHouse({ paragraph })} textarea />
              </div>
              <Field label="Link target" value={content.poolHouse.linkHref} onChange={(linkHref) => setPoolHouse({ linkHref })} />
            </div>
          )}

          {tab === 'cta' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Eyebrow" value={content.cta.eyebrow} onChange={(eyebrow) => setCta({ eyebrow })} />
              <Field label="Button label" value={content.cta.buttonLabel} onChange={(buttonLabel) => setCta({ buttonLabel })} />
              <div className="lg:col-span-2">
                <Field label="Heading" value={content.cta.heading} onChange={(heading) => setCta({ heading })} textarea hint="Each new line becomes a line break." />
              </div>
              <Field label="Button link" value={content.cta.buttonHref} onChange={(buttonHref) => setCta({ buttonHref })} />
            </div>
          )}

          {tab === 'footer' && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Field label="Brand" value={content.footer.brand} onChange={(brand) => setFooter({ brand })} />
              <Field label="Tagline" value={content.footer.tagline} onChange={(tagline) => setFooter({ tagline })} />
              <div className="lg:col-span-2">
                <Field label="Address" value={content.footer.address} onChange={(address) => setFooter({ address })} textarea hint="Each new line becomes a line break." />
              </div>
              <Field label="Hours" value={content.footer.hours} onChange={(hours) => setFooter({ hours })} textarea />
              <Field label="Email" value={content.footer.email} onChange={(email) => setFooter({ email })} />
              <Field label="Social" value={content.footer.social} onChange={(social) => setFooter({ social })} />
              <Field label="Directions label" value={content.footer.directionsLabel} onChange={(directionsLabel) => setFooter({ directionsLabel })} />
              <Field label="Directions link" value={content.footer.directionsHref} onChange={(directionsHref) => setFooter({ directionsHref })} />
              <Field label="Copyright" value={content.footer.copyright} onChange={(copyright) => setFooter({ copyright })} />
            </div>
          )}

          {tab === 'facilities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B756B]">
                  The cards shown in the “Three ways to spend your day” section.
                </p>
                <button
                  onClick={addFacility}
                  className="inline-flex items-center gap-2 bg-[#1E5336] px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] font-bold text-[#FDFBF7] transition hover:bg-[#153d27]"
                >
                  <Plus size={14} /> Add card
                </button>
              </div>

              {content.facilities.map((facility, index) => (
                <div key={index} className="border border-[#222222]/12 bg-[#F3F0EC]/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-serif text-lg text-[#1E5336]">{facility.title || `Card ${index + 1}`}</p>
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove “${facility.title}”?`)) removeFacility(index)
                      }}
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[#6B756B] transition hover:text-red-700"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Title" value={facility.title} onChange={(title) => setFacility(index, { title })} />
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#6B756B]">Establishment</span>
                      <select
                        value={facility.establishment}
                        onChange={(e) =>
                          setFacility(index, { establishment: e.target.value as Facility['establishment'] })
                        }
                        className={inputClass}
                      >
                        <option value="ROL-EMS Resort">ROL-EMS Resort</option>
                        <option value="Rebar Sports Center">Rebar Sports Center</option>
                      </select>
                    </label>
                    <Field label="Category" value={facility.category} onChange={(category) => setFacility(index, { category })} />
                    <Field label="Status" value={facility.status} onChange={(status) => setFacility(index, { status })} />
                    <div className="lg:col-span-2">
                      <Field label="Detail" value={facility.detail} onChange={(detail) => setFacility(index, { detail })} textarea />
                    </div>
                    <div className="lg:col-span-2">
                      <ImageField label="Image" value={facility.image} onChange={(image) => setFacility(index, { image })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
