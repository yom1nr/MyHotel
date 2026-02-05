import { getToken } from './authService'
import type { ApiResponse, FinancialReportData } from '../types/report'

const BASE_URL = 'http://localhost:3000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getFinancialReport(): Promise<FinancialReportData> {
  const res = await fetch(`${BASE_URL}/api/reports/financial`, {
    headers: authHeaders(),
  })

  const json = await parseJson<FinancialReportData>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load financial report')
  }

  return json.data
}
