import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { login } from '../../services/authService'

export default function CustomerLogin() {
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
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-white/5 shadow-2xl ring-1 ring-white/10 md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-[#0b1022] via-[#070A12] to-[#1a0b08] p-10 text-white md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-slate-950">
              G
            </div>
            <div className="mt-6 text-2xl font-bold">Grand Hotel</div>
            <div className="mt-2 text-sm text-white/70">เข้าสู่ระบบเพื่อจองห้องพักและตรวจสอบสถานะการจอง</div>

            <div className="mt-10 space-y-3">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm font-semibold">จองได้เร็ว</div>
                <div className="mt-1 text-xs text-white/70">เลือกห้องและช่วงวันที่ได้ในไม่กี่ขั้นตอน</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-sm font-semibold">ปลอดภัย</div>
                <div className="mt-1 text-xs text-white/70">ข้อมูลถูกปกป้องด้วยระบบยืนยันตัวตน</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="text-sm font-semibold text-white">เข้าสู่ระบบ (ลูกค้า)</div>
            <div className="mt-1 text-xs text-white/60">กรอกอีเมลและรหัสผ่านเพื่อดำเนินการต่อ</div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-white/70">อีเมล</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@email.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/20 placeholder:text-white/40 focus:ring-4"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70">รหัสผ่าน</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-orange-500/20 placeholder:text-white/40 focus:ring-4"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-200 ring-1 ring-rose-500/20">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-70"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>

              <div className="pt-2 text-center text-xs text-white/60">
                <Link to="/" className="font-semibold text-white/80 hover:text-white">
                  กลับไปหน้า Home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
