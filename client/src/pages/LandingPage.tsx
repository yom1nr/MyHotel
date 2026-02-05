import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500" />
      <div className="absolute inset-0 opacity-25">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="rounded-3xl bg-white/10 p-8 text-center text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-xl sm:p-12">
            <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">ระบบจองห้องพักโรงแรม</div>
            <div className="mt-3 text-sm text-white/90 sm:text-base">เลือกโหมดการใช้งาน</div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                to="/staff/login"
                className="rounded-2xl bg-white px-6 py-5 text-center text-sm font-semibold text-orange-600 shadow-sm ring-1 ring-white/30 transition hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                เข้าสู่ระบบสำหรับพนักงาน
              </Link>

              <Link
                to="/home"
                className="rounded-2xl bg-slate-900/25 px-6 py-5 text-center text-sm font-semibold text-white shadow-sm ring-1 ring-white/40 transition hover:bg-slate-900/35 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                จองห้องพัก (สำหรับลูกค้า)
              </Link>
            </div>

            <div className="mt-8 text-xs text-white/70">
              Hotel Booking System
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
