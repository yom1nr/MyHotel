const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const txService = require('../services/transaction.service')

const getAllTransactions = asyncHandler(async (_req, res) => {
  const rows = await txService.getAllTransactions()
  return success(res, rows)
})

const getTransactionById = asyncHandler(async (req, res) => {
  const row = await txService.getTransactionById(req.params.id)
  return success(res, row)
})

const createTransaction = asyncHandler(async (req, res) => {
  const row = await txService.createTransaction(req.body)
  return created(res, row)
})

const updateTransaction = asyncHandler(async (req, res) => {
  const row = await txService.updateTransaction(req.params.id, req.body)
  return success(res, row)
})

const deleteTransaction = asyncHandler(async (req, res) => {
  const data = await txService.deleteTransaction(req.params.id)
  return success(res, data)
})

const getFinancialReport = asyncHandler(async (_req, res) => {
  const report = await txService.getFinancialReport()
  return success(res, report)
})

module.exports = { getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, getFinancialReport }
