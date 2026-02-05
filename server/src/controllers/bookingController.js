const db = require('../config/db')

function generateBookingCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `BK-${ts}-${rnd}`
}

function generateTransactionCode() {
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TR-${ts}-${rnd}`
}

function diffNights(checkInDate, checkOutDate) {
  const inDate = new Date(checkInDate)
  const outDate = new Date(checkOutDate)
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return null

  const msPerDay = 24 * 60 * 60 * 1000
  const utcIn = Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate())
  const utcOut = Date.UTC(outDate.getUTCFullYear(), outDate.getUTCMonth(), outDate.getUTCDate())
  const nights = Math.round((utcOut - utcIn) / msPerDay)
  return nights
}

async function createBooking(req, res) {
  let conn
  try {
    const {
      room_id,
      check_in_date,
      check_out_date,
      guest_full_name,
      guest_phone,
      guest_email,
      notes,
    } = req.body || {}

    const roomId = Number(room_id)
    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: 'room_id is required' })
    }

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'check_in_date and check_out_date are required',
      })
    }

    if (!guest_full_name || typeof guest_full_name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'guest_full_name is required',
      })
    }

    const nights = diffNights(check_in_date, check_out_date)
    if (!nights || nights <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range',
      })
    }

    conn = await db.getConnection()
    await conn.beginTransaction()

    const [roomRows] = await conn.query(
      'SELECT id, base_price, status FROM rooms WHERE id = ? LIMIT 1 FOR UPDATE',
      [roomId]
    )

    const room = roomRows?.[0]
    if (!room) {
      await conn.rollback()
      return res.status(404).json({ success: false, message: 'Room not found' })
    }

    if (room.status !== 'available') {
      await conn.rollback()
      return res.status(409).json({
        success: false,
        message: 'Room is not available',
      })
    }

    const [[overlapRow]] = await conn.query(
      `SELECT COUNT(*) AS overlapCount
       FROM bookings
       WHERE room_id = ?
         AND status IN ('pending','confirmed','checked_in')
         AND check_in_date < ?
         AND check_out_date > ?`,
      [roomId, check_out_date, check_in_date]
    )

    if (Number(overlapRow?.overlapCount || 0) > 0) {
      await conn.rollback()
      return res.status(409).json({
        success: false,
        message: 'Room is not available for selected dates',
      })
    }

    const totalAmount = Number(room.base_price) * nights
    const bookingCode = generateBookingCode()

    const userId = req.user?.sub ? Number(req.user.sub) : null

    const insert = {
      booking_code: bookingCode,
      user_id: userId || null,
      guest_full_name: guest_full_name.trim(),
      guest_phone: guest_phone ?? null,
      guest_email: guest_email ?? null,
      room_id: roomId,
      check_in_date,
      check_out_date,
      nights,
      total_amount: totalAmount,
      status: 'pending',
      notes: notes ?? null,
    }

    const [result] = await conn.query('INSERT INTO bookings SET ?', insert)
    const bookingId = result.insertId

    const transactionInsert = {
      booking_id: bookingId,
      transaction_code: generateTransactionCode(),
      type: 'payment',
      category: 'booking',
      method: 'cash',
      amount: totalAmount,
      status: 'paid',
      reference_note: bookingCode,
    }

    await conn.query('INSERT INTO transactions SET ?', transactionInsert)

    await conn.query('UPDATE rooms SET status = ? WHERE id = ?', ['reserved', roomId])

    await conn.commit()

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.guest_full_name,
        b.guest_phone,
        b.guest_email,
        b.room_id,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.total_amount,
        b.status,
        b.notes,
        b.created_at,
        b.updated_at,
        r.room_number,
        r.room_type,
        r.base_price,
        u.full_name AS user_full_name,
        u.email AS user_email
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.id = ?
      LIMIT 1`,
      [bookingId]
    )

    return res.status(201).json({ success: true, data: rows?.[0] })
  } catch (_error) {
    try {
      if (conn) await conn.rollback()
    } catch (_rollbackError) {
      // ignore
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
    })
  } finally {
    if (conn) conn.release()
  }
}

