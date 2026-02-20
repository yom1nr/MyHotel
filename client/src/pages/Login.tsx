import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login } from '../services/authService'
import Button from '../components/ui/Button'
import HotelLogo from '../components/HotelLogo'

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
    <div className="relative min-h-screen overflow-hidden bg-navy-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/8 blur-3xl animate-pulse-slow" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl md:grid-cols-2">
          {/* Left panel */}
          <div className="hidden p-10 text-white md:flex md:flex-col md:justify-between" style={{ background: 'linear-gradient(135deg, #0c1222 0%, #131b35 50%, #0f1628 100%)' }}>
            <div>
              <HotelLogo size={48} className="rounded-xl shadow-lg shadow-indigo-500/20" />
              <div className="mt-8 text-2xl font-bold">
                <span className="gradient-text">Hotel Brunelleschi</span>
              </div>
              <div className="mt-3 text-sm text-slate-400 leading-relaxed">
                Sign in to manage rooms, bookings, staff, and reports.
              </div>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { value: '50+', label: 'ห้องพัก' },
                { value: '1000+', label: 'ลูกค้า' },
                { value: '24/7', label: 'บริการ' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="text-xl font-bold text-indigo-300">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - form */}
          <div className="bg-navy-800 p-6 sm:p-10">
            <div className="text-base font-semibold text-white">ยินดีต้อนรับกลับ</div>
            <div className="mt-1 text-sm text-slate-400">เข้าสู่ระบบเพื่อจัดการโรงแรม</div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hotel.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                  {error}
                </div>
              ) : null}

              <Button type="submit" loading={loading} className="w-full py-3">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="pt-2 text-center text-xs text-slate-500">
                หากยังไม่มีบัญชี ให้สร้างผู้ใช้ในตาราง <span className="font-semibold text-slate-400">users</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
