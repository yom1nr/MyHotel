import { getToken } from './authService'
import type {
  ApiResponse,
  Transaction,
  TransactionCreateInput,
  TransactionUpdateInput,
} from '../types/transaction'

const BASE_URL = 'http://localhost:3000'

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>
  return json
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${BASE_URL}/api/transactions`, {
    headers: authHeaders(),
  })

  const json = await parseJson<Transaction[]>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to load transactions')
  }

  return json.data
}

export async function createTransaction(
  input: TransactionCreateInput
): Promise<Transaction> {
  const res = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  })

  const json = await parseJson<Transaction>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create transaction')
  }

  return json.data
}

export async function updateTransaction(
  id: number,
  input: TransactionUpdateInput
): Promise<Transaction> {
  const res = await fetch(`${BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  })

  const json = await parseJson<Transaction>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to update transaction')
  }

  return json.data
}

export async function deleteTransaction(id: number): Promise<{ id: number }> {
  const res = await fetch(`${BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })

  const json = await parseJson<{ id: number }>(res)
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to delete transaction')
  }

  return json.data
}
