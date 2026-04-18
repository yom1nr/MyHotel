const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { getFinancialReport } = require('../controllers/transactionController')

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/reports/financial:
 *   get:
 *     tags: [Reports]
 *     summary: Get financial report
 *     description: |
 *       Generate a financial summary report including:
 *       - Total income, expenses, and net profit
 *       - Monthly breakdown of revenue and expenses
 *       - Payment method distribution
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial report data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpenses:
 *                           type: number
 *                         netProfit:
 *                           type: number
 *                         monthlyData:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/financial', getFinancialReport)

module.exports = router
