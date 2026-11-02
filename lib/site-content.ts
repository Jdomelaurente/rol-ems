import { facilities as defaultFacilities, type Facility } from './data'

export interface HeroContent {
  image: string
  eyebrowLeft: string
  eyebrowRight: string
  heading: string
  subtext: string
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  footerLeft: string
  footerRight: string
}

export interface PoolHouseContent {
  image: string
  eyebrow: string
  heading: string
  paragraph: string
  linkLabel: string
  linkHref: string
}

export interface CtaContent {
  eyebrow: string
  heading: string
  buttonLabel: string
  buttonHref: string
}

export interface FooterContent {
  brand: string
  tagline: string
  address: string
  hours: string
  email: string
  social: string
  directionsLabel: string
  directionsHref: string
  copyright: string
}

export interface SiteContent {
  hero: HeroContent
  poolHouse: PoolHouseContent
  cta: CtaContent
  footer: FooterContent
  facilities: Facility[]
}

export const defaultSiteContent: SiteContent = {
  hero: {
    image: '/Hero-image.jpg',
    eyebrowLeft: '01 — ROL-EMS & REBAR',
    eyebrowRight: 'Magallanes, Agusan del Norte · Philippines',
    heading: 'Where Sport,\nLeisure & Adventure\nCome Together.',
    subtext: 'Three courts, a peaceful retreat, and everything in between — all in one place.',
    primaryCtaLabel: 'Explore the resort',
    primaryCtaHref: '#facilities',
    secondaryCtaLabel: 'Find your game',
    secondaryCtaHref: '#queue',
    footerLeft: 'Sport · Leisure · Adventure',
    footerRight: 'Where every kind of day comes together.',
  },
  poolHouse: {
    image: '/sports-events/poolhouse.jpg',
    eyebrow: 'Leisure',
    heading: 'The long way\naround.',
    paragraph:
      'Sun on the water, cold drinks close by, and not a single rush. This is the leisure side of ROL-EMS — the part that lets you breathe.',
    linkLabel: 'See the pool house',
    linkHref: '#facilities',
  },
  cta: {
    eyebrow: 'Adventure awaits',
    heading: 'Your best day\nstarts with one idea.',
    buttonLabel: 'Plan your visit',
    buttonHref: '/pickleball/booking',
  },
  footer: {
    brand: 'ROL-EMS × REBAR',
    tagline: 'Sport, leisure, and adventure — together in one place.',
    address: '2GQC+QMF, Cuenca Ave St\nMagallanes, Agusan del Norte',
    hours: 'Monday — Sunday\n8:00 AM — 10:00 PM',
    email: 'hello@rolems.ph',
    social: 'Instagram · Facebook',
    directionsLabel: 'Get directions',
    directionsHref: 'https://maps.app.goo.gl/GzR3W2YNsgWKYuKJ9',
    copyright: '© 2026 ROL-EMS x REBAR',
  },
  facilities: defaultFacilities,
}

const text = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback

const section = <T extends object>(value: unknown, fallback: T): T => {
  if (!value || typeof value !== 'object') return fallback
  const source = value as Record<string, unknown>
  const out: Record<string, unknown> = { ...(fallback as Record<string, unknown>) }
  for (const key of Object.keys(fallback)) {
    const fallbackValue = (fallback as Record<string, unknown>)[key]
    if (typeof fallbackValue !== 'string') continue
    const raw = text(source[key], fallbackValue)
    out[key] = key === 'image' && !raw.trim() ? fallbackValue : raw
  }
  return out as unknown as T
}

export function sanitizeSiteContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  const source = partial && typeof partial === 'object' ? partial : {}
  const facilities = Array.isArray(source.facilities)
    ? source.facilities
        .filter((f): f is Facility => !!f && typeof f === 'object' && !!f.title && !!f.establishment)
        .map((f) => {
          const fallbackImage =
            defaultFacilities.find((d) => d.title === f.title)?.image ?? '/sports-events/cottage.jpeg'
          return { ...f, image: typeof f.image === 'string' && f.image.trim() ? f.image : fallbackImage }
        })
    : defaultFacilities

  return {
    hero: section(source.hero, defaultSiteContent.hero),
    poolHouse: section(source.poolHouse, defaultSiteContent.poolHouse),
    cta: section(source.cta, defaultSiteContent.cta),
    footer: section(source.footer, defaultSiteContent.footer),
    facilities: facilities.length > 0 ? facilities : defaultFacilities,
  }
}

export function lines(value: string): string[] {
  return value.split('\n')
}
