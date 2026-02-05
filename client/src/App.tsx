import { Navigate, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './layouts/AdminLayout'
import Booking from './pages/Booking'
import Attendance from './pages/Attendance'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import FinancialReport from './pages/FinancialReport'
import Transactions from './pages/Transactions'
import RoomStatusPage from './pages/RoomStatus'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import CustomerHome from './pages/client/CustomerHome'
import BookingStatus from './pages/client/BookingStatus'
import GuestBooking from './pages/client/GuestBooking'
import RoomCalendar from './pages/RoomCalendar'
import RoomManagement from './pages/RoomManagement'
import Staff from './pages/Staff'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LandingPage />} />
      <Route path="/staff/login" element={<Login />} />
      <Route path="/booking-status" element={<BookingStatus />} />
      <Route path="/" element={<CustomerHome />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/book" element={<GuestBooking />} />

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rooms" element={<RoomManagement />} />
        <Route path="/room-status" element={<RoomStatusPage />} />
        <Route path="/calendar" element={<RoomCalendar />} />
        <Route path="/bookings" element={<Booking />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route
          path="/staff"
          element={
            <AdminRoute>
              <Staff />
            </AdminRoute>
          }
        />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/report" element={<FinancialReport />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
