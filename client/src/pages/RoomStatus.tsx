import { useEffect, useMemo, useState } from 'react'
import { BedDouble } from 'lucide-react'

import type { Room, RoomStatus } from '../types/room'
import { getRooms } from '../services/roomService'

import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

const STATUS_META: Record<RoomStatus, { label: string; variant: 'emerald' | 'rose' | 'amber' | 'slate' }> = {
  available: { label: 'ว่าง', variant: 'emerald' },
  occupied: { label: 'เข้าพัก', variant: 'rose' },
  reserved: { label: 'จองแล้ว', variant: 'amber' },
  maintenance: { label: 'ซ่อมบำรุง', variant: 'slate' },
}

export default function RoomStatusPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getRooms(); if (!cancelled) setRooms(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load rooms') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<RoomStatus, Room[]>()
    for (const r of rooms) map.set(r.status, [...(map.get(r.status) || []), r])
    return map
  }, [rooms])

  return (
    <div className="animate-fade-in">
      <PageHeader title="สถานะห้องพัก" subtitle="สำหรับแม่บ้าน/ช่างซ่อมบำรุง (Read-only)" />

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Card key={i} className="space-y-3"><Skeleton height="h-4" width="w-24" /><Skeleton height="h-6" /></Card>)}
        </div>
      ) : error ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const meta = STATUS_META[room.status]
              return (
                <Card key={room.id} hover>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 ring-1 ring-indigo-500/20">
                        <BedDouble className="h-5 w-5 text-indigo-300" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">ห้อง {room.room_number}</div>
                        <div className="mt-0.5 text-xs text-slate-500">{room.room_type.toUpperCase()} {room.floor ? `• ชั้น ${room.floor}` : ''}</div>
                      </div>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                  {room.description ? <div className="mt-4 text-xs text-slate-500 line-clamp-2">{room.description}</div> : null}
                </Card>
              )
            })}
          </div>

          <Card className="mt-6">
            <div className="text-xs font-semibold text-white">สรุป</div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['available', 'reserved', 'occupied', 'maintenance'] as RoomStatus[]).map((s) => {
                const meta = STATUS_META[s]
                const count = grouped.get(s)?.length || 0
                return (
                  <div key={s} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <div className="mt-2 text-xl font-extrabold text-white">{count}</div>
                    <div className="mt-1 text-xs text-slate-500">ห้อง</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
