import { useEffect, useState } from 'react'

import type { AttendanceRecord } from '../types/attendance'
import { clockIn, clockOut, getMyTodayAttendance } from '../services/attendanceService'

type Props = {
  className?: string
}

export default function ClockWidget({ className }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [today, setToday] = useState<AttendanceRecord | null>(null)

  async function refresh() {
    const data = await getMyTodayAttendance()
    setToday(data)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getMyTodayAttendance()
        if (!cancelled) setToday(data)
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

  const canClockIn = !today
  const canClockOut = Boolean(today && !today.clock_out_time)

  if (loading) {
    return (
      <div className={className}>
        <div className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
          Loading attendance...
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-900">Attendance</div>
            <div className="mt-1 text-xs text-slate-500">
              {today
                ? today.clock_out_time
                  ? 'Clocked out'
                  : 'Clocked in'
                : 'Not clocked in'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canClockIn ? (
              <button
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true)
                    setError(null)
                    await clockIn()
                    await refresh()
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Clock-in failed')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                Clock In
              </button>
            ) : null}

            {canClockOut ? (
              <button
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true)
                    setError(null)
                    await clockOut()
                    await refresh()
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Clock-out failed')
                  } finally {
                    setSaving(false)
                  }
                }}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                Clock Out
              </button>
            ) : null}
          </div>
        </div>

        {today ? (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">Clock In</div>
              <div className="mt-1 text-xs font-semibold text-slate-900">
                {String(today.clock_in_time).replace('T', ' ').slice(0, 16)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Clock Out</div>
              <div className="mt-1 text-xs font-semibold text-slate-900">
                {today.clock_out_time
                  ? String(today.clock_out_time).replace('T', ' ').slice(0, 16)
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Hours</div>
              <div className="mt-1 text-xs font-semibold text-slate-900">
                {today.hours_worked ?? '-'}
              </div>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 ring-1 ring-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </div>
  )
}
