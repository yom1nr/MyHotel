import { useEffect, useMemo, useState } from 'react'

import type { Room, RoomStatus } from '../types/room'
import { getRooms } from '../services/roomService'

function statusMeta(status: RoomStatus) {
  switch (status) {
    case 'available':
      return { label: 'ว่าง', cls: 'bg-orange-50 text-orange-700 ring-orange-200' }
    case 'occupied':
      return { label: 'เข้าพัก', cls: 'bg-sky-50 text-sky-700 ring-sky-200' }
    case 'reserved':
      return { label: 'จองแล้ว', cls: 'bg-amber-50 text-amber-700 ring-amber-200' }
    case 'maintenance':
      return { label: 'ซ่อมบำรุง', cls: 'bg-rose-50 text-rose-700 ring-rose-200' }
    default:
      return { label: status, cls: 'bg-slate-50 text-slate-700 ring-slate-200' }
  }
}

export default function RoomStatusPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getRooms()
        if (!cancelled) setRooms(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load rooms')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<RoomStatus, Room[]>()
    for (const r of rooms) {
      map.set(r.status, [...(map.get(r.status) || []), r])
    }
    return map
  }, [rooms])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div>
          <div className="text-sm font-semibold text-slate-900">สถานะห้องพัก</div>
          <div className="mt-1 text-xs text-slate-500">สำหรับแม่บ้าน/ช่างซ่อมบำรุง (Read-only)</div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">Loading...</div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
            <div className="text-sm font-semibold text-rose-700">เกิดข้อผิดพลาด</div>
            <div className="mt-1 text-xs text-slate-600">{error}</div>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const meta = statusMeta(room.status)
              return (
                <div key={room.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">ห้อง {room.room_number}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {room.room_type.toUpperCase()}
                        {room.floor ? ` • ชั้น ${room.floor}` : ''}
                      </div>
                    </div>
                    <span className={'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' + meta.cls}>
                      {meta.label}
                    </span>
                  </div>

                  {room.description ? (
                    <div className="mt-4 text-xs text-slate-600 line-clamp-2">{room.description}</div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        {!loading && !error ? (
          <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-700">สรุป</div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['available', 'reserved', 'occupied', 'maintenance'] as RoomStatus[]).map((s) => {
                const meta = statusMeta(s)
                const count = grouped.get(s)?.length || 0
                return (
                  <div key={s} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className={'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' + meta.cls}>
                      {meta.label}
                    </div>
                    <div className="mt-2 text-xl font-extrabold text-slate-900">{count}</div>
                    <div className="mt-1 text-xs text-slate-500">ห้อง</div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
