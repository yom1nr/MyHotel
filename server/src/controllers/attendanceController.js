const asyncHandler = require('../utils/asyncHandler')
const { success, created } = require('../utils/apiResponse')
const attendanceService = require('../services/attendance.service')

const clockIn = asyncHandler(async (req, res) => {
  const userId = req.user?.sub ? Number(req.user.sub) : 0
  const record = await attendanceService.clockIn(userId)
  return created(res, record)
})

const clockOut = asyncHandler(async (req, res) => {
  const userId = req.user?.sub ? Number(req.user.sub) : 0
  const record = await attendanceService.clockOut(userId)
  return success(res, record)
})

const getAttendanceHistory = asyncHandler(async (_req, res) => {
  const rows = await attendanceService.getAttendanceHistory()
  return success(res, rows)
})

const getMyTodayAttendance = asyncHandler(async (req, res) => {
  const userId = req.user?.sub ? Number(req.user.sub) : 0
  const record = await attendanceService.getMyTodayAttendance(userId)
  return success(res, record)
})

module.exports = { clockIn, clockOut, getAttendanceHistory, getMyTodayAttendance }
