const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transaction.schema')
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', getAllTransactions)
router.get('/:id', getTransactionById)
router.post('/', validate(createTransactionSchema), createTransaction)
router.put('/:id', validate(updateTransactionSchema), updateTransaction)
router.delete('/:id', deleteTransaction)

module.exports = router
