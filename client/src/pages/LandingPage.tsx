import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-navy-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-slow" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="glass-card p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
              <span className="gradient-text">ระบบจองห้องพักโรงแรม</span>
            </div>
            <div className="mt-3 text-sm text-slate-400">เลือกโหมดการใช้งาน</div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/staff/login"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-indigo-400"
              >
                เข้าสู่ระบบสำหรับพนักงาน
              </Link>
              <Link
                to="/home"
                className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 py-5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]"
              >
                จองห้องพัก (สำหรับลูกค้า)
              </Link>
            </div>

            <div className="mt-8 text-xs text-slate-500">Hotel Brunelleschi</div>
          </div>
        </div>
      </div>
    </div>
  )
}