async function createPublicBooking(req, res) {
  let conn
  try {
    const {
      room_id,
      check_in_date,
      check_out_date,
      guest_name,
      guest_phone,
      guest_email,
    } = req.body || {}

    const roomId = Number(room_id)
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'room_id is required' })
    }

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        message: 'check_in_date and check_out_date are required',
      })
    }

    if (!guest_name || typeof guest_name !== 'string' || !guest_name.trim()) {
      return res.status(400).json({ success: false, message: 'guest_name is required' })
    }

    if (!guest_phone || typeof guest_phone !== 'string' || !guest_phone.trim()) {
      return res.status(400).json({ success: false, message: 'guest_phone is required' })
    }

    const nights = diffNights(check_in_date, check_out_date)
    if (!nights || nights <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid date range' })
    }

    conn = await db.getConnection()
    await conn.beginTransaction()

    const [roomRows] = await conn.query(
      'SELECT id, base_price, status FROM rooms WHERE id = ? LIMIT 1 FOR UPDATE',
      [roomId]
    )

    const room = roomRows?.[0]
    if (!room) {
      await conn.rollback()
      return res.status(404).json({ success: false, message: 'Room not found' })
    }

    if (room.status !== 'available') {
      await conn.rollback()
      return res.status(409).json({ success: false, message: 'Room is not available' })
    }

    const [[overlapRow]] = await conn.query(
      `SELECT COUNT(*) AS overlapCount
       FROM bookings
       WHERE room_id = ?
         AND status IN ('pending','confirmed','checked_in')
         AND check_in_date < ?
         AND check_out_date > ?`,
      [roomId, check_out_date, check_in_date]
    )

    if (Number(overlapRow?.overlapCount || 0) > 0) {
      await conn.rollback()
      return res.status(409).json({
        success: false,
        message: 'Room is not available for selected dates',
      })
    }

    const totalAmount = Number(room.base_price) * nights
    const bookingCode = generateBookingCode()

    const insert = {
      booking_code: bookingCode,
      user_id: null,
      guest_full_name: guest_name.trim(),
      guest_phone: guest_phone.trim(),
      guest_email: guest_email ? String(guest_email).trim() : null,
      room_id: roomId,
      check_in_date,
      check_out_date,
      nights,
      total_amount: totalAmount,
      status: 'pending',
      notes: null,
    }

    await conn.query('INSERT INTO bookings SET ?', insert)
    await conn.query('UPDATE rooms SET status = ? WHERE id = ?', ['reserved', roomId])

    await conn.commit()

    return res.status(201).json({ success: true, data: { booking_code: bookingCode } })
  } catch (_error) {
    try {
      if (conn) await conn.rollback()
    } catch (_rollbackError) {
      // ignore
    }

    return res.status(500).json({ success: false, message: 'Failed to create booking' })
  } finally {
    if (conn) conn.release()
  }
}

async function updateBookingStatus(req, res) {
  let conn
  try {
    const id = Number(req.params.id)
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid booking id' })
    }

    const { status } = req.body || {}
    if (!status || typeof status !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'status is required' })
    }

    const normalized = status.toLowerCase()
    const allowed = new Set(['confirmed', 'checked_in', 'checked_out', 'cancelled'])
    if (!allowed.has(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      })
    }

    conn = await db.getConnection()
    await conn.beginTransaction()

    const [bookingRows] = await conn.query(
      'SELECT id, room_id, status FROM bookings WHERE id = ? LIMIT 1 FOR UPDATE',
      [id]
    )

    const booking = bookingRows?.[0]
    if (!booking) {
      await conn.rollback()
      return res
        .status(404)
        .json({ success: false, message: 'Booking not found' })
    }

    await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [normalized, id])

    if (normalized === 'checked_in') {
      await conn.query('UPDATE rooms SET status = ? WHERE id = ?', [
        'occupied',
        booking.room_id,
      ])
    }

    if (normalized === 'checked_out' || normalized === 'cancelled') {
      await conn.query('UPDATE rooms SET status = ? WHERE id = ?', [
        'available',
        booking.room_id,
      ])
    }

    await conn.commit()

    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.guest_full_name,
        b.guest_phone,
        b.guest_email,
        b.room_id,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.total_amount,
        b.status,
        b.notes,
        b.created_at,
        b.updated_at,
        r.room_number,
        r.room_type,
        r.base_price,
        u.full_name AS user_full_name,
        u.email AS user_email
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE b.id = ?
      LIMIT 1`,
      [id]
    )

    return res.json({ success: true, data: rows?.[0] })
  } catch (_error) {
    try {
      if (conn) await conn.rollback()
    } catch (_rollbackError) {
      // ignore
    }

    return res
      .status(500)
      .json({ success: false, message: 'Failed to update booking status' })
  } finally {
    if (conn) conn.release()
  }
}

async function getBookings(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT
        b.id,
        b.booking_code,
        b.user_id,
        b.guest_full_name,
        b.guest_phone,
        b.guest_email,
        b.room_id,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.total_amount,
        b.status,
        b.notes,
        b.created_at,
        b.updated_at,
        r.room_number,
        r.room_type,
        r.base_price,
        u.full_name AS user_full_name,
        u.email AS user_email
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY b.created_at DESC
      LIMIT 200`
    )

    return res.json({ success: true, data: rows })
  } catch (_error) {
    return res
      .status(500)
      .json({ success: false, message: 'Failed to fetch bookings' })
  }
}

async function getBookingByCode(req, res) {
  try {
    const code = String(req.query.code || '').trim()
    const phone = String(req.query.phone || '').trim()

    if (!code || !phone) {
      return res.status(400).json({
        success: false,
        message: 'code and phone are required',
      })
    }

    const [rows] = await db.query(
      `SELECT
        b.booking_code,
        b.guest_full_name,
        b.check_in_date,
        b.check_out_date,
        b.nights,
        b.total_amount,
        b.status,
        r.room_number,
        r.room_type
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      WHERE b.booking_code = ?
        AND b.guest_phone = ?
      LIMIT 1`,
      [code, phone]
    )

    const booking = rows?.[0]
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    return res.json({ success: true, data: booking })
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch booking status',
    })
  }
}

module.exports = {
  createBooking,
  createPublicBooking,
  getBookings,
  updateBookingStatus,
  getBookingByCode,
}
