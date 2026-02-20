import { getToken } from './authService'
import type { ApiResponse, StaffCreateInput, StaffUser } from '../types/staff'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getStaff(): Promise<StaffUser[]> {
  const res = await fetch(`${BASE_URL}/api/users/staff`, { headers: authHeaders() })
  const json = await parseJson<StaffUser[]>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load staff')
  return json.data
}

export async function createStaff(input: StaffCreateInput): Promise<StaffUser> {
  const res = await fetch(`${BASE_URL}/api/users/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(input),
  })
  const json = await parseJson<StaffUser>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create staff')
  return json.data
}

export async function setStaffActive(id: number, isActive: boolean): Promise<StaffUser> {
  const res = await fetch(`${BASE_URL}/api/users/staff/${id}/active`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ is_active: isActive ? 1 : 0 }),
  })
  const json = await parseJson<StaffUser>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update staff')
  return json.data
}

export async function deleteStaff(id: number): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/users/staff/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const json = await parseJson<{ id: number }>(res)
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to delete staff')
  return json.data
}
