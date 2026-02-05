export type StaffRole =
  | 'admin'
  | 'manager'
  | 'receptionist'
  | 'housekeeper'
  | 'maintenance'
  | 'accountant'

export interface StaffUser {
  id: number
  full_name: string
  email: string
  role: StaffRole
  staff_position: null
  phone: string | null
  is_active: 0 | 1
  created_at: string
  updated_at: string
}

export interface StaffCreateInput {
  full_name: string
  email: string
  password: string
  role: StaffRole
  phone?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
