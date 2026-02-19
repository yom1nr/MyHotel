import { useEffect, useMemo, useState } from 'react'

import type { AttendanceRecord } from '../types/attendance'
import { getAttendanceHistory } from '../services/attendanceService'

import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

export default function Attendance() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getAttendanceHistory(); if (!cancelled) setRecords(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load attendance') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const total = records.length
  const lateCount = useMemo(() => records.filter((r) => r.status === 'late').length, [records])

  return (
    <div className="animate-fade-in">
      <PageHeader title="Attendance" subtitle="ประวัติการเข้า-ออกงาน" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><div className="text-xs text-slate-400">ทั้งหมด</div><div className="mt-1 text-xl font-bold text-white">{total}</div></Card>
        <Card glow="indigo"><div className="text-xs text-slate-400">Late</div><div className="mt-1 text-xl font-bold text-rose-400">{lateCount}</div></Card>
        <Card glow="emerald"><div className="text-xs text-slate-400">On Time</div><div className="mt-1 text-xl font-bold text-emerald-400">{Math.max(total - lateCount, 0)}</div></Card>
      </div>

      {loading ? (
        <Card className="mt-6 space-y-3"><Skeleton height="h-4" width="w-32" /><Skeleton height="h-8" /><Skeleton height="h-8" /></Card>
      ) : error ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : null}

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Position</th>
                <th className="px-4 py-3 font-medium">Clock In</th>
                <th className="px-4 py-3 font-medium">Clock Out</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {records.map((r) => (
                <tr key={r.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{r.work_date}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{r.full_name}</td>
                  <td className="px-4 py-3 text-xs">{r.staff_position || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{String(r.clock_in_time).replace('T', ' ').slice(0, 16)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{r.clock_out_time ? String(r.clock_out_time).replace('T', ' ').slice(0, 16) : '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{r.hours_worked ?? '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={r.status === 'on_time' ? 'emerald' : 'rose'}>
                      {r.status === 'on_time' ? 'On Time' : 'Late'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
