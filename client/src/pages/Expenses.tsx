import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import type { Transaction } from '../types/transaction'
import { createTransaction, getTransactions } from '../services/transactionService'
import { formatCurrencyTHB } from '../utils/format'

import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'

type ExpenseFormState = { category: string; amount: string; note: string }
function emptyForm(): ExpenseFormState { return { category: '', amount: '', note: '' } }

export default function Expenses() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ExpenseFormState>(emptyForm)

  async function refresh() { setTransactions(await getTransactions()) }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getTransactions(); if (!cancelled) setTransactions(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load expenses') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const summary = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'payment' && t.status === 'paid').reduce((a, t) => a + Number(t.amount), 0)
    const expense = transactions.filter((t) => t.type === 'expense' && t.status === 'paid').reduce((a, t) => a + Number(t.amount), 0)
    return { income, expense }
  }, [transactions])

  const expenses = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setSaving(true); setError(null)
      if (!form.category.trim()) throw new Error('Category is required')
      const amt = Number(form.amount)
      if (!Number.isFinite(amt) || amt <= 0) throw new Error('Invalid amount')
      await createTransaction({ type: 'expense', category: form.category.trim(), amount: amt, method: 'cash', status: 'paid', reference_note: form.note.trim() || null })
      await refresh(); setModalOpen(false); setForm(emptyForm()); toast.success('บันทึกสำเร็จ')
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setSaving(false) }
  }

  const inputCls = 'w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'

  return (
    <div className="animate-fade-in">
      <PageHeader title="ค่าใช้จ่าย" subtitle="สรุปรายรับและรายจ่าย พร้อมบันทึกค่าใช้จ่าย" actions={
        <Button onClick={() => { setForm(emptyForm()); setError(null); setModalOpen(true) }} icon={<Plus className="h-4 w-4" />}>Add Expense</Button>
      } />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card glow="emerald"><div className="text-xs text-slate-400">Total Income</div><div className="mt-1 text-xl font-bold text-emerald-400">{formatCurrencyTHB(summary.income)}</div></Card>
        <Card glow="indigo"><div className="text-xs text-slate-400">Total Expenses</div><div className="mt-1 text-xl font-bold text-rose-400">{formatCurrencyTHB(summary.expense)}</div></Card>
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
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Note</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {expenses.map((t) => (
                <tr key={t.id} className="text-slate-300 transition hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{String(t.transaction_date).slice(0, 10)}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-white">{t.category || '-'}</td>
                  <td className="px-4 py-3 text-xs">{t.reference_note || '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-rose-400">{formatCurrencyTHB(Number(t.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title="Add Expense" subtitle="Category, amount, and note" maxWidth="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Category</label><input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Water bill" className={inputCls} required /></div>
            <div><label className="mb-2 block text-xs font-medium text-slate-400">Amount</label><input type="number" min={0} value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="1200" className={inputCls} required /></div>
          </div>
          <div><label className="mb-2 block text-xs font-medium text-slate-400">Note</label><textarea rows={3} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Optional note" className={inputCls + ' resize-none'} /></div>
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
