import { useState } from 'react'
import { Link } from 'react-router-dom'

import { formatCurrencyTHB, formatDateShort } from '../../utils/format'

type BookingStatusResult = {
  booking_code: string
  guest_full_name: string
  check_in_date: string
  check_out_date: string
  nights: number
  total_amount: number
  status: string
  room_number: string
  room_type: string
}

const BASE_URL = 'http://localhost:3000'

function badgeForStatus(status: string) {
  const s = status.toLowerCase()

  if (s === 'confirmed' || s === 'checked_in' || s === 'paid') {
    return {
      label: 'ยืนยันแล้ว',
      badge: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/20',
    }
  }

  if (s === 'pending') {
    return {
      label: 'รอดำเนินการ',
      badge: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/20',
    }
  }

  if (s === 'cancelled') {
    return {
      label: 'ยกเลิก',
      badge: 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-500/20',
    }
  }

  if (s === 'checked_out') {
    return {
      label: 'เช็คเอาท์แล้ว',
      badge: 'bg-white/10 text-white/70 ring-1 ring-white/10',
    }
  }

  return {
    label: status,
    badge: 'bg-white/10 text-white/70 ring-1 ring-white/10',
  }
}

export default function BookingStatus() {
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BookingStatusResult | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const params = new URLSearchParams({
        code: code.trim(),
        phone: phone.trim(),
      })

      const res = await fetch(`${BASE_URL}/api/bookings/status?${params.toString()}`)
      const json = (await res.json()) as { success: boolean; data?: BookingStatusResult; message?: string }

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || 'ไม่พบข้อมูลการจอง')
      }

      setResult(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const badge = result ? badgeForStatus(result.status) : null

  return (
    <div className="min-h-screen bg-[#070A12] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <div className="text-sm font-semibold">เช็คสถานะการจอง</div>
            <div className="mt-1 text-xs text-white/60">กรอก Booking ID และเบอร์โทรเพื่อยืนยัน</div>
          </div>
          <Link
            to="/"
            className="rounded-xl bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            กลับหน้า Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-white/70">Booking ID</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น BK-XXXX-XXXX"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-4 focus:ring-orange-500/20"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-white/70">Phone Number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เบอร์โทรที่ใช้จอง"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:ring-4 focus:ring-orange-500/20"
                required
              />
            </div>

            {error ? (
              <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-xs text-rose-200 ring-1 ring-rose-500/20">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-70"
            >
              {loading ? 'กำลังค้นหา...' : 'ตรวจสอบสถานะ'}
            </button>
          </form>
        </div>

        {result ? (
          <div className="mt-6 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div>
                <div className="text-xs text-white/60">Booking ID</div>
                <div className="mt-1 text-lg font-extrabold tracking-tight">{result.booking_code}</div>
                <div className="mt-2 text-xs text-white/60">ผู้เข้าพัก</div>
                <div className="mt-1 text-sm font-semibold">{result.guest_full_name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60">สถานะ</div>
                <div className={'mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ' + (badge?.badge || '')}>
                  {badge?.label}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
              <div className="p-6">
                <div className="text-xs text-white/60">ห้อง</div>
                <div className="mt-1 text-sm font-semibold">
                  Room {result.room_number} ({result.room_type.toUpperCase()})
                </div>
              </div>
              <div className="border-y border-white/10 p-6 sm:border-y-0 sm:border-x">
                <div className="text-xs text-white/60">วันที่</div>
                <div className="mt-1 text-sm font-semibold">
                  {formatDateShort(result.check_in_date)} → {formatDateShort(result.check_out_date)}
                </div>
                <div className="mt-1 text-xs text-white/50">{result.nights} คืน</div>
              </div>
              <div className="p-6">
                <div className="text-xs text-white/60">ยอดรวม</div>
                <div className="mt-1 text-lg font-extrabold text-orange-200">
                  {formatCurrencyTHB(Number(result.total_amount))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
