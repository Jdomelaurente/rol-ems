import type { Metadata } from 'next'
import LegalPage, {
  LegalSectionBlock,
  LegalList,
  LegalContact,
} from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | ROL-EMS × REBAR',
  description:
    'How ROL-EMS REBAR Resort & Sports Complex collects, uses, and protects your personal data, in line with the Philippine Data Privacy Act (RA 10173).',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 12, 2026"
      intro={
        <>
          This Privacy Policy explains how <strong>ROL-EMS REBAR Resort &amp; Sports
          Complex</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects
          your personal information when you use our website <em>rolems.ph</em> and book our
          facilities. We are committed to protecting your privacy and processing personal data
          in accordance with the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong> and its
          implementing rules and regulations.
        </>
      }
    >
      <LegalSectionBlock heading="Information we collect">
        <p>We only collect information that is necessary to provide our services. When you book or inquire, we may collect:</p>
        <LegalList
          items={[
            <>Your <strong>full name</strong> and <strong>contact number</strong> so we can confirm and manage your reservation.</>,
            <>Your <strong>email address</strong>, required only when you choose to pay online so we can send your booking confirmation and official receipt.</>,
            <>Details of your <strong>booking</strong> (facility, date, time, number of guests, selected add-ons, and payment method).</>,
            <>Tournament or open-play <strong>participant names</strong> for events that require registration.</>,
          ]}
        />
        <p>
          We do <strong>not</strong> collect or store your credit card details. Online payments are
          processed by our payment partner <strong>PayMongo</strong> on their secure hosted checkout page.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="How we use your information">
        <LegalList
          items={[
            <>To process, confirm, and manage your bookings and reservations.</>,
            <>To send booking confirmations, receipts, and changes by email.</>,
            <>To respond to your inquiries and provide customer support.</>,
            <>To manage the live queue, open-play sessions, and tournament rosters you join.</>,
            <>To comply with legal and regulatory obligations, including record-keeping requirements.</>,
          ]}
        />
        <p>We do not sell, rent, or trade your personal information to third parties.</p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Legal basis for processing">
        <p>
          Under RA 10173, we process your personal data on the following bases: (a) your{' '}
          <strong>consent</strong> given through our booking forms and cookie notice; (b) the{' '}
          <strong>performance of a contract</strong> we have with you (your booking); and (c){' '}
          <strong>legitimate interests</strong> such as preventing fraud and maintaining our records.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Information we share">
        <LegalList
          items={[
            <>
              <strong>PayMongo</strong> — for payment processing (name, contact, and email required to create a checkout session). Payment details are handled by PayMongo under their own privacy policy.
            </>,
            <>
              <strong>Email delivery providers</strong> (SMTP) — limited to sending you receipts and booking confirmations.
            </>,
            <>
              <strong>Vercel Analytics</strong> — aggregate, cookieless web analytics that help us understand how the site is used. This does not identify you personally.
            </>,
            <>
              <strong>Government or law enforcement</strong>, only as required by Philippine law.
            </>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Data stored on your device">
        <p>
          Our site does not use tracking cookies. To make your booking experience work, we store
          limited information in your browser&apos;s <strong>localStorage</strong>, including a temporary
          payment-session identifier and, if you use our pickleball modules, the booking,
          open-play, and tournament data you submit. This data stays on your device and is never
          used for advertising.
        </p>
        <p>See our <a className="text-[#1E5336] underline" href="/cookies-policy">Cookies Policy</a> for details.</p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Data retention">
        <p>
          We keep booking and payment records only as long as necessary for the purposes described
          above and to meet Philippine tax and accounting requirements. When data is no longer
          needed, we delete or anonymize it in a secure manner.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Your rights under RA 10173">
        <p>Under the Philippine Data Privacy Act, you have the right to:</p>
        <LegalList
          items={[
            <><strong>Access</strong> the personal data we hold about you.</>,
            <><strong>Rectify</strong> inaccurate or incomplete data.</>,
            <><strong>Erase</strong> or block your personal data when unlawful or no longer necessary.</>,
            <><strong>Object</strong> to processing, and <strong>withdraw consent</strong> at any time, without affecting the lawfulness of processing done before withdrawal.</>,
            <><strong>Portability</strong> of your data to another organization where technically feasible.</>,
            <>Be informed of and <strong>damages</strong> for unlawful, unauthorized, or improper processing.</>,
          ]}
        />
        <p>
          To exercise any of these rights, contact us at the details below. We will respond within
          the period required by law. If you believe your data privacy rights have been violated,
          you may file a complaint with the <strong>National Privacy Commission</strong> (NPC) at
          complaints@privacy.gov.ph.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Security">
        <p>
          We take reasonable technical and organizational measures to protect your personal data
          against loss, misuse, and unauthorized access, including encrypted connections (HTTPS),
          restricted access to our systems, and secure storage of payment-adjacent information.
          No method of transmission over the Internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Children&apos;s privacy">
        <p>
          Our services are directed to adults. We do not knowingly collect personal information
          from children without parental consent. If you believe a child has provided us personal
          data, please contact us and we will take steps to remove it.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The date of the latest revision is
          shown at the top of this page. Material changes will be posted on this page, and where
          required by law, we will ask for your consent again.
        </p>
      </LegalSectionBlock>

      <LegalContact />
    </LegalPage>
  )
}