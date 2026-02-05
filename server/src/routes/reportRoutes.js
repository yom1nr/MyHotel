const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { getFinancialReport } = require('../controllers/transactionController')

const router = express.Router()

router.use(authMiddleware)

router.get('/financial', getFinancialReport)

module.exports = router
