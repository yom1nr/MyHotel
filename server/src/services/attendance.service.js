const db = require('../config/db')
const { NotFoundError, AppError } = require('../utils/AppError')

function isLate(clockInDate, thresholdHour = 9, thresholdMinute = 0) {
    const h = clockInDate.getHours()
    const m = clockInDate.getMinutes()
    return h > thresholdHour || (h === thresholdHour && m > thresholdMinute)
}

async function clockIn(userId) {
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const now = new Date()
    const workDate = now.toISOString().slice(0, 10)

    const [[existing]] = await db.query(
        'SELECT id FROM attendance WHERE user_id = ? AND work_date = ? LIMIT 1',
        [userId, workDate]
    )
    if (existing?.id) throw new AppError('Already clocked in for today', 409, 'DUPLICATE')

    const status = isLate(now) ? 'late' : 'on_time'

    const [result] = await db.query('INSERT INTO attendance SET ?', {
        user_id: userId,
        work_date: workDate,
        clock_in_time: now,
        status,
    })

    return getAttendanceRecord(result.insertId)
}

async function clockOut(userId) {
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const now = new Date()
    const workDate = now.toISOString().slice(0, 10)

    const [[record]] = await db.query(
        'SELECT id, clock_in_time, clock_out_time FROM attendance WHERE user_id = ? AND work_date = ? LIMIT 1',
        [userId, workDate]
    )
    if (!record) throw new NotFoundError('No clock-in record for today')
    if (record.clock_out_time) throw new AppError('Already clocked out for today', 409, 'DUPLICATE')

    const inTime = new Date(record.clock_in_time)
    const hours = Math.max((now.getTime() - inTime.getTime()) / (1000 * 60 * 60), 0)
    const hoursWorked = Math.round(hours * 100) / 100

    await db.query(
        'UPDATE attendance SET clock_out_time = ?, hours_worked = ? WHERE id = ?',
        [now, hoursWorked, record.id]
    )

    return getAttendanceRecord(record.id)
}

async function getAttendanceRecord(id) {
    const [rows] = await db.query(
        `SELECT a.id, a.user_id, u.full_name, u.staff_position,
            a.work_date, a.clock_in_time, a.clock_out_time, a.hours_worked,
            a.status, a.created_at, a.updated_at
     FROM attendance a JOIN users u ON u.id = a.user_id
     WHERE a.id = ? LIMIT 1`,
        [id]
    )
    return rows?.[0]
}

async function getAttendanceHistory() {
    const [rows] = await db.query(
        `SELECT a.id, a.user_id, u.full_name, u.staff_position,
            a.work_date, a.clock_in_time, a.clock_out_time, a.hours_worked,
            a.status, a.created_at, a.updated_at
     FROM attendance a JOIN users u ON u.id = a.user_id
     ORDER BY a.work_date DESC, a.clock_in_time DESC LIMIT 500`
    )
    return rows
}

async function getMyTodayAttendance(userId) {
    if (!userId) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED')

    const today = new Date().toISOString().slice(0, 10)

    const [rows] = await db.query(
        `SELECT a.id, a.user_id, u.full_name, u.staff_position,
            a.work_date, a.clock_in_time, a.clock_out_time, a.hours_worked,
            a.status, a.created_at, a.updated_at
     FROM attendance a JOIN users u ON u.id = a.user_id
     WHERE a.user_id = ? AND a.work_date = ? LIMIT 1`,
        [userId, today]
    )
    return rows?.[0] || null
}

module.exports = { clockIn, clockOut, getAttendanceHistory, getMyTodayAttendance }
