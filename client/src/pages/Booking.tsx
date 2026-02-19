import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'

import type { Booking, BookingCreateInput, BookingStatus } from '../types/booking'
import type { Room } from '../types/room'
import { createBooking, getBookings, updateBookingStatus } from '../services/bookingService'
import { getRooms } from '../services/roomService'
import { formatCurrencyTHB, formatDateShort } from '../utils/format'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

type BookingFormState = {
  roomId: string
  checkIn: string
  checkOut: string
  guestFullName: string
  guestPhone: string
  guestEmail: string
  notes: string
}

const STATUS_META: Record<BookingStatus, { label: string; variant: 'amber' | 'emerald' | 'blue' | 'slate' | 'rose' }> = {
  pending: { label: 'รอดำเนินการ', variant: 'amber' },
  confirmed: { label: 'ยืนยันแล้ว', variant: 'emerald' },
  checked_in: { label: 'เช็คอิน', variant: 'blue' },
  checked_out: { label: 'เช็คเอาท์', variant: 'slate' },
  cancelled: { label: 'ยกเลิก', variant: 'rose' },
}

function emptyForm(): BookingFormState {
  return { roomId: '', checkIn: '', checkOut: '', guestFullName: '', guestPhone: '', guestEmail: '', notes: '' }
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

export default function BookingPage() {
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
        if (!cancelled) { setBookings(bookingData); setRooms(roomData) }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const availableRooms = useMemo(() => rooms.filter((r) => r.status === 'available'), [rooms])
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
        guest_phone: form.guestPhone.trim() || null,
        guest_email: form.guestEmail.trim() || null,
        notes: form.notes.trim() || null,
      }
      await createBooking(payload)
      await refresh()
      setModalOpen(false)
      toast.success('สร้างการจองสำเร็จ')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="การจอง"
        subtitle="รายการจองล่าสุดและสร้างการจองใหม่"
        actions={
          <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />} variant="success">
            New Booking
          </Button>
        }
      />

      {loading ? (
        <Card className="mt-6 space-y-3">
          <Skeleton height="h-4" width="w-32" />
          <Skeleton height="h-8" />
          <Skeleton height="h-8" />
          <Skeleton height="h-8" />
        </Card>
      ) : error && !modalOpen ? (
        <Card className="mt-6 border-rose-500/20">
          <div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div>
          <div className="mt-1 text-xs text-slate-400">{error}</div>
        </Card>
      ) : null}

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Nights</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {bookings.map((b) => {
                const meta = STATUS_META[b.status]
                return (
                  <tr key={b.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">{b.booking_code}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-white">{b.guest_full_name}</div>
                      <div className="mt-0.5 text-xs text-slate-500">{b.guest_phone || '-'}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">ห้อง {b.room_number} ({b.room_type.toUpperCase()})</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateShort(b.check_in_date)} → {formatDateShort(b.check_out_date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{b.nights}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-white">{formatCurrencyTHB(Number(b.total_amount))}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge variant={meta.variant}>{meta.label}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {b.status === 'checked_in' ? (
                        <Button size="sm" variant="secondary" onClick={async () => {
                          try { await updateBookingStatus(b.id, 'checked_out'); await refresh(); toast.success('Check-out สำเร็จ') }
                          catch (e) { toast.error(e instanceof Error ? e.message : 'Update failed') }
                        }}>Check-out</Button>
                      ) : b.status === 'pending' || b.status === 'confirmed' ? (
                        <Button size="sm" onClick={async () => {
                          try { await updateBookingStatus(b.id, 'checked_in'); await refresh(); toast.success('Check-in สำเร็จ') }
                          catch (e) { toast.error(e instanceof Error ? e.message : 'Update failed') }
                        }}>Check-in</Button>
                      ) : <span className="text-xs text-slate-600">-</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title="New Booking" subtitle="เลือกห้อง ระบุช่วงวันที่ และข้อมูลผู้เข้าพัก">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Room</label>
              <select value={form.roomId} onChange={(e) => setForm((p) => ({ ...p, roomId: e.target.value }))} className={inputCls} required>
                <option value="">Select a room</option>
                {availableRooms.map((r) => <option key={r.id} value={String(r.id)}>ห้อง {r.room_number} ({r.room_type.toUpperCase()}) - {formatCurrencyTHB(Number(r.base_price))}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Guest Full Name</label>
              <input value={form.guestFullName} onChange={(e) => setForm((p) => ({ ...p, guestFullName: e.target.value }))} placeholder="John Doe" className={inputCls} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Check-in</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="date" value={form.checkIn} onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))} className={inputCls + ' pl-10'} required />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Check-out</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="date" value={form.checkOut} onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))} className={inputCls + ' pl-10'} required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Phone</label>
              <input value={form.guestPhone} onChange={(e) => setForm((p) => ({ ...p, guestPhone: e.target.value }))} placeholder="0800000000" className={inputCls} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">Email</label>
              <input type="email" value={form.guestEmail} onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))} placeholder="guest@email.com" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} className={inputCls + ' resize-none'} />
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-500">ราคา/คืน</div>
                <div className="mt-1 text-sm font-semibold text-white">{formatCurrencyTHB(selectedRoom ? Number(selectedRoom.base_price) : 0)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">คืน</div>
                <div className="mt-1 text-sm font-semibold text-white">{nights}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total</div>
                <div className="mt-1 text-sm font-bold text-indigo-400">{formatCurrencyTHB(total)}</div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => !saving && setModalOpen(false)} disabled={saving}>ยกเลิก</Button>
            <Button type="submit" loading={saving}>{saving ? 'Saving...' : 'บันทึก'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
