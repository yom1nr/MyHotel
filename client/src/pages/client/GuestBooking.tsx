import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { formatCurrencyTHB } from '../../utils/format'

type PublicRoom = {
  id: number
  room_number: string
  room_type: 'standard' | 'deluxe' | 'suite'
  floor: number | null
  capacity_adults: number
  capacity_children: number
  base_price: number
  status: string
  description: string | null
}

type Step = 1 | 2 | 3 | 4

type GuestInfo = {
  name: string
  phone: string
  email: string
}

const API_BASE_URL = 'http://localhost:3000'

function calcNights(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0
  const inDate = new Date(checkIn)
  const outDate = new Date(checkOut)
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0

  const msPerDay = 24 * 60 * 60 * 1000
  const utcIn = Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate())
  const utcOut = Date.UTC(outDate.getUTCFullYear(), outDate.getUTCMonth(), outDate.getUTCDate())
  const nights = Math.round((utcOut - utcIn) / msPerDay)
  return nights > 0 ? nights : 0
}

export default function GuestBooking() {
  const [step, setStep] = useState<Step>(1)

  const [rooms, setRooms] = useState<PublicRoom[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const [guest, setGuest] = useState<GuestInfo>({ name: '', phone: '', email: '' })

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [bookingCode, setBookingCode] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoadingRooms(true)
        setRoomsError(null)

        const res = await fetch(`${API_BASE_URL}/api/public/rooms`)
        const json = (await res.json()) as { success: boolean; data?: PublicRoom[]; message?: string }

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.message || 'Failed to load rooms')
        }

        if (!cancelled) setRooms(json.data)
      } catch (e) {
        if (!cancelled) setRoomsError(e instanceof Error ? e.message : 'Failed to load rooms')
      } finally {
        if (!cancelled) setLoadingRooms(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null
    return rooms.find((r) => r.id === selectedRoomId) || null
  }, [rooms, selectedRoomId])

  const nights = useMemo(() => calcNights(checkIn, checkOut), [checkIn, checkOut])
  const total = useMemo(() => {
    const price = selectedRoom ? Number(selectedRoom.base_price) : 0
    return nights * price
  }, [nights, selectedRoom])

  function nextFromStep1() {
    if (!selectedRoomId) {
      setSubmitError('กรุณาเลือกห้อง')
      return
    }
    if (!checkIn || !checkOut || nights <= 0) {
      setSubmitError('กรุณาเลือกวันที่ให้ถูกต้อง')
      return
    }
    setSubmitError(null)
    setStep(2)
  }

  function nextFromStep2() {
    if (!guest.name.trim()) {
      setSubmitError('กรุณากรอกชื่อผู้เข้าพัก')
      return
    }
    if (!guest.phone.trim()) {
      setSubmitError('กรุณากรอกเบอร์โทร')
      return
    }

    setSubmitError(null)
    setStep(3)
  }

  async function onSubmitBooking() {
    if (!selectedRoomId || !checkIn || !checkOut) return

    try {
      setSubmitting(true)
      setSubmitError(null)

      const res = await fetch(`${API_BASE_URL}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: selectedRoomId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guest_name: guest.name,
          guest_phone: guest.phone,
          guest_email: guest.email || null,
        }),
      })

      const json = (await res.json()) as {
        success: boolean
        data?: { booking_code: string }
        message?: string
      }

      if (!res.ok || !json.success || !json.data?.booking_code) {
        throw new Error(json.message || 'จองไม่สำเร็จ')
      }

      setBookingCode(json.data.booking_code)
      setStep(4)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'จองไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <div className="text-sm font-semibold">จองห้องพัก</div>
            <div className="mt-1 text-xs text-white/60">จองแบบไม่ต้องล็อกอิน (Guest Booking)</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/booking-status"
              className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
            >
              เช็คสถานะการจอง
            </Link>
            <Link
              to="/"
              className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
            >
              กลับหน้า Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-white/70">Step {step}/4</div>
              <div className="mt-1 text-lg font-extrabold tracking-tight">
                {step === 1
                  ? 'เลือกห้องและวันที่'
                  : step === 2
                    ? 'ข้อมูลผู้เข้าพัก'
                    : step === 3
                      ? 'ยืนยันการจอง'
                      : 'สำเร็จ'}
              </div>

              {submitError ? (
                <div className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-200 ring-1 ring-rose-500/20">
                  {submitError}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-white/70">Check-in</label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-4 focus:ring-orange-500/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/70">Check-out</label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-4 focus:ring-orange-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white/70">เลือกห้อง (Available)</div>
                        <div className="mt-1 text-xs text-white/50">เลือก 1 ห้องสำหรับการจอง</div>
                      </div>
                      <div className="text-xs text-white/50">
                        {loadingRooms ? 'กำลังโหลด...' : roomsError ? 'โหลดไม่สำเร็จ' : `${rooms.length} ห้อง`}
                      </div>
                    </div>

                    {roomsError ? (
                      <div className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-200 ring-1 ring-rose-500/20">
                        {roomsError}
                      </div>
                    ) : null}

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {rooms.map((r) => {
                        const selected = selectedRoomId === r.id
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRoomId(r.id)}
                            className={
                              'rounded-3xl p-5 text-left ring-1 transition ' +
                              (selected
                                ? 'bg-orange-500/10 ring-orange-500/30'
                                : 'bg-white/5 ring-white/10 hover:bg-white/7')
                            }
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm font-semibold">Room {r.room_number}</div>
                                <div className="mt-1 text-xs text-white/60">
                                  {r.room_type.toUpperCase()}
                                  {r.floor ? ` • ชั้น ${r.floor}` : ''}
                                </div>
                              </div>
                              {selected ? (
                                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-slate-950">
                                  Selected
                                </span>
                              ) : (
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 ring-1 ring-white/10">
                                  Choose
                                </span>
                              )}
                            </div>

                            <div className="mt-4 text-xs text-white/50">เริ่มต้น</div>
                            <div className="mt-1 text-lg font-extrabold">{formatCurrencyTHB(Number(r.base_price))}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextFromStep1}
                      className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              ) : step === 2 ? (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-white/70">ชื่อ-นามสกุล</label>
                    <input
                      value={guest.name}
                      onChange={(e) => setGuest((p) => ({ ...p, name: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-4 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white/70">เบอร์โทร</label>
                    <input
                      value={guest.phone}
                      onChange={(e) => setGuest((p) => ({ ...p, phone: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-4 focus:ring-orange-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-white/70">อีเมล (ไม่บังคับ)</label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) => setGuest((p) => ({ ...p, email: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:ring-4 focus:ring-orange-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={nextFromStep2}
                      className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400"
                    >
                      ถัดไป
                    </button>
                  </div>
                </div>
              ) : step === 3 ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                    <div className="text-xs font-semibold text-white/70">สรุปรายการจอง</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-xs text-white/60">ห้อง</div>
                        <div className="mt-1 text-sm font-semibold">
                          {selectedRoom ? `Room ${selectedRoom.room_number} (${selectedRoom.room_type.toUpperCase()})` : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">วันที่</div>
                        <div className="mt-1 text-sm font-semibold">
                          {checkIn} → {checkOut}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">ผู้เข้าพัก</div>
                        <div className="mt-1 text-sm font-semibold">{guest.name}</div>
                        <div className="mt-1 text-xs text-white/60">{guest.phone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/60">ยอดรวม</div>
                        <div className="mt-1 text-lg font-extrabold text-orange-200">{formatCurrencyTHB(total)}</div>
                        <div className="mt-1 text-xs text-white/60">{nights} คืน</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-2xl bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={onSubmitBooking}
                      className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-70"
                    >
                      {submitting ? 'กำลังส่ง...' : 'ยืนยันการจอง'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="rounded-3xl bg-gradient-to-br from-orange-500/15 to-white/5 p-8 ring-1 ring-orange-500/20">
                    <div className="text-xs font-semibold text-white/70">Success</div>
                    <div className="mt-2 text-2xl font-extrabold">จองสำเร็จ</div>
                    <div className="mt-4 text-xs text-white/70">Booking Code</div>
                    <div className="mt-2 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-lg font-extrabold text-slate-950">
                      {bookingCode}
                    </div>
                    <div className="mt-4 text-sm text-white/70">
                      Please save this code to check your status.
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link
                        to="/booking-status"
                        className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                      >
                        ไปเช็คสถานะการจอง
                      </Link>
                      <Link
                        to="/"
                        className="rounded-2xl bg-white/5 px-6 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
                      >
                        กลับหน้า Home
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="text-sm font-semibold">สรุป</div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-white/70">
                  <span>ห้อง</span>
                  <span className="text-white">{selectedRoom ? selectedRoom.room_number : '-'}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>คืน</span>
                  <span className="text-white">{nights}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>ราคา/คืน</span>
                  <span className="text-white">{selectedRoom ? formatCurrencyTHB(Number(selectedRoom.base_price)) : '-'}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Total</span>
                  <span className="text-orange-200 font-semibold">{formatCurrencyTHB(total)}</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/5 p-4 text-xs text-white/60 ring-1 ring-white/10">
                หลังจากจองสำเร็จ ระบบจะสร้าง Booking Code ให้คุณ
                กรุณาเก็บรหัสนี้ไว้เพื่อเช็คสถานะการจอง
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
