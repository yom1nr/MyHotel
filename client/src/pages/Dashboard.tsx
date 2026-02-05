import {
  BedDouble,
  ClipboardList,
  CreditCard,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { fetchDashboardStats } from '../services/dashboardService'
import { clearToken } from '../services/authService'
import type { DashboardStats, RecentBooking } from '../types/dashboard'
import { formatCurrencyTHB, formatDateShort, formatNumberTH } from '../utils/format'

import styles from './Dashboard.module.css'

function formatMonthLabel(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  const month = new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(d)
  return month.replace('.', '')
}

function badgeForStatus(status: string) {
  const s = status.toLowerCase()

  if (s === 'confirmed' || s === 'checked_in' || s === 'paid') {
    return {
      label: 'ยืนยันแล้ว',
      badge: 'bg-orange-50 text-orange-700 ring-orange-200',
    }
  }

  if (s === 'pending') {
    return {
      label: 'รอดำเนินการ',
      badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    }
  }

  if (s === 'cancelled') {
    return {
      label: 'ยกเลิก',
      badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    }
  }

  if (s === 'checked_out') {
    return {
      label: 'เช็คเอาท์แล้ว',
      badge: 'bg-slate-50 text-slate-700 ring-slate-200',
    }
  }

  return {
    label: status,
    badge: 'bg-slate-50 text-slate-700 ring-slate-200',
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
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
    return () => {
      cancelled = true
    }
  }, [])

  const totalRooms = stats?.totalRooms ?? 0
  const occupiedRooms = stats?.occupiedRooms ?? 0
  const availableRooms = Math.max(totalRooms - occupiedRooms, 0)
  const totalRevenue = stats?.totalRevenue ?? 0
  const recentBookings: RecentBooking[] = stats?.recentBookings ?? []
  const totalBookings = stats?.totalBookings ?? 0
  const netProfit = stats?.netProfit ?? 0
  const revenueByMonth = useMemo(
    () => (stats?.revenueByMonth ?? []).map((p) => ({ month: formatMonthLabel(p.month), revenue: p.revenue })),
    [stats?.revenueByMonth]
  )

  const kpiCards = useMemo(
    () =>
      [
        {
          label: 'ห้องว่าง',
          value: availableRooms,
          sub: `จากทั้งหมด ${totalRooms}`,
          accent: 'bg-orange-500',
          icon: BedDouble,
        },
        {
          label: 'ห้องเข้าพัก',
          value: occupiedRooms,
          sub: `จากทั้งหมด ${totalRooms}`,
          accent: 'bg-blue-600',
          icon: Users,
        },
        {
          label: 'รายได้รวม',
          value: formatNumberTH(totalRevenue),
          sub: 'บาท',
          accent: 'bg-amber-500',
          icon: CreditCard,
        },
        {
          label: 'การจองทั้งหมด',
          value: totalBookings,
          sub: 'รายการทั้งหมด',
          accent: 'bg-violet-600',
          icon: ClipboardList,
        },
      ] as const,
    [availableRooms, netProfit, occupiedRooms, totalBookings, totalRevenue, totalRooms]
  )

  const roomStatus = useMemo(
    () =>
      [
        { name: 'ว่าง', value: availableRooms, color: '#10b981' },
        { name: 'เข้าพัก', value: occupiedRooms, color: '#3b82f6' },
      ].filter((x) => x.value > 0),
    [availableRooms, occupiedRooms]
  )

  return (
    <div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <div className={styles.headerTitle}>Dashboard</div>
            <div className={styles.headerSubtitle}>ภาพรวมระบบของห้องพัก</div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.statusPill}>
              <span className={styles.onlineDot} />
              <span>ออนไลน์</span>
            </div>
            <button className={styles.primaryBtn}>+ เพิ่มรายการ</button>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                clearToken()
                navigate('/login', { replace: true })
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            Loading...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-200">
            <div className="text-sm font-semibold text-rose-700">โหลดข้อมูลไม่สำเร็จ</div>
            <div className="mt-1 text-xs text-slate-600">{error}</div>
          </div>
        ) : null}

        <section className={styles.kpiGrid}>
          {kpiCards.map((card) => {
            return (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                sub={card.sub}
                icon={card.icon}
                accentClassName={card.accent}
                progressPercent={
                  card.label === 'ห้องว่าง'
                    ? totalRooms
                      ? (availableRooms / totalRooms) * 100
                      : 0
                    : card.label === 'ห้องเข้าพัก'
                      ? totalRooms
                        ? (occupiedRooms / totalRooms) * 100
                        : 0
                      : card.label === 'รายได้รวม'
                        ? 75
                        : 30
                }
              />
            )
          })}
        </section>

        <section className={styles.sectionGrid}>
          <div className={styles.card + ' ' + styles.sectionSpan2}>
            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionTitle}>รายได้รายเดือน</div>
                <div className={styles.sectionSubtitle}>ภาพรวมรายได้ 6 เดือนล่าสุด</div>
              </div>
              <div className={styles.chip}>6 เดือน</div>
            </div>

            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth} margin={{ left: 4, right: 10 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                    formatter={(value) => [formatCurrencyTHB(Number(value)), 'รายได้']}
                    labelFormatter={(label) => `เดือน ${label}`}
                  />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.card}>
            <div>
              <div className={styles.sectionTitle}>สถานะห้องพัก</div>
              <div className={styles.sectionSubtitle}>สัดส่วนห้องตามสถานะ</div>
            </div>

            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={2}
                    stroke="transparent"
                  >
                    {roomStatus.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} ห้อง`, 'จำนวน']} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.donutFooter}>
              <div className={styles.donutFooterLabel} style={{ marginBottom: '1.25rem' }}>
                รวมทั้งหมด
              </div>
              <div className={styles.donutFooterValue}>{totalRooms}ห้อง</div>
            </div>
          </div>
        </section>

        <section className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <div>
              <div className={styles.sectionTitle}>การจองล่าสุด</div>
              <div className={styles.sectionSubtitle}>รายการล่าสุดในระบบ</div>
            </div>
            <Link to="/bookings" className={styles.secondaryBtn}>
              ดูทั้งหมด
            </Link>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.th}>รหัส</th>
                  <th className={styles.th}>ผู้เข้าพัก</th>
                  <th className={styles.th}>ห้อง</th>
                  <th className={styles.th}>วันที่</th>
                  <th className={styles.th}>ราคา</th>
                  <th className={styles.th}>สถานะ</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {recentBookings.map((b) => {
                  const badge = badgeForStatus(b.status)
                  return (
                    <tr key={b.booking_code} className={styles.tr}>
                      <td className={styles.tdStrong}>{b.booking_code}</td>
                      <td className={styles.td}>{b.guest_full_name}</td>
                      <td className={styles.td}>{b.room_number}</td>
                      <td className={styles.td}>{formatDateShort(b.check_in_date)}</td>
                      <td className={styles.td}>
                        {formatCurrencyTHB(Number(b.total_amount || 0))}
                      </td>
                      <td className={styles.td}>
                        <span
                          className={
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ' +
                            badge.badge
                          }
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
