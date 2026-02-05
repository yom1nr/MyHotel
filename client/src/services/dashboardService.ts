import type { ApiResponse, DashboardStats } from '../types/dashboard'
import { getToken } from './authService'

const BASE_URL = 'http://localhost:3000'

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/api/dashboard`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data')
  }

  const json = (await res.json()) as ApiResponse<DashboardStats>

  if (!json.success) {
    throw new Error(json.message || 'Failed to fetch dashboard data')
  }

  return json.data
}
