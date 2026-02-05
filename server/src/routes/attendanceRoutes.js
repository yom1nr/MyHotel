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

router.get('/', getAttendanceHistory)
router.get('/me/today', getMyTodayAttendance)
router.post('/clock-in', clockIn)
router.post('/clock-out', clockOut)

module.exports = router
