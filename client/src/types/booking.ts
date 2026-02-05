export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export interface Booking {
  id: number
  booking_code: string
  user_id: number | null
  guest_full_name: string
  guest_phone: string | null
  guest_email: string | null
  room_id: number
  check_in_date: string
  check_out_date: string
  nights: number
  total_amount: number
  status: BookingStatus
  notes: string | null
  created_at: string
  updated_at: string

  room_number: string
  room_type: 'standard' | 'deluxe' | 'suite'
  base_price: number

  user_full_name: string | null
  user_email: string | null
}

export interface BookingCreateInput {
  room_id: number
  check_in_date: string
  check_out_date: string
  guest_full_name: string
  guest_phone?: string | null
  guest_email?: string | null
  notes?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
