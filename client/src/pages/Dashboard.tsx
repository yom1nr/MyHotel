import {
  BedDouble,
  ClipboardList,
  CreditCard,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import StatCard from '../components/StatCard'
import PageHeader from '../components/ui/PageHeader'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { fetchDashboardStats } from '../services/dashboardService'
import type { DashboardStats, RecentBooking } from '../types/dashboard'
import { formatCurrencyTHB, formatDateShort, formatNumberTH } from '../utils/format'

function formatMonthLabel(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(d)
  return month.replace('.', '')
}

function badgeForStatus(status: string) {
  const s = status.toLowerCase()
  if (s === 'confirmed' || s === 'checked_in' || s === 'paid')
    return { label: 'ยืนยันแล้ว', variant: 'emerald' as const }
  if (s === 'pending')
    return { label: 'รอดำเนินการ', variant: 'amber' as const }
  if (s === 'cancelled')
    return { label: 'ยกเลิก', variant: 'rose' as const }
  if (s === 'checked_out')
    return { label: 'เช็คเอาท์แล้ว', variant: 'slate' as const }
  return { label: status, variant: 'slate' as const }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDashboardStats()
        if (!cancelled) setStats(data)
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load dashboard'
        if (!cancelled) {
          setStats(null)
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const totalRooms = stats?.totalRooms ?? 0
  const occupiedRooms = stats?.occupiedRooms ?? 0
  const availableRooms = Math.max(totalRooms - occupiedRooms, 0)
  const totalRevenue = stats?.totalRevenue ?? 0
  const recentBookings: RecentBooking[] = stats?.recentBookings ?? []
  const totalBookings = stats?.totalBookings ?? 0
  const revenueByMonth = useMemo(
    () => (stats?.revenueByMonth ?? []).map((p) => ({ month: formatMonthLabel(p.month), revenue: p.revenue })),
    [stats?.revenueByMonth]
  )

  const kpiCards = useMemo(
    () => [
      {
        label: 'ห้องว่าง',
        value: availableRooms,
        sub: `จากทั้งหมด ${totalRooms}`,
        icon: BedDouble,
        gradient: 'from-emerald-500 to-teal-500',
        progress: totalRooms ? (availableRooms / totalRooms) * 100 : 0,
      },
      {
        label: 'ห้องเข้าพัก',
        value: occupiedRooms,
        sub: `จากทั้งหมด ${totalRooms}`,
        icon: Users,
        gradient: 'from-blue-500 to-indigo-500',
        progress: totalRooms ? (occupiedRooms / totalRooms) * 100 : 0,
      },
      {
        label: 'รายได้รวม',
        value: formatNumberTH(totalRevenue),
        sub: 'บาท',
        icon: CreditCard,
        gradient: 'from-amber-500 to-orange-500',
        progress: 75,
      },
      {
        label: 'การจองทั้งหมด',
        value: totalBookings,
        sub: 'รายการ',
        icon: ClipboardList,
        gradient: 'from-indigo-500 to-purple-500',
        progress: 30,
      },
    ] as const,
    [availableRooms, occupiedRooms, totalBookings, totalRevenue, totalRooms]
  )

  const roomStatus = useMemo(
    () => [
      { name: 'ว่าง', value: availableRooms, color: '#34d399' },
      { name: 'เข้าพัก', value: occupiedRooms, color: '#6366f1' },
    ].filter((x) => x.value > 0),
    [availableRooms, occupiedRooms]
  )

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="ภาพรวมระบบของห้องพัก" />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="space-y-3">
              <Skeleton height="h-3" width="w-20" />
              <Skeleton height="h-7" width="w-32" />
              <Skeleton height="h-1.5" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" subtitle="ภาพรวมระบบของห้องพัก" />

      {error ? (
        <Card className="mt-6 border-rose-500/20">
          <div className="text-sm font-semibold text-rose-400">โหลดข้อมูลไม่สำเร็จ</div>
          <div className="mt-1 text-xs text-slate-400">{error}</div>
        </Card>
      ) : null}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            sub={card.sub}
            icon={card.icon}
            accentClassName=""
            gradient={card.gradient}
            progressPercent={card.progress}
          />
        ))}
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">รายได้รายเดือน</div>
              <div className="text-xs text-slate-500">ภาพรวมรายได้ 6 เดือนล่าสุด</div>
            </div>
            <Badge variant="indigo">6 เดือน</Badge>
          </div>

          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={revenueByMonth} margin={{ left: 4, right: 10 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                  contentStyle={{ background: '#141c32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                  formatter={(value) => [formatCurrencyTHB(Number(value)), 'รายได้']}
                  labelFormatter={(label) => `เดือน ${label}`}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div>
            <div className="text-sm font-semibold text-white">สถานะห้องพัก</div>
            <div className="text-xs text-slate-500">สัดส่วนห้องตามสถานะ</div>
          </div>

          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={roomStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {roomStatus.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#141c32', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                  formatter={(v) => [`${v} ห้อง`, 'จำนวน']}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center">
            <div className="text-xs text-slate-500">รวมทั้งหมด</div>
            <div className="mt-1 text-xl font-bold text-white">{totalRooms} ห้อง</div>
          </div>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">การจองล่าสุด</div>
            <div className="text-xs text-slate-500">รายการล่าสุดในระบบ</div>
          </div>
          <Link to="/bookings">
            <Button variant="secondary" size="sm">ดูทั้งหมด</Button>
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                <th className="whitespace-nowrap py-3 pr-6 font-medium">รหัส</th>
                <th className="whitespace-nowrap py-3 pr-6 font-medium">ผู้เข้าพัก</th>
                <th className="whitespace-nowrap py-3 pr-6 font-medium">ห้อง</th>
                <th className="whitespace-nowrap py-3 pr-6 font-medium">วันที่</th>
                <th className="whitespace-nowrap py-3 pr-6 font-medium">ราคา</th>
                <th className="whitespace-nowrap py-3 pr-6 font-medium">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentBookings.map((b) => {
                const badge = badgeForStatus(b.status)
                return (
                  <tr key={b.booking_code} className="text-slate-300 transition hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap py-3 pr-6 font-semibold text-white">{b.booking_code}</td>
                    <td className="whitespace-nowrap py-3 pr-6">{b.guest_full_name}</td>
                    <td className="whitespace-nowrap py-3 pr-6">{b.room_number}</td>
                    <td className="whitespace-nowrap py-3 pr-6">{formatDateShort(b.check_in_date)}</td>
                    <td className="whitespace-nowrap py-3 pr-6">{formatCurrencyTHB(Number(b.total_amount || 0))}</td>
                    <td className="whitespace-nowrap py-3 pr-6">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
