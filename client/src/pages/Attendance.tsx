import { useEffect, useMemo, useState } from 'react'

import type { AttendanceRecord, AttendanceStatus } from '../types/attendance'
import { getAttendanceHistory } from '../services/attendanceService'

const STATUS_META: Record<AttendanceStatus, { label: string; cls: string }> = {
  on_time: {
    label: 'On Time',
    cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  late: {
    label: 'Late',
    cls: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
}

export default function Attendance() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAttendanceHistory()
        if (!cancelled) setRecords(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load attendance')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const total = records.length
  const lateCount = useMemo(
    () => records.filter((r) => r.status === 'late').length,
    [records]
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div>
          <div className="text-sm font-semibold text-slate-900">Attendance</div>
          <div className="mt-1 text-xs text-slate-500">ประวัติการเข้า-ออกงาน</div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">ทั้งหมด</div>
            <div className="mt-1 text-xl font-bold">{total}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Late</div>
            <div className="mt-1 text-xl font-bold text-rose-700">{lateCount}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">On Time</div>
            <div className="mt-1 text-xl font-bold text-emerald-700">{Math.max(total - lateCount, 0)}</div>
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
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Clock In</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Clock Out</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {records.map((r) => {
                  const meta = STATUS_META[r.status]
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">{r.work_date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{r.full_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{r.staff_position || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                        {String(r.clock_in_time).replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                        {r.clock_out_time ? String(r.clock_out_time).replace('T', ' ').slice(0, 16) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                        {r.hours_worked ?? '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' + meta.cls}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
