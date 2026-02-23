import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { getFinancialReport } from '../services/reportService'
import type { FinancialMonthlyPoint, FinancialReportData } from '../types/report'
import { formatCurrencyTHB, formatNumberTH } from '../utils/format'

import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

export default function FinancialReport() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<FinancialReportData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try { setLoading(true); setError(null); const d = await getFinancialReport(); if (!cancelled) setData(d) }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load report') }
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const summary = data?.summary ?? { totalIncome: 0, totalExpense: 0, netProfit: 0 }
  const monthlyData: FinancialMonthlyPoint[] = data?.monthlyData ?? []
  const profitMargin = useMemo(() => (!summary.totalIncome ? 0 : (summary.netProfit / summary.totalIncome) * 100), [summary.netProfit, summary.totalIncome])

  return (
    <div className="animate-fade-in">
      <PageHeader title="รายงานผลประกอบการ" subtitle="Financial Analytics (6 เดือนล่าสุด)" actions={
        <Badge variant="indigo">Profit Margin: {profitMargin.toFixed(1)}%</Badge>
      } />

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Card key={i} className="space-y-3"><Skeleton height="h-3" width="w-20" /><Skeleton height="h-7" width="w-32" /></Card>)}
        </div>
      ) : error ? (
        <Card className="mt-6 border-rose-500/20"><div className="text-sm font-semibold text-rose-400">เกิดข้อผิดพลาด</div><div className="mt-1 text-xs text-slate-400">{error}</div></Card>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card glow="emerald"><div className="text-xs text-slate-400">Total Income</div><div className="mt-1 text-2xl font-bold text-emerald-400">{formatCurrencyTHB(summary.totalIncome)}</div></Card>
        <Card><div className="text-xs text-slate-400">Total Expense</div><div className="mt-1 text-2xl font-bold text-rose-400">{formatCurrencyTHB(summary.totalExpense)}</div></Card>
        <Card glow="indigo"><div className="text-xs text-slate-400">Net Profit</div><div className="mt-1 text-2xl font-bold text-indigo-400">{formatCurrencyTHB(summary.netProfit)}</div></Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Income vs Expense</div>
            <div className="text-xs text-slate-500">เปรียบเทียบรายรับ-รายจ่ายรายเดือน</div>
          </div>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <BarChart data={monthlyData} margin={{ left: 8, right: 12 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${Number(v) / 1000}k`} />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                contentStyle={{ background: '#141c32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                formatter={(value, name) => [formatCurrencyTHB(Number(value)), name === 'income' ? 'Income' : 'Expense']}
              />
              <Bar dataKey="income" fill="#34d399" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#fb7185" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 text-right font-medium">Income</th>
                <th className="px-4 py-3 text-right font-medium">Expense</th>
                <th className="px-4 py-3 text-right font-medium">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {monthlyData.map((m) => (
                <tr key={m.month} className="text-slate-300 transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs font-semibold text-white">{m.month}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-emerald-400">{formatCurrencyTHB(m.income)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-rose-400">{formatCurrencyTHB(m.expense)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold text-white">{formatCurrencyTHB(m.profit)}</td>
                </tr>
              ))}
              {!monthlyData.length && !loading ? (
                <tr><td className="px-4 py-6 text-center text-xs text-slate-500" colSpan={4}>No data</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="border-t border-white/[0.06] px-4 py-3 text-right text-xs text-slate-500">
          Total Income: <span className="font-semibold text-white">{formatNumberTH(summary.totalIncome)}</span> | Total Expense: <span className="font-semibold text-white">{formatNumberTH(summary.totalExpense)}</span>
        </div>
      </Card>
    </div>
  )
}
