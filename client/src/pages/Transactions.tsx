import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import type { Transaction, TransactionCreateInput } from '../types/transaction'
import { createTransaction, deleteTransaction, getTransactions } from '../services/transactionService'
import { formatCurrencyTHB, formatDateShort } from '../utils/format'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

type FormState = {
  type: TransactionCreateInput['type']
  method: TransactionCreateInput['method']
  amount: string
  category: string
  transaction_date: string
  reference_note: string
}

function emptyForm(): FormState {
  const t = new Date()
  return {
    type: 'payment', method: 'cash', amount: '', category: '',
    transaction_date: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`,
    reference_note: '',
  }
}

function typeBadge(type: string): { label: string; variant: 'emerald' | 'cyan' | 'rose' } {
  if (type === 'payment') return { label: 'Payment', variant: 'emerald' }
  if (type === 'refund') return { label: 'Refund', variant: 'cyan' }
  return { label: 'Expense', variant: 'rose' }
}

export default function Transactions() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Transaction[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  async function refresh() { setItems(await getTransactions()) }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getTransactions(); if (!cancelled) setItems(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load transactions') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const income = useMemo(() => items.filter((t) => t.type === 'payment' && t.status === 'paid').reduce((a, t) => a + Number(t.amount), 0), [items])
  const refund = useMemo(() => items.filter((t) => t.type === 'refund' && t.status === 'paid').reduce((a, t) => a + Number(t.amount), 0), [items])
  const expense = useMemo(() => items.filter((t) => t.type === 'expense' && t.status === 'paid').reduce((a, t) => a + Number(t.amount), 0), [items])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true); setError(null)
      const amt = Number(form.amount)
      if (!Number.isFinite(amt) || amt <= 0) throw new Error('Invalid amount')
      await createTransaction({
        type: form.type, method: form.method, amount: amt,
        category: form.category.trim() || null, transaction_date: form.transaction_date,
        reference_note: form.reference_note.trim() || null,
        status: form.type === 'payment' || form.type === 'expense' ? 'paid' : 'pending',
      })
      await refresh(); setModalOpen(false); setForm(emptyForm()); toast.success('บันทึกสำเร็จ')
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="animate-fade-in">
      <PageHeader title="ธุรกรรม" subtitle="บันทึก/ดูรายการรับเงิน คืนเงิน และค่าใช้จ่าย" actions={
        <Button onClick={() => { setForm(emptyForm()); setError(null); setModalOpen(true) }} icon={<Plus className="h-4 w-4" />}>Add Transaction</Button>
      } />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="emerald"><div className="text-xs text-slate-400">Income</div><div className="mt-1 text-xl font-bold text-emerald-400">{formatCurrencyTHB(income)}</div></Card>
        <Card glow="cyan"><div className="text-xs text-slate-400">Refund</div><div className="mt-1 text-xl font-bold text-cyan-400">{formatCurrencyTHB(refund)}</div></Card>
        <Card glow="indigo"><div className="text-xs text-slate-400">Expense</div><div className="mt-1 text-xl font-bold text-rose-400">{formatCurrencyTHB(expense)}</div></Card>
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
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {items.map((t) => {
                const meta = typeBadge(t.type)
                return (
                  <tr key={t.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-white">{t.transaction_code}</td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge variant={meta.variant}>{meta.label}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateShort(t.transaction_date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{t.method}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-white">{formatCurrencyTHB(Number(t.amount))}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button size="sm" variant="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={async () => {
                        if (!window.confirm(`Delete transaction ${t.transaction_code}?`)) return
                        try { setError(null); await deleteTransaction(t.id); await refresh(); toast.success('ลบสำเร็จ') }
                        catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed') }
                      }} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title="New Transaction" subtitle="บันทึกรายการรับเงิน / คืนเงิน / ค่าใช้จ่าย">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as FormState['type'] }))} className={inputCls}><option value="payment">payment</option><option value="refund">refund</option><option value="expense">expense</option></select></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Method</label><select value={form.method} onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as FormState['method'] }))} className={inputCls}><option value="cash">cash</option><option value="transfer">transfer</option><option value="card">card</option><option value="other">other</option></select></div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Amount</label><input type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Date</label><input type="date" value={form.transaction_date} onChange={(e) => setForm((p) => ({ ...p, transaction_date: e.target.value }))} className={inputCls} required /></div>
          </div>
          <div><label className="mb-2 block text-xs font-medium text-slate-400">Category (optional)</label><input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputCls} /></div>
          <div><label className="mb-2 block text-xs font-medium text-slate-400">Note</label><textarea rows={3} value={form.reference_note} onChange={(e) => setForm((p) => ({ ...p, reference_note: e.target.value }))} className={inputCls + ' resize-none'} /></div>
          {error ? <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div> : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>ยกเลิก</Button>
            <Button type="submit" loading={saving}>{saving ? 'Saving...' : 'บันทึก'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
