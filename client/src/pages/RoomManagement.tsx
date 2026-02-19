import { useEffect, useMemo, useState } from 'react'
import { BedDouble, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import type { Room, RoomCreateInput, RoomStatus, RoomUpdateInput } from '../types/room'
import { createRoom, deleteRoom, getRooms, updateRoom } from '../services/roomService'
import { formatCurrencyTHB } from '../utils/format'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

type Mode = 'create' | 'edit'

type RoomFormState = {
  mode: Mode
  roomId?: number
  roomNumber: string
  roomType: Room['room_type']
  basePrice: string
  status: RoomStatus
}

const STATUS_META: Record<RoomStatus, { label: string; variant: 'emerald' | 'rose' | 'amber' | 'slate' }> = {
  available: { label: 'ว่าง', variant: 'emerald' },
  occupied: { label: 'เข้าพัก', variant: 'rose' },
  reserved: { label: 'จองแล้ว', variant: 'amber' },
  maintenance: { label: 'ซ่อมบำรุง', variant: 'slate' },
}

function emptyForm(): RoomFormState {
  return { mode: 'create', roomNumber: '', roomType: 'standard', basePrice: '', status: 'available' }
}

export default function RoomManagement() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RoomFormState>(emptyForm)

  async function refresh() { setRooms(await getRooms()) }

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

  const total = rooms.length
  const available = useMemo(() => rooms.filter((r) => r.status === 'available').length, [rooms])

  function openCreate() { setForm(emptyForm()); setError(null); setModalOpen(true) }
  function openEdit(room: Room) {
    setForm({ mode: 'edit', roomId: room.id, roomNumber: room.room_number, roomType: room.room_type, basePrice: String(room.base_price), status: room.status })
    setError(null); setModalOpen(true)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true); setError(null)
      const price = Number(form.basePrice)
      if (!form.roomNumber.trim()) throw new Error('Room number is required')
      if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price')
      if (form.mode === 'create') {
        await createRoom({ room_number: form.roomNumber.trim(), room_type: form.roomType, base_price: price, status: form.status } as RoomCreateInput)
      } else {
        if (!form.roomId) throw new Error('Missing room id')
        await updateRoom(form.roomId, { room_number: form.roomNumber.trim(), room_type: form.roomType, base_price: price, status: form.status } as RoomUpdateInput)
      }
      await refresh(); setModalOpen(false); toast.success(form.mode === 'create' ? 'เพิ่มห้องสำเร็จ' : 'แก้ไขสำเร็จ')
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  async function onDelete(room: Room) {
    if (!window.confirm(`Delete room ${room.room_number}?`)) return
    try { setError(null); await deleteRoom(room.id); await refresh(); toast.success('ลบห้องสำเร็จ') }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
  }

  const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="animate-fade-in">
      <PageHeader title="จัดการห้องพัก" subtitle="เพิ่ม แก้ไข และจัดการสถานะห้องพัก" actions={
        <Button onClick={openCreate} icon={<Plus className="h-4 w-4" />} variant="success">Add Room</Button>
      } />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><div className="text-xs text-slate-400">ทั้งหมด</div><div className="mt-1 text-xl font-bold text-white">{total}</div></Card>
        <Card glow="emerald"><div className="text-xs text-slate-400">ว่าง</div><div className="mt-1 text-xl font-bold text-emerald-400">{available}</div></Card>
        <Card glow="indigo"><div className="text-xs text-slate-400">ไม่ว่าง</div><div className="mt-1 text-xl font-bold text-indigo-400">{Math.max(total - available, 0)}</div></Card>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Card key={i} className="space-y-3"><Skeleton height="h-4" width="w-24" /><Skeleton height="h-6" width="w-32" /><Skeleton height="h-4" /></Card>)}
        </div>
      ) : error && !modalOpen ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : null}

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
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-slate-500">ราคา</div>
                  <div className="mt-1 text-lg font-bold text-white">{formatCurrencyTHB(Number(room.base_price))}<span className="text-xs font-medium text-slate-500">/คืน</span></div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(room)} icon={<Pencil className="h-3.5 w-3.5" />}>แก้ไข</Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(room)} icon={<Trash2 className="h-3.5 w-3.5" />} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={form.mode === 'create' ? 'เพิ่มห้องพัก' : 'แก้ไขห้องพัก'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">เลขห้อง</label><input value={form.roomNumber} onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))} placeholder="101" className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">ประเภทห้อง</label><select value={form.roomType} onChange={(e) => setForm((p) => ({ ...p, roomType: e.target.value as Room['room_type'] }))} className={inputCls}><option value="standard">Standard</option><option value="deluxe">Deluxe</option><option value="suite">Suite</option></select></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">ราคา (บาท/คืน)</label><input type="number" min={0} value={form.basePrice} onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))} placeholder="1200" className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">สถานะ</label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as RoomStatus }))} className={inputCls}><option value="available">Available</option><option value="occupied">Occupied</option><option value="reserved">Reserved</option><option value="maintenance">Maintenance</option></select></div>
          </div>
          {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div> : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => !saving && setModalOpen(false)} disabled={saving}>ยกเลิก</Button>
            <Button type="submit" loading={saving}>{saving ? 'Saving...' : 'บันทึก'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
