import type { Metadata } from 'next'
import LegalPage, {
  LegalSectionBlock,
  LegalList,
  LegalContact,
} from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Cookies Policy | ROL-EMS × REBAR',
  description:
    'How ROL-EMS REBAR Resort & Sports Complex uses cookies and browser storage on its website.',
}

export default function CookiesPolicyPage() {
  return (
    <LegalPage
      title="Cookies Policy"
      updated="October 12, 2026"
      intro={
        <>
          This Cookies Policy explains how ROL-EMS REBAR Resort &amp; Sports Complex uses cookies and
          browser storage on <em>rolems.ph</em>. In short: <strong>we do not use tracking cookies</strong> for
          advertising, and we only store what is necessary for the site to work.
        </>
      }
    >
      <LegalSectionBlock heading="What are cookies?">
        <p>
          Cookies are small text files placed on your device by a website. They can be &quot;persistent&quot;
          (they stay until they expire or are deleted) or &quot;session&quot; (they are deleted when you close
          your browser). Cookies are commonly used to remember preferences and track usage.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Cookies we use">
        <p>
          This website does <strong>not</strong> set advertising, targeting, or third-party tracking
          cookies. We do not use cookies for profiling or to follow you across other websites.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Browser storage (localStorage)">
        <p>
          To provide a working booking experience, we store small amounts of data in your
          browser&apos;s <strong>localStorage</strong>. This is not a cookie and is not sent to advertisers.
          Data we store includes:
        </p>
        <LegalList
          items={[
            <><strong>Cookie-preferences</strong> — records your consent choice so we don&apos;t ask again.</>,
            <><strong>Payment-session reference</strong> — a temporary identifier used after payment to confirm your booking and email your receipt.</>,
            <><strong>Pickleball module state</strong> — the bookings, open-play sessions, paddle rentals, and tournament data you enter while using our pickleball features.</>,
          ]}
        />
        <p>
          You can clear this data at any time through your browser settings. Clearing it may reset
          in-progress bookings or queue entries.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Analytics">
        <p>
          We use <strong>Vercel Analytics</strong> to understand how the website is used (for example, which
          pages are visited and device types). Vercel Analytics is <strong>cookieless</strong> and does not
          identify you personally. It does not collect information that can be used to track you
          across other websites.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Third-party services">
        <p>When you use certain parts of the site, your browser may interact with third-party services:</p>
        <LegalList
          items={[
            <><strong>PayMongo</strong> — the secure payment page shown when you pay online, and the GCash app you use to confirm the payment. PayMongo&apos;s and GCash&apos;s own cookie and privacy policies apply on their pages.</>,
          ]}
        />
        <p>
          If we add other third-party embeds (such as map or video widgets) in the future, we will
          update this policy before doing so.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Managing your preferences">
        <p>
          When you first visit the site, you can choose to accept or decline non-essential storage
          through our consent banner. Because we rely on localStorage (not cookies), you can also
          manage or delete it at any time in your browser&apos;s settings:
        </p>
        <LegalList
          items={[
            <><strong>Accept all</strong> — allow necessary site functionality and cookieless analytics.</>,
            <><strong>Essential only</strong> — limit storage to what the booking flow requires.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Changes to this policy">
        <p>
          We may update this Cookies Policy as our website changes. The latest revision date is
          shown at the top of this page.
        </p>
      </LegalSectionBlock>

      <LegalContact />
    </LegalPage>
  )
}