const db = require('../config/db')
const { NotFoundError, ValidationError, AppError } = require('../utils/AppError')

function generateBookingCode() {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `BK-${ts}-${rand}`
}

function generateTransactionCode() {
    const ts = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `TX-${ts}-${rand}`
}

function diffNights(checkInDate, checkOutDate) {
    const inDate = new Date(checkInDate)
    const outDate = new Date(checkOutDate)
    if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0
    const msPerDay = 24 * 60 * 60 * 1000
    const utcIn = Date.UTC(inDate.getUTCFullYear(), inDate.getUTCMonth(), inDate.getUTCDate())
    const utcOut = Date.UTC(outDate.getUTCFullYear(), outDate.getUTCMonth(), outDate.getUTCDate())
    const nights = Math.round((utcOut - utcIn) / msPerDay)
    return nights > 0 ? nights : 0
}

async function createBooking(data, userId) {
    const roomId = Number(data.room_id)
    if (!roomId) throw new ValidationError('room_id is required')
    if (!data.check_in_date || !data.check_out_date) throw new ValidationError('check_in_date and check_out_date are required')

    const nights = diffNights(data.check_in_date, data.check_out_date)
    if (nights <= 0) throw new ValidationError('check_out_date must be after check_in_date')

    const [[room]] = await db.query('SELECT id, base_price, status FROM rooms WHERE id = ? LIMIT 1', [roomId])
    if (!room) throw new NotFoundError('Room')
    if (room.status !== 'available') throw new AppError('Room is not available', 409, 'ROOM_UNAVAILABLE')

    const totalAmount = nights * Number(room.base_price)
    const bookingCode = generateBookingCode()

    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        const [bookingResult] = await conn.query('INSERT INTO bookings SET ?', {
            booking_code: bookingCode,
            user_id: userId || null,
            guest_full_name: (data.guest_full_name || '').trim(),
            guest_phone: data.guest_phone || null,
            guest_email: data.guest_email || null,
            room_id: roomId,
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            nights,
            total_amount: totalAmount,
            status: 'confirmed',
            notes: data.notes || null,
        })

        await conn.query("UPDATE rooms SET status = 'reserved' WHERE id = ?", [roomId])

        const txCode = generateTransactionCode()
        await conn.query('INSERT INTO transactions SET ?', {
            booking_id: bookingResult.insertId,
            transaction_code: txCode,
            type: 'payment',
            method: 'cash',
            amount: totalAmount,
            status: 'paid',
            transaction_date: new Date(),
        })

        await conn.commit()

        const [rows] = await db.query(
            `SELECT b.*, r.room_number, r.room_type FROM bookings b
       JOIN rooms r ON r.id = b.room_id WHERE b.id = ? LIMIT 1`,
            [bookingResult.insertId]
        )
        return rows?.[0]
    } catch (err) {
        await conn.rollback()
        throw err
    } finally {
        conn.release()
    }
}

async function createPublicBooking(data) {
    const roomId = Number(data.room_id)
    if (!roomId) throw new ValidationError('room_id is required')
    if (!data.check_in_date || !data.check_out_date) throw new ValidationError('Dates are required')
    if (!data.guest_name || !data.guest_phone) throw new ValidationError('Guest name and phone are required')

    const nights = diffNights(data.check_in_date, data.check_out_date)
    if (nights <= 0) throw new ValidationError('Invalid dates')

    const [[room]] = await db.query('SELECT id, base_price, status FROM rooms WHERE id = ? LIMIT 1', [roomId])
    if (!room) throw new NotFoundError('Room')
    if (room.status !== 'available') throw new AppError('Room is not available', 409, 'ROOM_UNAVAILABLE')

    const totalAmount = nights * Number(room.base_price)
    const bookingCode = generateBookingCode()

    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        await conn.query('INSERT INTO bookings SET ?', {
            booking_code: bookingCode,
            user_id: null,
            guest_full_name: data.guest_name.trim(),
            guest_phone: data.guest_phone.trim(),
            guest_email: data.guest_email || null,
            room_id: roomId,
            check_in_date: data.check_in_date,
            check_out_date: data.check_out_date,
            nights,
            total_amount: totalAmount,
            status: 'pending',
            notes: null,
        })

        await conn.query("UPDATE rooms SET status = 'reserved' WHERE id = ?", [roomId])
        await conn.commit()

        return { booking_code: bookingCode }
    } catch (err) {
        await conn.rollback()
        throw err
    } finally {
        conn.release()
    }
}

