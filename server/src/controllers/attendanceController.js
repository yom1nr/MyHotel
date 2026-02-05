const db = require('../config/db')

function isLate(clockInDate, thresholdHour = 9, thresholdMinute = 0) {
  const h = clockInDate.getHours()
  const m = clockInDate.getMinutes()
  if (h > thresholdHour) return true
  if (h === thresholdHour && m > thresholdMinute) return true
  return false
}

async function clockIn(req, res) {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : 0
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const now = new Date()
    const workDate = now.toISOString().slice(0, 10)

    const [[existing]] = await db.query(
      'SELECT id, clock_in_time, clock_out_time FROM attendance WHERE user_id = ? AND work_date = ? LIMIT 1',
      [userId, workDate]
    )

    if (existing?.id) {
      return res.status(409).json({
        success: false,
        message: 'Already clocked in for today',
      })
    }

    const status = isLate(now) ? 'late' : 'on_time'

    const insert = {
      user_id: userId,
      work_date: workDate,
      clock_in_time: now,
      status,
    }

    const [result] = await db.query('INSERT INTO attendance SET ?', insert)

    const [rows] = await db.query(
      `SELECT
        a.id,
        a.user_id,
        u.full_name,
        u.staff_position,
        a.work_date,
        a.clock_in_time,
        a.clock_out_time,
        a.hours_worked,
        a.status,
        a.created_at,
        a.updated_at
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE a.id = ?
      LIMIT 1`,
      [result.insertId]
    )

    return res.status(201).json({ success: true, data: rows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to clock in' })
  }
}

async function clockOut(req, res) {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : 0
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const now = new Date()
    const workDate = now.toISOString().slice(0, 10)

    const [rows] = await db.query(
      'SELECT id, clock_in_time, clock_out_time FROM attendance WHERE user_id = ? AND work_date = ? LIMIT 1',
      [userId, workDate]
    )

    const record = rows?.[0]
    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: 'No clock-in record for today' })
    }

    if (record.clock_out_time) {
      return res.status(409).json({
        success: false,
        message: 'Already clocked out for today',
      })
    }

    const inTime = new Date(record.clock_in_time)
    const hours = Math.max((now.getTime() - inTime.getTime()) / (1000 * 60 * 60), 0)
    const hoursWorked = Math.round(hours * 100) / 100

    await db.query(
      'UPDATE attendance SET clock_out_time = ?, hours_worked = ? WHERE id = ?',
      [now, hoursWorked, record.id]
    )

    const [outRows] = await db.query(
      `SELECT
        a.id,
        a.user_id,
        u.full_name,
        u.staff_position,
        a.work_date,
        a.clock_in_time,
        a.clock_out_time,
        a.hours_worked,
        a.status,
        a.created_at,
        a.updated_at
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE a.id = ?
      LIMIT 1`,
      [record.id]
    )

    return res.json({ success: true, data: outRows?.[0] })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to clock out' })
  }
}

async function getAttendanceHistory(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        a.id,
        a.user_id,
        u.full_name,
        u.staff_position,
        a.work_date,
        a.clock_in_time,
        a.clock_out_time,
        a.hours_worked,
        a.status,
        a.created_at,
        a.updated_at
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.work_date DESC, a.clock_in_time DESC
      LIMIT 500`
    )

    return res.json({ success: true, data: rows })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch attendance history' })
  }
}

async function getMyTodayAttendance(req, res) {
  try {
    const userId = req.user?.sub ? Number(req.user.sub) : 0
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const today = new Date().toISOString().slice(0, 10)

    const [rows] = await db.query(
      `SELECT
        a.id,
        a.user_id,
        u.full_name,
        u.staff_position,
        a.work_date,
        a.clock_in_time,
        a.clock_out_time,
        a.hours_worked,
        a.status,
        a.created_at,
        a.updated_at
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      WHERE a.user_id = ? AND a.work_date = ?
      LIMIT 1`,
      [userId, today]
    )

    return res.json({ success: true, data: rows?.[0] || null })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch attendance' })
  }
}

module.exports = {
  clockIn,
  clockOut,
  getAttendanceHistory,
  getMyTodayAttendance,
}
