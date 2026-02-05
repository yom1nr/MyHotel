export type AttendanceStatus = 'on_time' | 'late'

export interface AttendanceRecord {
  id: number
  user_id: number
  full_name: string
  staff_position: 'reception' | 'housekeeper' | null
  work_date: string
  clock_in_time: string
  clock_out_time: string | null
  hours_worked: number | null
  status: AttendanceStatus
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
