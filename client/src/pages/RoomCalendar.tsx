import { useEffect, useMemo, useState } from 'react'

import type { Booking, BookingStatus } from '../types/booking'
import type { Room } from '../types/room'
import { getBookings } from '../services/bookingService'
import { getRooms } from '../services/roomService'

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function overlapsMonth(checkIn: string, checkOut: string, monthStart: Date, monthEnd: Date) {
  const inDate = dateOnly(new Date(checkIn))
  const outDate = dateOnly(new Date(checkOut))
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return false

  const lastNight = new Date(outDate)
  lastNight.setDate(lastNight.getDate() - 1)

  return inDate <= monthEnd && lastNight >= monthStart
}

function bookingColor(status: BookingStatus) {
  if (status === 'confirmed') return 'bg-emerald-500'
  if (status === 'checked_in') return 'bg-blue-500'
  if (status === 'checked_out') return 'bg-slate-400'
  if (status === 'cancelled') return 'bg-rose-400'
  return 'bg-amber-400'
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
      try {
        setLoading(true)
        setError(null)
        const [roomData, bookingData] = await Promise.all([getRooms(), getBookings()])
        if (!cancelled) {
          setRooms(roomData)
          setBookings(bookingData)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load calendar data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => overlapsMonth(b.check_in_date, b.check_out_date, monthStart, monthEnd))
  }, [bookings, monthEnd, monthStart])

  const bookingsByRoom = useMemo(() => {
    const map = new Map<number, Booking[]>()
    for (const b of filteredBookings) {
      const list = map.get(b.room_id) || []
      list.push(b)
      map.set(b.room_id, list)
    }
    return map
  }, [filteredBookings])

  const days = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays])

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(monthStart)
  }, [monthStart])

  const leftColWidth = 92
  const cellWidth = 34
  const cellHeight = 44

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Room Calendar</div>
            <div className="mt-1 text-xs text-slate-500">Gantt Chart style</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Prev
            </button>
            <div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200">
              {monthLabel}
            </div>
            <button
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">Loading...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
            <div className="text-sm font-semibold text-rose-700">เกิดข้อผิดพลาด</div>
            <div className="mt-1 text-xs text-slate-600">{error}</div>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <div style={{ minWidth: leftColWidth + totalDays * cellWidth }}>
              <div className="sticky top-0 z-20 flex bg-slate-50">
                <div
                  className="sticky left-0 z-30 flex items-center border-b border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700"
                  style={{ width: leftColWidth, height: 40 }}
                >
                  Room
                </div>
                <div className="flex border-b border-slate-200">
                  {days.map((d) => (
                    <div
                      key={d}
                      className="flex items-center justify-center border-l border-slate-200 text-[11px] font-semibold text-slate-600"
                      style={{ width: cellWidth, height: 40 }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {rooms
                  .slice()
                  .sort((a, b) => String(a.room_number).localeCompare(String(b.room_number)))
                  .map((room) => {
                    const roomBookings = bookingsByRoom.get(room.id) || []

                    return (
                      <div key={room.id} className="flex border-b border-slate-200 last:border-b-0">
                        <div
                          className="sticky left-0 z-10 flex items-center border-r border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900"
                          style={{ width: leftColWidth, height: cellHeight }}
                        >
                          {room.room_number}
                        </div>

                        <div className="relative" style={{ width: totalDays * cellWidth, height: cellHeight }}>
                          <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, ${cellWidth}px)` }}>
                            {days.map((d) => (
                              <div key={d} className="border-l border-slate-100" />
                            ))}
                          </div>

                          {roomBookings.map((b) => {
                            const inDate = dateOnly(new Date(b.check_in_date))
                            const outDate = dateOnly(new Date(b.check_out_date))
                            const lastNight = new Date(outDate)
                            lastNight.setDate(lastNight.getDate() - 1)

                            const startDay = clamp(
                              inDate.getFullYear() === monthStart.getFullYear() && inDate.getMonth() === monthStart.getMonth()
                                ? inDate.getDate()
                                : 1,
                              1,
                              totalDays
                            )

                            const endDay = clamp(
                              lastNight.getFullYear() === monthStart.getFullYear() && lastNight.getMonth() === monthStart.getMonth()
                                ? lastNight.getDate()
                                : totalDays,
                              1,
                              totalDays
                            )

                            if (endDay < startDay) return null

                            const left = (startDay - 1) * cellWidth + 2
                            const width = (endDay - startDay + 1) * cellWidth - 4

                            return (
                              <div
                                key={b.id}
                                title={`${b.guest_full_name} (${b.status})`}
                                className={
                                  'absolute top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-[11px] font-semibold text-white shadow-sm ' +
                                  bookingColor(b.status)
                                }
                                style={{ left, width, height: 26 }}
                              >
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
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-emerald-500" /> Confirmed
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-blue-500" /> Checked In
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-slate-400" /> Checked Out
          </div>
        </div>
      </div>
    </div>
  )
}
