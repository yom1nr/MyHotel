import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import type { Transaction, TransactionCreateInput } from '../types/transaction'
import { createTransaction, deleteTransaction, getTransactions } from '../services/transactionService'
import { formatCurrencyTHB, formatDateShort } from '../utils/format'

type FormState = {
  type: TransactionCreateInput['type']
  method: TransactionCreateInput['method']
  amount: string
  category: string
  transaction_date: string
  reference_note: string
}

function emptyForm(): FormState {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')

  return {
    type: 'payment',
    method: 'cash',
    amount: '',
    category: '',
    transaction_date: `${yyyy}-${mm}-${dd}`,
    reference_note: '',
  }
}

export default function Transactions() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Transaction[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  async function refresh() {
    const data = await getTransactions()
    setItems(data)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await getTransactions()
        if (!cancelled) setItems(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load transactions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const income = useMemo(
    () => items.filter((t) => t.type === 'payment').reduce((acc, t) => acc + Number(t.amount), 0),
    [items]
  )

  const refund = useMemo(
    () => items.filter((t) => t.type === 'refund').reduce((acc, t) => acc + Number(t.amount), 0),
    [items]
  )

  const expense = useMemo(
    () => items.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0),
    [items]
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      const amt = Number(form.amount)
      if (!Number.isFinite(amt) || amt <= 0) throw new Error('Invalid amount')

      await createTransaction({
        type: form.type,
        method: form.method,
        amount: amt,
        category: form.category.trim() ? form.category.trim() : null,
        transaction_date: form.transaction_date,
        reference_note: form.reference_note.trim() ? form.reference_note.trim() : null,
        status: form.type === 'payment' || form.type === 'expense' ? 'paid' : 'pending',
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">ธุรกรรม</div>
            <div className="mt-1 text-xs text-slate-500">บันทึก/ดูรายการรับเงิน คืนเงิน และค่าใช้จ่าย</div>
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
            Add Transaction
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Income</div>
            <div className="mt-1 text-xl font-bold text-orange-600">{formatCurrencyTHB(income)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Refund</div>
            <div className="mt-1 text-xl font-bold text-sky-700">{formatCurrencyTHB(refund)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Expense</div>
            <div className="mt-1 text-xl font-bold text-rose-700">{formatCurrencyTHB(expense)}</div>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Method</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{t.transaction_code}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{t.type}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{formatDateShort(t.transaction_date)}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{t.method}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-slate-900">{formatCurrencyTHB(Number(t.amount))}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={async () => {
                          const ok = window.confirm(`Delete transaction ${t.transaction_code}?`)
                          if (!ok) return
                          try {
                            setError(null)
                            await deleteTransaction(t.id)
                            await refresh()
                          } catch (e) {
                            setError(e instanceof Error ? e.message : 'Delete failed')
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">New Transaction</div>
                  <div className="mt-1 text-xs text-slate-500">บันทึกรายการรับเงิน / คืนเงิน / ค่าใช้จ่าย</div>
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
                    <label className="text-xs font-medium text-slate-600">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as FormState['type'] }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    >
                      <option value="payment">payment</option>
                      <option value="refund">refund</option>
                      <option value="expense">expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Method</label>
                    <select
                      value={form.method}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, method: e.target.value as FormState['method'] }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                    >
                      <option value="cash">cash</option>
                      <option value="transfer">transfer</option>
                      <option value="card">card</option>
                      <option value="other">other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Amount</label>
                    <input
                      type="number"
                      min={0}
                      value={form.amount}
                      onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">Date</label>
                    <input
                      type="date"
                      value={form.transaction_date}
                      onChange={(e) => setForm((p) => ({ ...p, transaction_date: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Category (optional)</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-orange-500/20 focus:ring-4"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600">Note</label>
                  <textarea
                    rows={3}
                    value={form.reference_note}
                    onChange={(e) => setForm((p) => ({ ...p, reference_note: e.target.value }))}
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
                    onClick={() => setModalOpen(false)}
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
    </div>
  )
}
