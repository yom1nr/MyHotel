import { useEffect, useMemo, useState } from 'react'
import { BedDouble, Pencil, Plus, Trash2 } from 'lucide-react'

import type { Room, RoomCreateInput, RoomStatus, RoomUpdateInput } from '../types/room'
import { createRoom, deleteRoom, getRooms, updateRoom } from '../services/roomService'
import { formatCurrencyTHB } from '../utils/format'

type Mode = 'create' | 'edit'

type RoomFormState = {
  mode: Mode
  roomId?: number
  roomNumber: string
  roomType: Room['room_type']
  basePrice: string
  status: RoomStatus
}

const STATUS_META: Record<RoomStatus, { label: string; dotClass: string; badgeClass: string }> = {
  available: {
    label: 'ว่าง',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  occupied: {
    label: 'เข้าพัก',
    dotClass: 'bg-rose-500',
    badgeClass: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  reserved: {
    label: 'จองแล้ว',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  maintenance: {
    label: 'ซ่อมบำรุง',
    dotClass: 'bg-slate-500',
    badgeClass: 'bg-slate-50 text-slate-700 ring-slate-200',
  },
}

function emptyForm(): RoomFormState {
  return {
    mode: 'create',
    roomNumber: '',
    roomType: 'standard',
    basePrice: '',
    status: 'available',
  }
}

export default function RoomManagement() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<RoomFormState>(emptyForm)

  async function refresh() {
    const data = await getRooms()
    setRooms(data)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getRooms()
        if (!cancelled) setRooms(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load rooms')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const total = rooms.length
  const available = useMemo(
    () => rooms.filter((r) => r.status === 'available').length,
    [rooms]
  )

  function openCreate() {
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(room: Room) {
    setForm({
      mode: 'edit',
      roomId: room.id,
      roomNumber: room.room_number,
      roomType: room.room_type,
      basePrice: String(room.base_price),
      status: room.status,
    })
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

      const price = Number(form.basePrice)
      if (!form.roomNumber.trim()) throw new Error('Room number is required')
      if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price')

      if (form.mode === 'create') {
        const payload: RoomCreateInput = {
          room_number: form.roomNumber.trim(),
          room_type: form.roomType,
          base_price: price,
          status: form.status,
        }

        await createRoom(payload)
      } else {
        if (!form.roomId) throw new Error('Missing room id')

        const payload: RoomUpdateInput = {
          room_number: form.roomNumber.trim(),
          room_type: form.roomType,
          base_price: price,
          status: form.status,
        }

        await updateRoom(form.roomId, payload)
      }

      await refresh()
      setModalOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(room: Room) {
    const ok = window.confirm(`Delete room ${room.room_number}?`)
    if (!ok) return

    try {
      setError(null)
      await deleteRoom(room.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">จัดการห้องพัก</div>
            <div className="mt-1 text-xs text-slate-500">
              เพิ่ม แก้ไข และจัดการสถานะห้องพัก
            </div>
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">ทั้งหมด</div>
            <div className="mt-1 text-xl font-bold">{total}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">ว่าง</div>
            <div className="mt-1 text-xl font-bold text-orange-600">{available}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">ไม่ว่าง</div>
            <div className="mt-1 text-xl font-bold text-rose-700">{Math.max(total - available, 0)}</div>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            Loading...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
            <div className="text-sm font-semibold text-rose-700">เกิดข้อผิดพลาด</div>
            <div className="mt-1 text-xs text-slate-600">{error}</div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const meta = STATUS_META[room.status]

            return (
              <div
                key={room.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-700">
                      <BedDouble className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">ห้อง {room.room_number}</div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {room.room_type.toUpperCase()} {room.floor ? `• ชั้น ${room.floor}` : ''}
                      </div>
                    </div>
                  </div>

                  <span
                    className={
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                      meta.badgeClass
                    }
                  >
                    <span className={'h-2 w-2 rounded-full ' + meta.dotClass} />
                    {meta.label}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xs text-slate-500">ราคา</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">
                      {formatCurrencyTHB(Number(room.base_price))}
                      <span className="text-xs font-medium text-slate-500">/คืน</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(room)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      <Pencil className="h-4 w-4" />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => onDelete(room)}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {form.mode === 'create' ? 'เพิ่มห้องพัก' : 'แก้ไขห้องพัก'}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  จัดการข้อมูลห้องและสถานะ
                </div>
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
                  <label className="text-xs font-medium text-slate-600">เลขห้อง</label>
                  <input
                    value={form.roomNumber}
                    onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))}
                    placeholder="101"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">ประเภทห้อง</label>
                  <select
                    value={form.roomType}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        roomType: e.target.value as Room['room_type'],
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
                  >
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">ราคา (บาท/คืน)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.basePrice}
                    onChange={(e) => setForm((p) => ({ ...p, basePrice: e.target.value }))}
                    placeholder="1200"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">สถานะ</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as RoomStatus }))
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
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
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-70"
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
