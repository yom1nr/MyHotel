import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { clearToken, getCurrentUser, getRole } from '../services/authService'

type NavItem = {
  key: string
  label: string
  path: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'room_status', label: 'สถานะห้องพัก', path: '/room-status', icon: BedDouble },
  { key: 'rooms', label: 'จัดการห้องพัก', path: '/rooms', icon: BedDouble },
  { key: 'staff', label: 'จัดการพนักงาน', path: '/staff', icon: Users },
  { key: 'bookings', label: 'จัดการการจอง', path: '/bookings', icon: ClipboardList },
  { key: 'calendar', label: 'ปฏิทินห้องพัก', path: '/calendar', icon: CalendarDays },
  { key: 'attendance', label: 'เข้า-ออกงาน', path: '/attendance', icon: ShieldCheck },
  { key: 'expenses', label: 'ค่าใช้จ่าย', path: '/expenses', icon: CreditCard },
  { key: 'transactions', label: 'ธุรกรรม', path: '/transactions', icon: CreditCard },
  { key: 'reports', label: 'รายงานการเงิน', path: '/report', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentUser = useMemo(() => getCurrentUser(), [])
  const [collapsed, setCollapsed] = useState(false)

  const filteredNavItems = useMemo(() => {
    const role = (getRole() || '').toLowerCase()
    if (role === 'receptionist') {
      return navItems.filter((i) => i.key !== 'staff' && i.key !== 'reports')
    }
    if (role === 'housekeeper' || role === 'maintenance') {
      return navItems.filter((i) => i.key === 'room_status')
    }
    if (role === 'accountant') {
      return navItems.filter((i) => i.key === 'expenses' || i.key === 'transactions' || i.key === 'reports')
    }
    return navItems
  }, [])

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={
        'hidden md:flex md:flex-col shrink-0 border-r border-white/[0.06] transition-all duration-300 ' +
        (collapsed ? 'w-[72px]' : 'w-64')
      }
      style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #080d1a 100%)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
          H
        </div>
        {!collapsed && (
          <div className="leading-tight overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">Hotel Admin</div>
            <div className="text-[11px] text-slate-500">Management System</div>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed((p) => !p)}
        className="mx-3 mb-2 flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
      >
        <ChevronLeft
          className={'h-4 w-4 transition-transform duration-300 ' + (collapsed ? 'rotate-180' : '')}
        />
      </button>

      <nav className="flex-1 overflow-y-auto px-3">
        <div className="space-y-0.5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path

            return (
              <Link
                key={item.key}
                to={item.path}
                className={
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ' +
                  (active
                    ? 'bg-indigo-500/15 text-indigo-300 shadow-sm shadow-indigo-500/5'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200')
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={
                    'h-[18px] w-[18px] shrink-0 transition-colors ' +
                    (active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')
                  }
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="px-3 pb-4">
        {!collapsed ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-xs font-bold text-indigo-300">
                {(currentUser?.fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-slate-200">
                  {currentUser?.fullName || 'User'}
                </div>
                <div className="truncate text-[11px] text-slate-500">
                  {currentUser?.email || '-'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
