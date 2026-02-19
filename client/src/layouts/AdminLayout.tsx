import { Outlet } from 'react-router-dom'

import Sidebar from '../components/Sidebar'

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-navy-900 text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
