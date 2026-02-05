export interface RecentBooking {
  id: number
  booking_code: string
  guest_full_name: string
  room_number: string
  check_in_date: string
  check_out_date: string
  total_amount: number
  status: string
}

export interface RevenueByMonthPoint {
  month: string
  revenue: number
}

export interface DashboardStats {
  totalRooms: number
  occupiedRooms: number
  totalRevenue: number
  recentBookings: RecentBooking[]
  totalBookings: number
  netProfit: number
  revenueByMonth: RevenueByMonthPoint[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
