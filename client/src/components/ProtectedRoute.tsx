import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { isAuthenticated } from '../services/authService'
import ClockWidget from './ClockWidget'

type Props = {
  children: ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)]">
        <ClockWidget />
      </div>
    </>
  )
}
