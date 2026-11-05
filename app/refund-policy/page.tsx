import type { Metadata } from 'next'
import LegalPage, {
  LegalSectionBlock,
  LegalList,
  LegalContact,
} from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Refund Policy | ROL-EMS × REBAR',
  description:
    'Refund and cancellation policy for court reservations, cottage stays, events, and payments at ROL-EMS REBAR Resort & Sports Complex.',
}

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="October 12, 2026"
      intro={
        <>
          This Refund Policy explains how cancellations and refunds are handled for bookings made
          through <em>rolems.ph</em> and on-site at ROL-EMS REBAR Resort &amp; Sports Complex. Refunds
          are issued to the original payment method used at checkout, where applicable.
        </>
      }
    >
      <LegalSectionBlock heading="Online payments (PayMongo)">
        <LegalList
          items={[
            <>Refunds for online payments (GCash via PayMongo) are processed back to the original GCash account through PayMongo. Processing may take 3–10 business days.</>,
            <>To request a refund, contact us within the applicable window below with your booking reference number.</>,
            <>We will confirm the refund decision by email at the address used for the booking.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Court & training-floor reservations">
        <LegalList
          items={[
            <><strong>Free cancellation &amp; full refund</strong> if you cancel at least <strong>24 hours</strong> before the reserved start time.</>,
            <><strong>50% refund</strong> for cancellations made between 24 and 12 hours before the reserved start time.</>,
            <><strong>No refund</strong> for cancellations made less than 12 hours before the reserved start time, or for no-shows.</>,
            <>You may <strong>reschedule</strong> a reservation once, subject to availability, at no charge if requested at least 24 hours in advance.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Cottage stays">
        <LegalList
          items={[
            <><strong>Free cancellation</strong> up to <strong>48 hours</strong> before check-in for a full refund (excluding any payment-processing fees).</>,
            <><strong>50% refund</strong> for cancellations within 48 to 24 hours before check-in.</>,
            <><strong>No refund</strong> for cancellations less than 24 hours before check-in or for early checkout.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Events and whole-area venues">
        <p>
          Events and whole-area reservations are handled case-by-case due to preparation and venue
          exclusivity. A <strong>deposit or down payment</strong> may be required to confirm the date.
        </p>
        <LegalList
          items={[
            <><strong>Full refund of down payment</strong> if the event is cancelled more than <strong>14 days</strong> in advance.</>,
            <><strong>50% refund of down payment</strong> for cancellations 7–14 days before the event.</>,
            <><strong>No refund</strong> for cancellations less than 7 days before the event, except for documented force majeure circumstances.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Open play & paddle rentals">
        <LegalList
          items={[
            <>Open-play and paddle-rental fees are generally <strong>non-refundable</strong> once the session has started.</>,
            <>If we cancel a session we&apos;ve scheduled (for example, due to maintenance), you receive a <strong>full refund or credit</strong>.</>,
            <>Rental deposits are returned after the equipment is returned in the same condition, subject to inspection.</>,
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock heading="Pay-at-counter bookings">
        <p>
          Bookings marked &quot;Pay at Counter&quot; are held provisionally. If payment is not made at the
          counter within the agreed time, the reservation may be released and no charge is applied.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="Force majeure">
        <p>
          If we are forced to cancel or interrupt a booking because of natural disasters, weather,
          government orders, power outages, or other events beyond our reasonable control, we will
          offer a full refund or a credit for a future booking.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock heading="How to request a refund">
        <p>
          Email us at <a className="text-[#1E5336] underline" href="mailto:hello@rolems.ph">hello@rolems.ph</a>{' '}
          with your booking reference, facility, and preferred date/time. We aim to respond within
          3 business days.
        </p>
      </LegalSectionBlock>

      <LegalContact />
    </LegalPage>
  )
}