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
    try { setLoading(true); setError(null); await login({ email, password }); navigate('/', { replace: true }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Sign in failed') }
    finally { setLoading(false) }
  }

  const inputCls = 'mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl backdrop-blur md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-navy-800 via-navy-900 to-navy-800 p-10 text-white md:block">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-bold text-white">G</div>
            <div className="mt-6 text-2xl font-bold">Grand Hotel</div>
            <div className="mt-2 text-sm text-slate-400">เข้าสู่ระบบเพื่อจองห้องพักและตรวจสอบสถานะการจอง</div>
            <div className="mt-10 space-y-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-sm font-semibold">จองได้เร็ว</div>
                <div className="mt-1 text-xs text-slate-500">เลือกห้องและช่วงวันที่ได้ในไม่กี่ขั้นตอน</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="text-sm font-semibold">ปลอดภัย</div>
                <div className="mt-1 text-xs text-slate-500">ข้อมูลถูกปกป้องด้วยระบบยืนยันตัวตน</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="text-sm font-semibold text-white">เข้าสู่ระบบ (ลูกค้า)</div>
            <div className="mt-1 text-xs text-slate-500">กรอกอีเมลและรหัสผ่านเพื่อดำเนินการต่อ</div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400">อีเมล</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" className={inputCls} required />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">รหัสผ่าน</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} required />
              </div>
              {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div> : null}
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:opacity-70">
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
              <div className="pt-2 text-center text-xs text-slate-500">
                <Link to="/" className="font-semibold text-slate-300 transition hover:text-white">กลับไปหน้า Home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
