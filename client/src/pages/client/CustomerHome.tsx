import {
  AirVent,
  Car,
  ConciergeBell,
  Crown,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getRooms } from '../../services/roomService'
import type { Room } from '../../types/room'
import { formatCurrencyTHB } from '../../utils/format'

export default function CustomerHome() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)

  const features = [
    { title: 'Wi‑Fi ฟรี', desc: 'อินเทอร์เน็ตความเร็วสูงทุกพื้นที่', icon: Wifi },
    { title: 'เครื่องปรับอากาศ', desc: 'เย็นสบายตลอดวัน', icon: AirVent },
    { title: 'ที่จอดรถ', desc: 'รองรับรถยนต์และมอเตอร์ไซค์', icon: Car },
    { title: 'ทำเลดี', desc: 'ใกล้สถานที่สำคัญ เดินทางสะดวก', icon: MapPin },
    { title: 'ความปลอดภัย', desc: 'ระบบรักษาความปลอดภัย 24 ชม.', icon: ShieldCheck },
    { title: 'บริการเยี่ยม', desc: 'ทีมงานพร้อมดูแลตลอดการเข้าพัก', icon: ConciergeBell },
  ] as const

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoadingRooms(true)
        const data = await getRooms()
        if (!cancelled) setRooms(data)
      } catch {
        if (!cancelled) {
          setRooms([
            { id: 1, room_number: '101', room_type: 'deluxe', floor: 1, capacity_adults: 2, capacity_children: 1, base_price: 1200, status: 'available', description: 'Deluxe Room with city view', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 2, room_number: '202', room_type: 'suite', floor: 2, capacity_adults: 2, capacity_children: 2, base_price: 2200, status: 'available', description: 'Suite Room with premium amenities', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: 3, room_number: '305', room_type: 'standard', floor: 3, capacity_adults: 2, capacity_children: 0, base_price: 900, status: 'available', description: 'Standard Room for a cozy stay', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ])
        }
      } finally {
        if (!cancelled) setLoadingRooms(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const featuredRooms = useMemo(() => {
    const available = rooms.filter((r) => r.status === 'available')
    return (available.length ? available : rooms).slice(0, 6)
  }, [rooms])

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/20">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Grand Hotel</div>
              <div className="text-xs text-slate-500">Luxury stays, seamless booking</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/login" className="hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] sm:inline-flex">
              สำหรับพนักงาน
            </Link>
            <Link to="/booking-status" className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06]">
              เช็คสถานะการจอง
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-slow" />
          <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-purple-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              ยินดีต้อนรับสู่ประสบการณ์การเข้าพักระดับพรีเมียม
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
              พักผ่อนอย่างหรูหรา
              <br />
              <span className="gradient-text">ในราคาที่คุ้มค่า</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-400 sm:text-base leading-relaxed">
              เลือกห้องที่เหมาะกับคุณ พร้อมสิ่งอำนวยความสะดวกครบครัน และระบบจองที่รวดเร็ว
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#rooms" className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-indigo-400">
                ดูห้องพักทั้งหมด
              </a>
              <a href="#status" className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 py-3.5 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06]">
                เช็คสถานะการจอง
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Featured Rooms */}
        <section id="rooms" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-white">Featured Rooms</div>
              <div className="mt-1 text-xs text-slate-500">ห้องแนะนำสำหรับการเข้าพัก</div>
            </div>
            <div className="text-xs text-slate-500">{loadingRooms ? 'กำลังโหลด...' : `${featuredRooms.length} ห้อง`}</div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map((r) => (
              <div key={r.id} className="glass-card p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Room {r.room_number}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {r.room_type.toUpperCase()}
                      {r.floor ? ` • ชั้น ${r.floor}` : ''}
                      {` • `}ผู้ใหญ่ {r.capacity_adults}
                      {r.capacity_children ? ` • เด็ก ${r.capacity_children}` : ''}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/25">
                    Available
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-500">เริ่มต้น</div>
                    <div className="mt-1 text-lg font-extrabold text-white">
                      {formatCurrencyTHB(Number(r.base_price))}
                      <span className="ml-1 text-xs font-semibold text-slate-500">/คืน</span>
                    </div>
                  </div>
                  <Link to="/book" className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-indigo-400">
                    จองเลย
                  </Link>
                </div>

                {r.description ? (
                  <div className="mt-4 text-xs text-slate-500 line-clamp-2">{r.description}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mt-16">
          <div className="text-sm font-semibold text-white">Why choose us</div>
          <div className="mt-1 text-xs text-slate-500">สิ่งอำนวยความสะดวกที่คุณจะได้รับ</div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="glass-card p-5 transition-all duration-300 hover:border-white/[0.12]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-cyan-500/15 ring-1 ring-indigo-500/20">
                      <Icon className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{f.title}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{f.desc}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Booking Status Check */}
        <section id="status" className="mt-16 scroll-mt-24">
          <div className="glass-card bg-gradient-to-br from-white/[0.04] to-indigo-500/[0.06] p-7">
            <div className="text-sm font-semibold text-white">เช็คสถานะการจอง</div>
            <div className="mt-1 text-xs text-slate-500">ใส่ Booking Code หรือเบอร์โทร เพื่อค้นหาสถานะการจองของคุณ</div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="กรอก Booking Code หรือเบอร์โทร"
                />
              </div>
              <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-indigo-400">
                ตรวจสอบ
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-8 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Grand Hotel</div>
          <div className="hidden items-center gap-2 sm:flex">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Luxury stay at best price
          </div>
        </div>
      </footer>
    </div>
  )
}
