'use client'

import Link from 'next/link'

type ConsentCheckboxProps = {
  id: string
  agreed: boolean
  onChange: (agreed: boolean) => void
}

export default function ConsentCheckbox({ id, agreed, onChange }: ConsentCheckboxProps) {
  return (
    <label htmlFor={id} className="mt-6 flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={agreed}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#1E5336]"
      />
      <span className="text-xs leading-5 text-[#6B756B]">
        I agree to the <Link href="/terms-conditions" className="text-[#1E5336] underline">Terms &amp; Conditions</Link>{' '}
        and consent to my name, contact number, and email being collected and processed to complete
        this reservation, as described in the{' '}
        <Link href="/privacy-policy" className="text-[#1E5336] underline">Privacy Policy</Link>.
      </span>
    </label>
  )
}