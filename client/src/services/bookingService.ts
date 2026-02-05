import { getToken } from './authService'
import type { ApiResponse, Booking, BookingCreateInput } from '../types/booking'

const BASE_URL = 'http://localhost:3000'

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