async function getBookings() {
    const [rows] = await db.query(
        `SELECT b.id, b.booking_code, b.user_id, b.guest_full_name, b.guest_phone,
            b.guest_email, b.room_id, b.check_in_date, b.check_out_date,
            b.nights, b.total_amount, b.status, b.notes, b.created_at, b.updated_at,
            r.room_number, r.room_type
     FROM bookings b JOIN rooms r ON r.id = b.room_id
     ORDER BY b.created_at DESC LIMIT 500`
    )
    return rows
}

async function updateBookingStatus(id, status, paymentMethod = 'cash') {
    const numId = Number(id)
    if (!numId) throw new ValidationError('Invalid booking id')

    const [[booking]] = await db.query(
        'SELECT id, room_id, status, total_amount FROM bookings WHERE id = ? LIMIT 1',
        [numId]
    )
    if (!booking) throw new NotFoundError('Booking')

    const conn = await db.getConnection()
    try {
        await conn.beginTransaction()

        await conn.query('UPDATE bookings SET status = ? WHERE id = ?', [status, numId])

        if (status === 'checked_in') {
            await conn.query("UPDATE rooms SET status = 'occupied' WHERE id = ?", [booking.room_id])
        } else if (status === 'checked_out' || status === 'cancelled') {
            await conn.query("UPDATE rooms SET status = 'available' WHERE id = ?", [booking.room_id])
        }

        if (status === 'cancelled' && booking.status !== 'cancelled') {
            const txCode = generateTransactionCode()
            await conn.query('INSERT INTO transactions SET ?', {
                booking_id: numId,
                transaction_code: txCode,
                type: 'refund',
                method: 'cash',
                amount: Number(booking.total_amount),
                status: 'paid',
                transaction_date: new Date(),
                reference_note: 'Auto refund on cancellation',
            })
        }

        if (status === 'checked_out' && booking.status !== 'checked_out') {
            const [existingTx] = await conn.query(
                "SELECT id FROM transactions WHERE booking_id = ? AND type = 'payment' LIMIT 1",
                [numId]
            )

            if (existingTx.length === 0) {
                const txCode = generateTransactionCode()
                await conn.query('INSERT INTO transactions SET ?', {
                    booking_id: numId,
                    transaction_code: txCode,
                    type: 'payment',
                    method: paymentMethod,
                    amount: Number(booking.total_amount),
                    status: 'paid',
                    transaction_date: new Date(),
                    reference_note: 'Auto payment on checkout',
                })
            }
        }

        await conn.commit()

        const [rows] = await db.query(
            `SELECT b.*, r.room_number, r.room_type FROM bookings b
       JOIN rooms r ON r.id = b.room_id WHERE b.id = ? LIMIT 1`,
            [numId]
        )
        return rows?.[0]
    } catch (err) {
        await conn.rollback()
        throw err
    } finally {
        conn.release()
    }
}

async function getBookingByCode(code, phone) {
    if (!code) throw new ValidationError('Booking code is required')
    if (!phone) throw new ValidationError('Phone number is required')

    const [rows] = await db.query(
        `SELECT b.booking_code, b.guest_full_name, b.check_in_date, b.check_out_date,
            b.nights, b.total_amount, b.status, r.room_number, r.room_type
     FROM bookings b JOIN rooms r ON r.id = b.room_id
     WHERE b.booking_code = ? AND b.guest_phone = ? LIMIT 1`,
        [code.trim(), phone.trim()]
    )

    if (!rows?.[0]) throw new NotFoundError('Booking')
    return rows[0]
}

module.exports = { createBooking, createPublicBooking, getBookings, updateBookingStatus, getBookingByCode }
