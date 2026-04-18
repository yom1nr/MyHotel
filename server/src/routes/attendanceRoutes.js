const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
  clockIn,
  clockOut,
  getAttendanceHistory,
  getMyTodayAttendance,
} = require('../controllers/attendanceController')

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance history
 *     description: Retrieve attendance records for all staff members.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance history
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAttendanceHistory)

/**
 * @swagger
 * /api/attendance/me/today:
 *   get:
 *     tags: [Attendance]
 *     summary: Get my today's attendance
 *     description: Retrieve the current user's attendance record for today.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Today's attendance record (or null if not clocked in)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 */
router.get('/me/today', getMyTodayAttendance)

/**
 * @swagger
 * /api/attendance/clock-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Clock in
 *     description: Record clock-in time for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Clock-in recorded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Already clocked in today
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-in', clockIn)

/**
 * @swagger
 * /api/attendance/clock-out:
 *   post:
 *     tags: [Attendance]
 *     summary: Clock out
 *     description: Record clock-out time for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clock-out recorded
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - properties:
 *                     data:
 *                       $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Not clocked in yet
 *       401:
 *         description: Unauthorized
 */
router.post('/clock-out', clockOut)

module.exports = router
