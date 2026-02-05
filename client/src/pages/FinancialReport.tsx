import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { getFinancialReport } from '../services/reportService'
import type { FinancialMonthlyPoint, FinancialReportData } from '../types/report'
import { formatCurrencyTHB, formatNumberTH } from '../utils/format'

export default function FinancialReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FinancialReportData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const d = await getFinancialReport()
        if (!cancelled) setData(d)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load report')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const summary = data?.summary ?? { totalIncome: 0, totalExpense: 0, netProfit: 0 }
  const monthlyData: FinancialMonthlyPoint[] = data?.monthlyData ?? []

  const profitMargin = useMemo(() => {
    if (!summary.totalIncome) return 0
    return (summary.netProfit / summary.totalIncome) * 100
  }, [summary.netProfit, summary.totalIncome])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">รายงานผลประกอบการ</div>
            <div className="mt-1 text-xs text-slate-500">Financial Analytics (6 เดือนล่าสุด)</div>
          </div>

          <div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            Profit Margin: {profitMargin.toFixed(1)}%
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

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Total Income</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{formatCurrencyTHB(summary.totalIncome)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Total Expense</div>
            <div className="mt-1 text-2xl font-bold text-rose-700">{formatCurrencyTHB(summary.totalExpense)}</div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Net Profit</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">{formatCurrencyTHB(summary.netProfit)}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Income vs Expense</div>
              <div className="mt-1 text-xs text-slate-500">เปรียบเทียบรายรับ-รายจ่ายรายเดือน</div>
            </div>
          </div>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ left: 8, right: 12 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${Number(v) / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                  formatter={(value, name) => [formatCurrencyTHB(Number(value)), name === 'income' ? 'Income' : 'Expense']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Month</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Income</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Expense</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlyData.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-900">{m.month}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-emerald-700">
                      {formatCurrencyTHB(m.income)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-rose-700">
                      {formatCurrencyTHB(m.expense)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-slate-900">
                      {formatCurrencyTHB(m.profit)}
                    </td>
                  </tr>
                ))}
                {!monthlyData.length && !loading ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-xs text-slate-500" colSpan={4}>
                      No data
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-3 text-right text-xs text-slate-600">
            Total Income: <span className="font-semibold text-slate-900">{formatNumberTH(summary.totalIncome)}</span> | Total Expense:{' '}
            <span className="font-semibold text-slate-900">{formatNumberTH(summary.totalExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
