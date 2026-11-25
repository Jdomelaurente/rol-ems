const PAYMONGO_API = 'https://api.paymongo.com/v1'

export type PayMongoMetadata = Record<string, string | number | boolean | null | undefined>

type PayMongoResource<T = Record<string, any>> = {
  id: string
  attributes: T
}

/** True when a real (non-placeholder) secret key is configured. */
export function paymongoConfigured(): boolean {
  const secret = process.env.PAYMONGO_SECRET_KEY
  return !!secret && !secret.includes('your_paymongo_secret_key')
}

/**
 * PayMongo only accepts string values in metadata. Drop empty values and
 * stringify everything else so callers can keep passing numbers naturally.
 */
export function sanitizeMetadata(metadata?: PayMongoMetadata): Record<string, string> {
  if (!metadata) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = String(value)
  }
  return out
}

async function paymongoRequest<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const secret = process.env.PAYMONGO_SECRET_KEY
  if (!secret) throw new Error('PayMongo is not configured')

  const res = await fetch(`${PAYMONGO_API}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
      ...(init.headers || {}),
    },
  })

  const data = await res.json().catch(() => ({} as any))

  if (!res.ok) {
    const detail = data?.errors?.[0]?.detail || `PayMongo request failed (${res.status})`
    const error = new Error(detail) as Error & { status?: number; details?: unknown }
    error.status = res.status
    error.details = data
    throw error
  }

  return data as T
}

export type PaymentIntentResource = PayMongoResource<{
  amount: number
  status: string
  currency: string
  description?: string
  client_key?: string
  metadata?: Record<string, string>
  payment_method_allowed?: string[]
  payments?: PayMongoResource[]
  next_action?: {
    type?: string
    redirect?: { url?: string; return_url?: string }
    code?: { image_url?: string }
  }
  [key: string]: any
}>

export type PaymentMethodResource = PayMongoResource<{
  type: string
  billing?: Record<string, unknown>
  [key: string]: any
}>

export type CheckoutSessionResource = PayMongoResource<{
  amount?: number
  payment_status?: string
  metadata?: Record<string, string>
  payments?: PayMongoResource[]
  billing?: Record<string, any>
  [key: string]: any
}>

export async function createPaymentIntent(input: {
  amount: number // centavos
  method: 'gcash' | 'qrph'
  description: string
  metadata?: PayMongoMetadata
  statementDescriptor?: string
}): Promise<PaymentIntentResource> {
  const data = await paymongoRequest<{ data: PaymentIntentResource }>('/payment_intents', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          amount: input.amount,
          currency: 'PHP',
          payment_method_allowed: [input.method],
          description: input.description,
          statement_descriptor: input.statementDescriptor,
          metadata: sanitizeMetadata(input.metadata),
        },
      },
    }),
  })
  return data.data
}

export async function createPaymentMethod(input: {
  type: 'gcash' | 'qrph'
  billing?: { name?: string; email?: string; phone?: string }
  expirySeconds?: number
}): Promise<PaymentMethodResource> {
  const attributes: Record<string, unknown> = { type: input.type }

  if (input.billing) {
    const billing: Record<string, string> = {}
    if (input.billing.name) billing.name = input.billing.name
    if (input.billing.email) billing.email = input.billing.email
    if (input.billing.phone) billing.phone = input.billing.phone
    if (Object.keys(billing).length > 0) attributes.billing = billing
  }

  if (input.expirySeconds) attributes.expiry_seconds = input.expirySeconds

  const data = await paymongoRequest<{ data: PaymentMethodResource }>('/payment_methods', {
    method: 'POST',
    body: JSON.stringify({ data: { attributes } }),
  })
  return data.data
}

export async function attachPaymentMethod(input: {
  intentId: string
  paymentMethodId: string
  returnUrl?: string
}): Promise<PaymentIntentResource> {
  const data = await paymongoRequest<{ data: PaymentIntentResource }>(
    `/payment_intents/${encodeURIComponent(input.intentId)}/attach`,
    {
      method: 'POST',
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: input.paymentMethodId,
            ...(input.returnUrl ? { return_url: input.returnUrl } : {}),
          },
        },
      }),
    },
  )
  return data.data
}

export async function retrievePaymentIntent(id: string): Promise<PaymentIntentResource> {
  const data = await paymongoRequest<{ data: PaymentIntentResource }>(
    `/payment_intents/${encodeURIComponent(id)}`,
    { method: 'GET' },
  )
  return data.data
}

export async function retrieveCheckoutSession(id: string): Promise<CheckoutSessionResource> {
  const data = await paymongoRequest<{ data: CheckoutSessionResource }>(
    `/checkout_sessions/${encodeURIComponent(id)}`,
    { method: 'GET' },
  )
  return data.data
}

/** Normalise PayMongo method names to the values stored on Booking.paidMethod. */
export function normalizePaidMethod(method?: string): string {
  switch (method) {
    case 'paymaya':
      return 'maya'
    case 'qrph':
    case 'grab_pay':
    case 'shopee_pay':
    case 'gcash':
      return 'gcash'
    case 'card':
    case 'cash':
    case 'bank':
      return method
    default:
      return method || 'gcash'
  }
}
