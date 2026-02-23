import { getToken } from './authService'
import type { ApiResponse, Booking, BookingCreateInput } from '../types/booking'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    headers: authHeaders(),
  })

  const json = await parseJson<Booking[]>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load bookings')
  }

  return json.data
}

export async function updateBookingStatus(
  id: number,
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/api/bookings/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  })

  const json = await parseJson<Booking>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update booking status')
  }

  return json.data
}

export async function createBooking(input: BookingCreateInput): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  })

  const json = await parseJson<Booking>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create booking')
  }

  return json.data
}

export async function createPublicBooking(input: {
  room_id: number
  check_in_date: string
  check_out_date: string
  guest_name: string
  guest_phone: string
  guest_email?: string | null
}): Promise<{ booking_code: string }> {
  const res = await fetch(`${BASE_URL}/api/public/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const json = (await res.json()) as { success: boolean; data?: { booking_code: string }; message?: string }
  if (!res.ok || !json.success || !json.data?.booking_code) {
    throw new Error(json.message || 'Failed to create public booking')
  }

  return json.data
}
