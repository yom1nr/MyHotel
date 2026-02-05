import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import type { StaffCreateInput, StaffRole, StaffUser } from '../types/staff'
import { createStaff, deleteStaff, getStaff, setStaffActive } from '../services/staffService'

type StaffFormState = {
  fullName: string
  email: string
  password: string
  role: StaffRole
  phone: string
}

function emptyForm(): StaffFormState {
  return {
    fullName: '',
    email: '',
    password: '',
    role: 'receptionist',
    phone: '',
  }
}

const ROLE_LABEL_TH: Record<StaffRole, string> = {
  admin: 'Admin',
  manager: 'Manager (ผู้จัดการ)',
  receptionist: 'พนักงานต้อนรับ',
  housekeeper: 'แม่บ้าน',
  maintenance: 'ช่างซ่อมบำรุง',
  accountant: 'ฝ่ายบัญชี',
}

function roleBadge(role: StaffRole) {
  switch (role) {
    case 'admin':
      return { label: 'Admin', cls: 'bg-slate-900 text-white ring-slate-900/20' }
    case 'manager':
      return { label: 'ผู้จัดการ', cls: 'bg-blue-50 text-blue-700 ring-blue-200' }
    case 'receptionist':
      return { label: 'ต้อนรับ', cls: 'bg-sky-50 text-sky-700 ring-sky-200' }
    case 'housekeeper':
      return { label: 'แม่บ้าน', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
    case 'maintenance':
      return { label: 'ซ่อมบำรุง', cls: 'bg-orange-50 text-orange-700 ring-orange-200' }
    case 'accountant':
      return { label: 'บัญชี', cls: 'bg-violet-50 text-violet-700 ring-violet-200' }
    default:
      return { label: role, cls: 'bg-slate-50 text-slate-700 ring-slate-200' }
  }
}

function statusBadge(isActive: number) {
  if (Number(isActive) === 1) {
    return {
      label: 'Active',
      cls: 'bg-orange-50 text-orange-700 ring-orange-200',
    }
  }

  return {
    label: 'Inactive',
    cls: 'bg-slate-50 text-slate-700 ring-slate-200',
  }
}

export default function Staff() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<StaffUser[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<StaffFormState>(emptyForm)

  useEffect(() => {
    if (!modalOpen) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (saving) return
        setModalOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalOpen, saving])

  async function refresh() {
    const data = await getStaff()
    setStaff(data)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getStaff()
        if (!cancelled) setStaff(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load staff')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const staffCount = staff.length
  const activeCount = useMemo(
    () => staff.filter((s) => Number(s.is_active) === 1).length,
    [staff]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const payload: StaffCreateInput = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() ? form.phone.trim() : null,
      }

      await createStaff(payload)

      try {
        await refresh()
        setModalOpen(false)
      } catch (e) {
        setModalOpen(false)
        setError(e instanceof Error ? e.message : 'Failed to refresh staff list')
      }
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
            <div className="text-sm font-semibold text-slate-900">พนักงาน</div>
            <div className="mt-1 text-xs text-slate-500">จัดการบัญชี Staff (Admin เท่านั้น)</div>
          </div>

          <button
            onClick={() => {
              setForm(emptyForm())
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">ทั้งหมด</div>
            <div className="mt-1 text-xl font-bold">{staffCount}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Active</div>
            <div className="mt-1 text-xl font-bold text-orange-600">{activeCount}</div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Inactive</div>
            <div className="mt-1 text-xl font-bold text-slate-700">{Math.max(staffCount - activeCount, 0)}</div>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staff.map((s) => {
                  const badge = statusBadge(s.is_active)
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-900">{s.full_name}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">{s.email}</td>
                      <td className="px-4 py-3 text-xs">
                        {(() => {
                          const roleMeta = roleBadge(s.role)
                          return (
                            <span
                              className={
                                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                                roleMeta.cls
                              }
                            >
                              {roleMeta.label}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' + badge.cls}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={async () => {
                              try {
                                setError(null)
                                await setStaffActive(s.id, Number(s.is_active) !== 1)
                                await refresh()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Update failed')
                              }
                            }}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            {Number(s.is_active) === 1 ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={async () => {
                              const ok = window.confirm(`Delete staff ${s.full_name}?`)
                              if (!ok) return
                              try {
                                setError(null)
                                await deleteStaff(s.id)
                                await refresh()
                              } catch (e) {
                                setError(e instanceof Error ? e.message : 'Delete failed')
                              }
                            }}
                            className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onMouseDown={() => {
            if (saving) return
            setModalOpen(false)
          }}
        >
          <div
            className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Add Staff</div>
                <div className="mt-1 text-xs text-slate-500">Create a new staff account</div>
              </div>
              <button
                onClick={() => {
                  if (saving) return
                  setModalOpen(false)
                }}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                ปิด
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">ตำแหน่ง</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as StaffRole }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                  >
                    <option value="admin">{ROLE_LABEL_TH.admin}</option>
                    <option value="manager">{ROLE_LABEL_TH.manager}</option>
                    <option value="receptionist">{ROLE_LABEL_TH.receptionist}</option>
                    <option value="housekeeper">{ROLE_LABEL_TH.housekeeper}</option>
                    <option value="maintenance">{ROLE_LABEL_TH.maintenance}</option>
                    <option value="accountant">{ROLE_LABEL_TH.accountant}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                />
              </div>

              {error ? (
                <div className="rounded-2xl bg-rose-50 px-4 py-3 text-xs text-rose-700 ring-1 ring-rose-200">
                  {error}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (saving) return
                    setModalOpen(false)
                  }}
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
