import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { getRole, isAuthenticated } from '../services/authService'

type Props = {
  children: ReactNode
}

export default function AdminRoute({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const role = getRole()
  if (role !== 'admin' && role !== 'manager') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
