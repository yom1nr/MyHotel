import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import type { StaffCreateInput, StaffRole, StaffUser } from '../types/staff'
import { createStaff, deleteStaff, getStaff, setStaffActive } from '../services/staffService'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

type StaffFormState = { fullName: string; email: string; password: string; role: StaffRole; phone: string }

function emptyForm(): StaffFormState {
  return { fullName: '', email: '', password: '', role: 'receptionist', phone: '' }
}

const ROLE_LABEL_TH: Record<StaffRole, string> = {
  admin: 'Admin', manager: 'Manager (ผู้จัดการ)', receptionist: 'พนักงานต้อนรับ',
  housekeeper: 'แม่บ้าน', maintenance: 'ช่างซ่อมบำรุง', accountant: 'ฝ่ายบัญชี',
}

function roleBadgeVariant(role: StaffRole): 'indigo' | 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' {
  switch (role) {
    case 'admin': return 'indigo'
    case 'manager': return 'blue'
    case 'receptionist': return 'cyan'
    case 'housekeeper': return 'emerald'
    case 'maintenance': return 'amber'
    case 'accountant': return 'rose'
  }
}

export default function Staff() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<StaffFormState>(emptyForm)

  async function refresh() { setStaff(await getStaff()) }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getStaff(); if (!cancelled) setStaff(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load staff') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const staffCount = staff.length
  const activeCount = useMemo(() => staff.filter((s) => Number(s.is_active) === 1).length, [staff])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true); setError(null)
      const payload: StaffCreateInput = {
        full_name: form.fullName.trim(), email: form.email.trim(), password: form.password,
        role: form.role, phone: form.phone.trim() ? form.phone.trim() : null,
      }
      await createStaff(payload)
      await refresh(); setModalOpen(false); toast.success('เพิ่มพนักงานสำเร็จ')
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="animate-fade-in">
      <PageHeader title="พนักงาน" subtitle="จัดการบัญชี Staff (Admin เท่านั้น)" actions={
        <Button onClick={() => { setForm(emptyForm()); setError(null); setModalOpen(true) }} icon={<Plus className="h-4 w-4" />}>Add Staff</Button>
      } />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><div className="text-xs text-slate-400">ทั้งหมด</div><div className="mt-1 text-xl font-bold text-white">{staffCount}</div></Card>
        <Card glow="emerald"><div className="text-xs text-slate-400">Active</div><div className="mt-1 text-xl font-bold text-emerald-400">{activeCount}</div></Card>
        <Card><div className="text-xs text-slate-400">Inactive</div><div className="mt-1 text-xl font-bold text-slate-400">{Math.max(staffCount - activeCount, 0)}</div></Card>
      </div>

      {loading ? (
        <Card className="mt-6 space-y-3"><Skeleton height="h-4" width="w-32" /><Skeleton height="h-8" /><Skeleton height="h-8" /></Card>
      ) : error && !modalOpen ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : null}

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {staff.map((s) => (
                <tr key={s.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-xs font-bold text-indigo-300">
                        {(s.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-xs font-semibold text-white">{s.full_name}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{s.email}</td>
                  <td className="whitespace-nowrap px-4 py-3"><Badge variant={roleBadgeVariant(s.role)}>{ROLE_LABEL_TH[s.role]}</Badge></td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Badge variant={Number(s.is_active) === 1 ? 'emerald' : 'slate'}>
                      {Number(s.is_active) === 1 ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="secondary" onClick={async () => {
                        try { setError(null); await setStaffActive(s.id, Number(s.is_active) !== 1); await refresh(); toast.success('อัปเดตสำเร็จ') }
                        catch (e) { toast.error(e instanceof Error ? e.message : 'Update failed') }
                      }}>
                        {Number(s.is_active) === 1 ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={async () => {
                        if (!window.confirm(`Delete staff ${s.full_name}?`)) return
                        try { setError(null); await deleteStaff(s.id); await refresh(); toast.success('ลบสำเร็จ') }
                        catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed') }
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Add Staff" subtitle="Create a new staff account">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Full Name</label><input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Email</label><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} required /></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Password</label><input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">ตำแหน่ง</label><select value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as StaffRole }))} className={inputCls}>
              {Object.entries(ROLE_LABEL_TH).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          </div>
          <div><label className="mb-2 block text-xs font-medium text-slate-400">Phone</label><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
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
