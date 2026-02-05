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
            {
              id: 1,
              room_number: '101',
              room_type: 'deluxe',
              floor: 1,
              capacity_adults: 2,
              capacity_children: 1,
              base_price: 1200,
              status: 'available',
              description: 'Deluxe Room with city view',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 2,
              room_number: '202',
              room_type: 'suite',
              floor: 2,
              capacity_adults: 2,
              capacity_children: 2,
              base_price: 2200,
              status: 'available',
              description: 'Suite Room with premium amenities',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 3,
              room_number: '305',
              room_type: 'standard',
              floor: 3,
              capacity_adults: 2,
              capacity_children: 0,
              base_price: 900,
              status: 'available',
              description: 'Standard Room for a cozy stay',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
        }
      } finally {
        if (!cancelled) setLoadingRooms(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const featuredRooms = useMemo(() => {
    const available = rooms.filter((r) => r.status === 'available')
    return (available.length ? available : rooms).slice(0, 6)
  }, [rooms])

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-slate-950">
              <Crown className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Grand Hotel</div>
              <div className="text-xs text-white/60">Luxury stays, seamless booking</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 sm:inline-flex"
            >
              สำหรับพนักงาน
            </Link>
            <Link
              to="/booking-status"
              className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              เช็คสถานะการจอง
            </Link>
            <a
              href="#rooms"
              className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              ดูห้องพักทั้งหมด
            </a>
            <a
              href="#status"
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
            >
              เช็คสถานะการจอง
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1022] via-[#070A12] to-[#1a0b08]" />
        <div className="absolute inset-0 opacity-35">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
          <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4" />
              ยินดีต้อนรับสู่ประสบการณ์การเข้าพักระดับพรีเมียม
            </div>

            <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
              พักผ่อนอย่างหรูหรา ในราคาที่คุ้มค่า
            </h1>
            <p className="mt-4 text-sm text-white/70 sm:text-base">
              เลือกห้องที่เหมาะกับคุณ พร้อมสิ่งอำนวยความสะดวกครบครัน และระบบจองที่รวดเร็ว
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#rooms"
                className="rounded-2xl bg-orange-500 px-6 py-4 text-center text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
              >
                ดูห้องพักทั้งหมด
              </a>
              <a
                href="#status"
                className="rounded-2xl bg-white/5 px-6 py-4 text-center text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/10"
              >
                เช็คสถานะการจอง
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <section id="rooms" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-sm font-semibold">Featured Rooms</div>
              <div className="mt-1 text-xs text-white/60">ห้องแนะนำสำหรับการเข้าพัก</div>
            </div>
            <div className="text-xs text-white/50">{loadingRooms ? 'กำลังโหลด...' : `${featuredRooms.length} ห้อง`}</div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredRooms.map((r) => (
              <div key={r.id} className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">Room {r.room_number}</div>
                    <div className="mt-1 text-xs text-white/60">
                      {r.room_type.toUpperCase()}
                      {r.floor ? ` • ชั้น ${r.floor}` : ''}
                      {` • `}
                      ผู้ใหญ่ {r.capacity_adults}
                      {r.capacity_children ? ` • เด็ก ${r.capacity_children}` : ''}
                    </div>
                  </div>
                  <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-orange-500/20">
                    Available
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-white/50">เริ่มต้น</div>
                    <div className="mt-1 text-lg font-extrabold text-white">
                      {formatCurrencyTHB(Number(r.base_price))}
                      <span className="ml-1 text-xs font-semibold text-white/60">/คืน</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-2xl bg-orange-500 px-4 py-3 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
                  >
                    <Link to="/book">จองเลย</Link>
                  </button>
                </div>

                {r.description ? (
                  <div className="mt-4 text-xs text-white/60 line-clamp-2">{r.description}</div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-sm font-semibold">Why choose us</div>
              <div className="mt-1 text-xs text-white/60">สิ่งอำนวยความสะดวกที่คุณจะได้รับ</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 transition hover:bg-white/7"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/20">
                      <Icon className="h-5 w-5 text-orange-200" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{f.title}</div>
                      <div className="mt-0.5 text-xs text-white/60">{f.desc}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id="status" className="mt-12 scroll-mt-24">
          <div className="rounded-3xl bg-gradient-to-br from-white/5 to-orange-500/10 p-7 ring-1 ring-white/10">
            <div className="text-sm font-semibold">เช็คสถานะการจอง</div>
            <div className="mt-1 text-xs text-white/60">
              ใส่ Booking Code หรือเบอร์โทร เพื่อค้นหาสถานะการจองของคุณ
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-2">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/40 focus:ring-4 focus:ring-orange-500/20"
                  placeholder="กรอก Booking Code หรือเบอร์โทร"
                />
              </div>
              <button
                type="button"
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                ตรวจสอบ
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-8 text-xs text-white/50">
          <div>© {new Date().getFullYear()} Grand Hotel</div>
          <div className="hidden items-center gap-2 sm:flex">
            <Sparkles className="h-4 w-4" />
            Luxury stay at best price
          </div>
        </div>
      </footer>
    </div>
  )
}
