import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../services/authService'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-[#071a35] to-[#06122a] p-10 text-white md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-slate-950">
              H
            </div>
            <div className="mt-6 text-2xl font-bold">Hotel Management</div>
            <div className="mt-2 text-sm text-white/70">
              Sign in to manage rooms, bookings, staff, and reports.
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xl font-bold text-orange-200">50+</div>
                <div className="mt-1 text-xs text-white/70">ห้องพัก</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xl font-bold text-orange-200">1000+</div>
                <div className="mt-1 text-xs text-white/70">ลูกค้า</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xl font-bold text-orange-200">24/7</div>
                <div className="mt-1 text-xs text-white/70">บริการ</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="text-sm font-semibold text-slate-900">ยินดีต้อนรับกลับ</div>
            <div className="mt-1 text-xs text-slate-500">
              เข้าสู่ระบบเพื่อจัดการโรงแรม
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hotel.com"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-orange-500/20 placeholder:text-slate-400 focus:ring-4"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-orange-500/20 placeholder:text-slate-400 focus:ring-4"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 ring-1 ring-rose-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 hover:bg-orange-400 disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                หากยังไม่มีบัญชี ให้สร้างผู้ใช้ในตาราง <span className="font-semibold">users</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
