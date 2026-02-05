import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { getCurrentUser, getRole } from '../services/authService'

import styles from '../pages/Dashboard.module.css'

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
  { key: 'reports', label: 'รายงานกำไร/ขาดทุน', path: '/report', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const currentUser = useMemo(() => getCurrentUser(), [])

  const filteredNavItems = useMemo(() => {
    const role = (getRole() || '').toLowerCase()

    if (role === 'receptionist') {
      return navItems.filter((item) => item.key !== 'staff' && item.key !== 'reports')
    }

    if (role === 'housekeeper' || role === 'maintenance') {
      return navItems.filter((item) => item.key === 'room_status')
    }

    if (role === 'accountant') {
      return navItems.filter((item) => item.key === 'expenses' || item.key === 'transactions' || item.key === 'reports')
    }

    return navItems
  }, [])

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarLogo}>
          <img src="/logo.svg" alt="Hotel Logo" className="h-6 w-6" />
        </div>
        <div className={styles.sidebarBrandText}>
          <div className={styles.sidebarTitle}>Hotel Admin</div>
          <div className={styles.sidebarSubtitle}>Management System</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navList}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const active = item.path !== '#' && location.pathname === item.path

            if (item.path === '#') {
              return (
                <a
                  key={item.key}
                  href="#"
                  className={styles.navItemBase + ' ' + styles.navItemInactive}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              )
            }

            return (
              <Link
                key={item.key}
                to={item.path}
                className={
                  styles.navItemBase +
                  ' ' +
                  (active ? styles.navItemActive : styles.navItemInactive)
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.sidebarFooterCard}>
          <div className={styles.sidebarFooterLabel}>{currentUser?.fullName || 'User'}</div>
          <div className={styles.sidebarFooterEmail}>{currentUser?.email || '-'}</div>
        </div>
      </div>
    </aside>
  )
}
