const express = require('express')

const { getDashboard } = require('../controllers/dashboardController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard data
 *     description: |
 *       Retrieve summary statistics for the dashboard including:
 *       - Total rooms / available / occupied
 *       - Today's bookings count
 *       - Monthly revenue and expenses
 *       - Recent bookings and transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         rooms:
 *                           type: object
 *                         bookings:
 *                           type: object
 *                         revenue:
 *                           type: object
 *                         recentBookings:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getDashboard)

module.exports = router
