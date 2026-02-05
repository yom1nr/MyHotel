import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'

import type { Booking, BookingCreateInput, BookingStatus } from '../types/booking'
import type { Room } from '../types/room'
import { createBooking, getBookings, updateBookingStatus } from '../services/bookingService'
import { getRooms } from '../services/roomService'
import { formatCurrencyTHB, formatDateShort } from '../utils/format'

type BookingFormState = {
  roomId: string
  checkIn: string
  checkOut: string
  guestFullName: string
  guestPhone: string
  guestEmail: string
  notes: string
}

const STATUS_META: Record<BookingStatus, { label: string; badgeClass: string }> = {
  pending: {
    label: 'รอดำเนินการ',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  confirmed: {
    label: 'ยืนยันแล้ว',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  checked_in: {
    label: 'เช็คอิน',
    badgeClass: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  checked_out: {
    label: 'เช็คเอาท์',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-200',
  },
  cancelled: {
    label: 'ยกเลิก',
    badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
}

function emptyForm(): BookingFormState {
  return {
    roomId: '',
    checkIn: '',
    checkOut: '',
    guestFullName: '',
    guestPhone: '',
    guestEmail: '',
    notes: '',
  }
}

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

export default function Booking() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<BookingFormState>(emptyForm)

  async function refresh() {
    const [bookingData, roomData] = await Promise.all([getBookings(), getRooms()])
    setBookings(bookingData)
    setRooms(roomData)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [bookingData, roomData] = await Promise.all([getBookings(), getRooms()])
        if (!cancelled) {
          setBookings(bookingData)
          setRooms(roomData)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const availableRooms = useMemo(
    () => rooms.filter((r) => r.status === 'available'),
    [rooms]
  )

  const selectedRoom = useMemo(() => {
    const id = Number(form.roomId)
    if (!id) return null
    return rooms.find((r) => r.id === id) || null
  }, [form.roomId, rooms])

  const nights = useMemo(() => calcNights(form.checkIn, form.checkOut), [form.checkIn, form.checkOut])

  const total = useMemo(() => {
    const price = selectedRoom ? Number(selectedRoom.base_price) : 0
    return price * nights
  }, [nights, selectedRoom])

  function openCreate() {
    setForm(emptyForm())
    setError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const roomId = Number(form.roomId)
      if (!roomId) throw new Error('Please select a room')
      if (!form.checkIn || !form.checkOut) throw new Error('Please select date range')
      if (!form.guestFullName.trim()) throw new Error('Guest name is required')

      const computedNights = calcNights(form.checkIn, form.checkOut)
      if (computedNights <= 0) throw new Error('Invalid date range')

      const payload: BookingCreateInput = {
        room_id: roomId,
        check_in_date: form.checkIn,
        check_out_date: form.checkOut,
        guest_full_name: form.guestFullName.trim(),
        guest_phone: form.guestPhone.trim() ? form.guestPhone.trim() : null,
        guest_email: form.guestEmail.trim() ? form.guestEmail.trim() : null,
        notes: form.notes.trim() ? form.notes.trim() : null,
      }

      await createBooking(payload)
      await refresh()
      setModalOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">การจอง</div>
            <div className="mt-1 text-xs text-slate-500">รายการจองล่าสุดและสร้างการจองใหม่</div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
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
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nights</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bookings.map((b) => {
                  const meta = STATUS_META[b.status]
                  return (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-900">
                        {b.booking_code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-slate-900">{b.guest_full_name}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{b.guest_phone || '-'}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                        ห้อง {b.room_number} ({b.room_type.toUpperCase()})
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                        {formatDateShort(b.check_in_date)} → {formatDateShort(b.check_out_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">{b.nights}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-900">
                        {formatCurrencyTHB(Number(b.total_amount))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                            meta.badgeClass
                          }
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        {b.status === 'checked_in' ? (
                          <button
                            onClick={async () => {
                              try {
                                setError(null)
                                await updateBookingStatus(b.id, 'checked_out')
                                await refresh()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Update failed')
                              }
                            }}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Check-out
                          </button>
                        ) : b.status === 'pending' || b.status === 'confirmed' ? (
                          <button
                            onClick={async () => {
                              try {
                                setError(null)
                                await updateBookingStatus(b.id, 'checked_in')
                                await refresh()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Update failed')
                              }
                            }}
                            className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-orange-400"
                          >
                            Check-in
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">New Booking</div>
                <div className="mt-1 text-xs text-slate-500">เลือกห้อง ระบุช่วงวันที่ และข้อมูลผู้เข้าพัก</div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Room</label>
                  <select
                    value={form.roomId}
                    onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  >
                    <option value="" disabled>
                      Select a room
                    </option>
                    {availableRooms.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        ห้อง {r.room_number} ({r.room_type.toUpperCase()}) - {formatCurrencyTHB(Number(r.base_price))}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs text-slate-500">
                    แสดงเฉพาะห้องสถานะ available
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Guest Full Name</label>
                  <input
                    value={form.guestFullName}
                    onChange={(e) => setForm((p) => ({ ...p, guestFullName: e.target.value }))}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Check-in</label>
                  <div className="relative mt-2">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={form.checkIn}
                      onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-orange-500/20 focus:ring-4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Check-out</label>
                  <div className="relative mt-2">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={form.checkOut}
                      onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none ring-orange-500/20 focus:ring-4"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Phone</label>
                  <input
                    value={form.guestPhone}
                    onChange={(e) => setForm((p) => ({ ...p, guestPhone: e.target.value }))}
                    placeholder="0800000000"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))}
                    placeholder="guest@email.com"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs text-slate-500">ราคา/คืน</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrencyTHB(selectedRoom ? Number(selectedRoom.base_price) : 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">คืน</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{nights}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="mt-1 text-sm font-bold text-orange-600">
                      {formatCurrencyTHB(total)}
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 ring-1 ring-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-70"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-orange-500 px-4 py-3 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 hover:bg-orange-400 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
