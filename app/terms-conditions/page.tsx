import type { Metadata } from 'next'
import LegalPage, {
  LegalSectionBlock,
  LegalList,
  LegalContact,
} from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Terms & Conditions | ROL-EMS × REBAR',
  description:
    'Terms and conditions governing the use of the ROL-EMS REBAR Resort & Sports Complex website and its reservations.',
}

export default function TermsConditionsPage() {
  return (
    <LegalPage
      title="Terms &amp; Conditions"
      updated="October 12, 2026"
      intro={
        <>
          These Terms &amp; Conditions govern your use of the ROL-EMS REBAR Resort &amp; Sports
          Complex website and the booking of our facilities. By using this website or completing a
          reservation, you agree to these terms. If you do not agree, please do not use our
          services.
        </>
      }
    >
      <LegalSectionBlock heading="1. About our services">
        <p>
          ROL-EMS REBAR Resort &amp; Sports Complex offers sports facilities (pickleball, badminton,
          taekwondo), cottage and event spaces, and related services located in Magallanes, Agusan
          del Norte, Philippines. Services offered on this website include:
        </p>
        <LegalList
          items={[
            <>Court and training-floor reservations (pickleball, badminton, taekwondo).</>,
            <>Cottage stays and event/venue reservations.</>,
            <>Open-play sessions and paddle rentals.</>,
            <>Tournament registration.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="2. Bookings and reservations">
        <LegalList
          items={[
            <>A booking is confirmed once we receive your reservation and, where applicable, your payment or a pay-at-counter arrangement.</>,
            <>You are responsible for providing accurate booking information. We may cancel reservations that contain incorrect or fraudulent details.</>,
            <>Facility status (available, reserved, occupied) shown on the site reflects the best available information and may change at any time.</>,
            <>Availability, rates, and add-ons are subject to change without prior notice.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="3. Payments">
        <LegalList
          items={[
            <>Prices are quoted in Philippine Pesos (PHP) and may include applicable taxes unless stated otherwise.</>,
            <>Online payments are processed by <strong>PayMongo</strong> and are accepted via GCash only. Payment terms are also governed by PayMongo&apos;s terms.</>,
            <>&quot;Pay at Counter&quot; bookings are held based on the availability policy described in our Refund Policy and may be released if not honored.</>,
            <>We do not store your card details. You may receive a receipt by email after a completed online payment.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="4. Cancellations and refunds">
        <p>
          Cancellation and refund eligibility depends on the facility and the nature of your
          booking. Please review our{' '}
          <a className="text-[#1E5336] underline" href="/refund-policy">Refund Policy</a> before
          completing a reservation.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="5. Conduct on site">
        <LegalList
          items={[
            <>Follow the rules and instructions of resort staff and comply with posted safety guidelines.</>,
            <>Refrain from behavior that harms other guests, staff, or property.</>,
            <>Use equipment properly; you are responsible for damage to rented equipment caused by improper use.</>,
            <>Respect queuing rules for open play and tournaments.</>,
          ]}
        />
        <p>
          We reserve the right to refuse or remove service to anyone who violates these conduct
          rules, without refund, where warranted.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="6. Intellectual property">
        <p>
          All content on this website — including text, logos, and images — is the property of
          ROL-EMS REBAR Resort &amp; Sports Complex or its licensors and is protected by intellectual
          property law. You may not reproduce, distribute, or use our content without prior
          written permission.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="7. Availability and liability">
        <p>
          We make reasonable efforts to keep the website accurate and available, but we do not
          guarantee that it will always be error-free or uninterrupted. To the maximum extent
          permitted by law, we are not liable for indirect or consequential losses arising from
          your use of the website or our services. Nothing in these terms limits liability that
          cannot be limited by law.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="8. Changes to these terms">
        <p>
          We may update these Terms &amp; Conditions from time to time. The latest version will always
          be posted on this page, with the revision date shown at the top.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="9. Governing law">
        <p>
          These terms are governed by the laws of the Republic of the Philippines. Any disputes
          shall be subject to the exclusive jurisdiction of the courts of Agusan del Norte,
          Philippines.
        </p>
      </LegalSectionBlock>

      <LegalContact />
    </LegalPage>
  )
}