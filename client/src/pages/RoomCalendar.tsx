import { useEffect, useMemo, useState } from 'react'

import type { Booking, BookingStatus } from '../types/booking'
import type { Room } from '../types/room'
import { getBookings } from '../services/bookingService'
import { getRooms } from '../services/roomService'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addMonths(d: Date, delta: number) { return new Date(d.getFullYear(), d.getMonth() + delta, 1) }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }
function dateOnly(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }

function overlapsMonth(checkIn: string, checkOut: string, monthStart: Date, monthEnd: Date) {
  const inDate = dateOnly(new Date(checkIn))
  const outDate = dateOnly(new Date(checkOut))
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return false
  const lastNight = new Date(outDate); lastNight.setDate(lastNight.getDate() - 1)
  return inDate <= monthEnd && lastNight >= monthStart
}

function bookingColor(status: BookingStatus) {
  if (status === 'confirmed') return 'bg-emerald-500'
  if (status === 'checked_in') return 'bg-indigo-500'
  if (status === 'checked_out') return 'bg-slate-500'
  if (status === 'cancelled') return 'bg-rose-500'
  return 'bg-amber-500'
}

export default function RoomCalendar() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const monthStart = useMemo(() => startOfMonth(month), [month])
  const monthEnd = useMemo(() => new Date(monthStart.getFullYear(), monthStart.getMonth(), daysInMonth(monthStart)), [monthStart])
  const totalDays = useMemo(() => daysInMonth(monthStart), [monthStart])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const [r, b] = await Promise.all([getRooms(), getBookings()]); if (!cancelled) { setRooms(r); setBookings(b) } }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load calendar data') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredBookings = useMemo(() => bookings.filter((b) => overlapsMonth(b.check_in_date, b.check_out_date, monthStart, monthEnd)), [bookings, monthEnd, monthStart])
  const bookingsByRoom = useMemo(() => {
    const map = new Map<number, Booking[]>()
    for (const b of filteredBookings) { const l = map.get(b.room_id) || []; l.push(b); map.set(b.room_id, l) }
    return map
  }, [filteredBookings])

  const days = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays])
  const monthLabel = useMemo(() => new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(monthStart), [monthStart])

  const leftColWidth = 92
  const cellWidth = 34
  const cellHeight = 44

  return (
    <div className="animate-fade-in">
      <PageHeader title="Room Calendar" subtitle="Gantt Chart style" actions={
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => setMonth((m) => addMonths(m, -1))}>Prev</Button>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white">{monthLabel}</div>
          <Button size="sm" variant="secondary" onClick={() => setMonth((m) => addMonths(m, 1))}>Next</Button>
        </div>
      } />

      {loading ? (
        <Card className="mt-6 space-y-3"><Skeleton height="h-4" width="w-32" /><Skeleton height="h-64" /></Card>
      ) : error ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : null}

      <Card className="mt-6 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: leftColWidth + totalDays * cellWidth }}>
            <div className="sticky top-0 z-20 flex border-b border-white/[0.06] bg-navy-800">
              <div className="sticky left-0 z-30 flex items-center bg-navy-800 px-3 text-xs font-semibold text-slate-400" style={{ width: leftColWidth, height: 40 }}>Room</div>
              <div className="flex">
                {days.map((d) => (
                  <div key={d} className="flex items-center justify-center border-l border-white/[0.04] text-[11px] font-medium text-slate-500" style={{ width: cellWidth, height: 40 }}>{d}</div>
                ))}
              </div>
            </div>

            <div>
              {rooms.slice().sort((a, b) => String(a.room_number).localeCompare(String(b.room_number))).map((room) => {
                const roomBookings = bookingsByRoom.get(room.id) || []
                return (
                  <div key={room.id} className="flex border-b border-white/[0.04] last:border-b-0">
                    <div className="sticky left-0 z-10 flex items-center border-r border-white/[0.06] bg-navy-800 px-3 text-xs font-semibold text-white" style={{ width: leftColWidth, height: cellHeight }}>{room.room_number}</div>
                    <div className="relative" style={{ width: totalDays * cellWidth, height: cellHeight }}>
                      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, ${cellWidth}px)` }}>
                        {days.map((d) => <div key={d} className="border-l border-white/[0.03]" />)}
                      </div>
                      {roomBookings.map((b) => {
                        const inDate = dateOnly(new Date(b.check_in_date)); const outDate = dateOnly(new Date(b.check_out_date))
                        const lastNight = new Date(outDate); lastNight.setDate(lastNight.getDate() - 1)
                        const startDay = clamp(inDate.getFullYear() === monthStart.getFullYear() && inDate.getMonth() === monthStart.getMonth() ? inDate.getDate() : 1, 1, totalDays)
                        const endDay = clamp(lastNight.getFullYear() === monthStart.getFullYear() && lastNight.getMonth() === monthStart.getMonth() ? lastNight.getDate() : totalDays, 1, totalDays)
                        if (endDay < startDay) return null
                        const left = (startDay - 1) * cellWidth + 2; const width = (endDay - startDay + 1) * cellWidth - 4
                        return (
                          <div key={b.id} title={`${b.guest_full_name} (${b.status})`} className={'absolute top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-white shadow-sm ' + bookingColor(b.status)} style={{ left, width, height: 26 }}>
                            <div className="truncate">{b.guest_full_name}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-500" /> Confirmed</div>
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-indigo-500" /> Checked In</div>
        <div className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-slate-500" /> Checked Out</div>
      </div>
    </div>
  )
}
