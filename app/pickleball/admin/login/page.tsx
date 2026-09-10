'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, LayoutDashboard, Loader2, ShieldCheck } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/pickleball/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      router.replace(next)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F0EC] text-[#222222] flex flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6B756B] hover:text-[#1E5336] mb-10">
        <ArrowLeft size={14} /> Back to ROL-EMS
      </Link>

      <div className="w-full max-w-md border border-[#222222]/15 bg-[#FDFBF7] p-8 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center bg-[#1E5336] text-[#FDFBF7] mb-4">
          <LayoutDashboard size={20} />
        </div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#E1A728]">Staff Access</p>
        <h1 className="mt-1 font-serif text-3xl text-[#1E5336]">Admin Login</h1>
        <p className="mt-2 text-sm text-[#6B756B]">
          Sign in to manage courts, reservations, open play, paddles, and tournaments.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B]" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full border border-[#222222]/20 bg-white px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-[#6B756B]" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-[#222222]/20 bg-white px-3 py-3 text-sm outline-none focus:border-[#1E5336]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-[#1E5336] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#FDFBF7] transition hover:bg-[#153d27] disabled:cursor-not-allowed disabled:bg-[#222222]/20 disabled:text-[#6B756B]"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-[11px] leading-4 text-[#6B756B]">
          First run? The default account is <strong>admin</strong> / <strong>admin</strong>. Change it after your first sign-in.
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}