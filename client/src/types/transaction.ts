export type TransactionType = 'payment' | 'refund' | 'expense'
export type TransactionMethod = 'cash' | 'transfer' | 'card' | 'other'
export type TransactionStatus = 'pending' | 'paid' | 'cancelled'

export interface Transaction {
  id: number
  booking_id: number | null
  transaction_code: string
  type: TransactionType
  category: string | null
  method: TransactionMethod
  amount: number
  status: TransactionStatus
  transaction_date: string
  reference_note: string | null
  created_at: string
  updated_at: string

  booking_code?: string | null
  guest_full_name?: string | null
}

export interface TransactionCreateInput {
  booking_id?: number | null
  type: TransactionType
  category?: string | null
  method?: TransactionMethod
  amount: number
  status?: TransactionStatus
  transaction_date?: string
  reference_note?: string | null
}

export interface TransactionUpdateInput {
  booking_id?: number | null
  type?: TransactionType
  category?: string | null
  method?: TransactionMethod
  amount?: number
  status?: TransactionStatus
  transaction_date?: string
  reference_note?: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
