import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import type { Transaction } from '../types/transaction'
import { createTransaction, getTransactions } from '../services/transactionService'
import { formatCurrencyTHB, formatDateShort } from '../utils/format'

type ExpenseFormState = {
  category: string
  amount: string
  note: string
}

function emptyForm(): ExpenseFormState {
  return { category: '', amount: '', note: '' }
}

export default function Expenses() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ExpenseFormState>(emptyForm)

  async function refresh() {
    const data = await getTransactions()
    setTransactions(data)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getTransactions()
        if (!cancelled) setTransactions(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load expenses')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'payment')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Number(t.amount), 0)

    return { income, expense }
  }, [transactions])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      if (!form.category.trim()) throw new Error('Category is required')
      const amt = Number(form.amount)
      if (!Number.isFinite(amt) || amt <= 0) throw new Error('Invalid amount')

      await createTransaction({
        type: 'expense',
        category: form.category.trim(),
        amount: amt,
        method: 'cash',
        status: 'paid',
        reference_note: form.note.trim() ? form.note.trim() : null,
      })

      await refresh()
      setModalOpen(false)
      setForm(emptyForm())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const expenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions]
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">ค่าใช้จ่าย</div>
            <div className="mt-1 text-xs text-slate-500">สรุปรายรับและรายจ่าย พร้อมบันทึกค่าใช้จ่าย</div>
          </div>

          <button
            onClick={() => {
              setForm(emptyForm())
              setError(null)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-sm shadow-orange-500/20 hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Total Income</div>
            <div className="mt-1 text-xl font-bold text-orange-600">{formatCurrencyTHB(summary.income)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Total Expenses</div>
            <div className="mt-1 text-xl font-bold text-rose-700">{formatCurrencyTHB(summary.expense)}</div>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Note</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-700">
                      {formatDateShort(String(t.transaction_date))}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.category || '-'}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{t.reference_note || '-'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-rose-700">
                      {formatCurrencyTHB(Number(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Add Expense</div>
                <div className="mt-1 text-xs text-slate-500">Category, amount, and note</div>
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
                  <label className="text-xs font-medium text-slate-600">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Water bill"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="1200"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600">Note</label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Optional note"
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
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
