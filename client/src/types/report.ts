export interface FinancialSummary {
  totalIncome: number
  totalExpense: number
  netProfit: number
}

export interface FinancialMonthlyPoint {
  month: string
  income: number
  expense: number
  profit: number
}

export interface FinancialReportData {
  summary: FinancialSummary
  monthlyData: FinancialMonthlyPoint[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
