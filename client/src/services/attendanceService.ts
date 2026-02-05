import { getToken } from './authService'
import type { ApiResponse, AttendanceRecord } from '../types/attendance'

const BASE_URL = 'http://localhost:3000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const res = await fetch(`${BASE_URL}/api/attendance`, { headers: authHeaders() })
  const json = await parseJson<AttendanceRecord[]>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load attendance')
  return json.data
}

export async function getMyTodayAttendance(): Promise<AttendanceRecord | null> {
  const res = await fetch(`${BASE_URL}/api/attendance/me/today`, { headers: authHeaders() })
  const json = await parseJson<AttendanceRecord | null>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load attendance')
  return json.data
}

export async function clockIn(): Promise<AttendanceRecord> {
  const res = await fetch(`${BASE_URL}/api/attendance/clock-in`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await parseJson<AttendanceRecord>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Clock-in failed')
  return json.data
}

export async function clockOut(): Promise<AttendanceRecord> {
  const res = await fetch(`${BASE_URL}/api/attendance/clock-out`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await parseJson<AttendanceRecord>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Clock-out failed')
  return json.data
}
