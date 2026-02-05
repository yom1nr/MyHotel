export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'
export type RoomType = 'standard' | 'deluxe' | 'suite'

export interface Room {
  id: number
  room_number: string
  room_type: RoomType
  floor: number | null
  capacity_adults: number
  capacity_children: number
  base_price: number
  status: RoomStatus
  description: string | null
  created_at: string
  updated_at: string
}

export interface RoomCreateInput {
  room_number: string
  room_type?: RoomType
  floor?: number | null
  capacity_adults?: number
  capacity_children?: number
  base_price: number
  status?: RoomStatus
  description?: string | null
}

export interface RoomUpdateInput {
  room_number?: string
  room_type?: RoomType
  floor?: number | null
  capacity_adults?: number
  capacity_children?: number
  base_price?: number
  status?: RoomStatus
  description?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
